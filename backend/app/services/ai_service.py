import time
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

TONE_MAP = {
    "friendly": "friendly, warm, and helpful",
    "formal": "formal, respectful, and polished",
    "professional": "professional, precise, and concise",
}

INTENT_LABELS = ["question", "complaint", "praise", "spam", "other"]
SENTIMENT_LABELS = ["positive", "negative", "neutral"]

LANGUAGE_MAP = {
    "en": "English",
    "fa": "Persian (Farsi)",
    "ar": "Arabic",
    "tr": "Turkish",
    "de": "German",
}


async def analyze_comment(
    content: str,
    site_name: str,
    tone: str = "friendly",
    language: str = "en",
    knowledge_context: str = "",
    page_context: str = "",
    custom_instructions: str = "",
) -> dict:
    """
    Full analysis: spam detection + intent + sentiment + reply generation
    Returns a dict with all fields
    """
    start = time.time()

    system_prompt = _build_system_prompt(
        site_name=site_name,
        tone=tone,
        language=language,
        knowledge_context=knowledge_context,
        page_context=page_context,
        custom_instructions=custom_instructions,
    )

    user_prompt = f"""
Analyze the following website comment and return JSON.

Comment: "{content}"

Return exactly this JSON shape with no extra text:
{{
  "spam_score": <number between 0 and 1 indicating spam probability>,
  "intent": <"question"|"complaint"|"praise"|"spam"|"other">,
  "sentiment": <"positive"|"negative"|"neutral">,
  "should_reply": <true|false>,
  "reply": <reply text or null if no reply should be sent>
}}
"""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        response_format={"type": "json_object"},
        max_tokens=800,
    )

    elapsed_ms = int((time.time() - start) * 1000)
    
    import json
    result = json.loads(response.choices[0].message.content)
    result["processing_time_ms"] = elapsed_ms
    
    # Ensure defaults
    result.setdefault("spam_score", 0.1)
    result.setdefault("intent", "other")
    result.setdefault("sentiment", "neutral")
    result.setdefault("should_reply", True)
    result.setdefault("reply", None)

    return result


def _build_system_prompt(
    site_name: str,
    tone: str,
    language: str,
    knowledge_context: str,
    page_context: str,
    custom_instructions: str,
) -> str:
    tone_desc = TONE_MAP.get(tone, TONE_MAP["friendly"])
    lang_desc = LANGUAGE_MAP.get(language, LANGUAGE_MAP["en"])

    prompt = f"""You are the AI comment assistant for "{site_name}".

## Your tasks
1. Estimate whether the comment is spam (spam_score).
2. Detect the writer's intent (intent).
3. Detect comment sentiment (sentiment).
4. Write an appropriate reply when needed.

## Reply tone: {tone_desc}
## Reply language: {lang_desc}

## Spam rules
- Advertising or commercial links should usually score above 0.9.
- Abusive content should usually score above 0.85.
- Irrelevant content should usually score above 0.75.
- Genuine customer comments should usually score below 0.3.

## Reply rules
- If the comment asks a question, answer it.
- If it is a complaint, respond empathetically and suggest a next step.
- If it is praise, thank the customer.
- If it is spam, set reply to null.
- Keep replies short, useful, and on-brand.
"""

    if knowledge_context:
        prompt += f"\n## Site knowledge to use when replying:\n{knowledge_context}\n"

    if page_context:
        prompt += f"\n## Page/product context for this comment:\n{page_context}\n"

    if custom_instructions:
        prompt += f"\n## Admin instructions:\n{custom_instructions}\n"

    return prompt


async def generate_standalone_reply(
    content: str,
    site_name: str,
    tone: str = "friendly",
    language: str = "en",
    knowledge_context: str = "",
) -> str:
    """Generate just a reply for a comment"""
    tone_desc = TONE_MAP.get(tone, TONE_MAP["friendly"])
    lang_desc = LANGUAGE_MAP.get(language, LANGUAGE_MAP["en"])

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": f"You are the site admin for \"{site_name}\". Reply to comments in a {tone_desc} tone. Language: {lang_desc}.\n{knowledge_context}",
            },
            {
                "role": "user",
                "content": f"Reply to this comment:\n{content}",
            },
        ],
        temperature=0.6,
        max_tokens=400,
    )

    return response.choices[0].message.content.strip()
