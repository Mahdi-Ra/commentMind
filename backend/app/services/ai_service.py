import json
import logging
import time
from typing import Any, Optional
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.comment import INTENT_TAXONOMY

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

TONE_MAP = {
    "friendly": "friendly, warm, and helpful",
    "formal": "formal, respectful, and polished",
    "professional": "professional, precise, and concise",
}

logger = logging.getLogger(__name__)

INTENT_LABELS = list(INTENT_TAXONOMY)
SENTIMENT_LABELS = ["positive", "negative", "neutral"]
URGENCY_LABELS = ["low", "normal", "high"]
ENTITY_TYPES = {"product", "price", "quantity", "order_reference", "delivery"}

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
  "approval_confidence": <number between 0 and 1 indicating confidence the comment is safe to publish>,
  "moderation_reason": <one concise sentence explaining the spam or safety decision>,
  "intent": <one controlled intent category>,
  "intent_confidence": <number between 0 and 1 for classification confidence only>,
  "intent_reason": <short explanation of why this intent fits>,
  "sentiment": <"positive"|"negative"|"neutral">,
  "sentiment_score": <number between -1 and 1; negative is unfavorable, positive is favorable>,
  "urgency": <"low"|"normal"|"high">,
  "detected_entities": <array of {"type": "product"|"price"|"quantity"|"order_reference"|"delivery", "value": "explicit text from the comment"}>,
  "should_reply": <true|false>,
  "reply": <reply text or null if no reply should be sent>
}}
"""

    try:
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
        raw = json.loads(response.choices[0].message.content or "{}")
        if not isinstance(raw, dict):
            raise ValueError("AI response was not a JSON object")
        return _normalize_analysis(raw, processing_time_ms=int((time.time() - start) * 1000))
    except Exception as exc:
        logger.warning("Comment analysis failed; keeping comment for review: %s", exc)
        return _fallback_analysis(int((time.time() - start) * 1000))


def _clamp(value: Any, default: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    try:
        if isinstance(value, bool):
            raise ValueError
        return max(minimum, min(maximum, float(value)))
    except (TypeError, ValueError):
        return default


def _short_text(value: Any, fallback: str, maximum: int = 320) -> str:
    text = value.strip() if isinstance(value, str) else ""
    return text[:maximum] if text else fallback


def _normalize_entities(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    entities: list[dict[str, str]] = []
    for item in value[:12]:
        if not isinstance(item, dict):
            continue
        entity_type = item.get("type")
        entity_value = item.get("value")
        if entity_type in ENTITY_TYPES and isinstance(entity_value, str) and entity_value.strip():
            entities.append({"type": entity_type, "value": entity_value.strip()[:160]})
    return entities


def _normalize_analysis(raw: dict[str, Any], processing_time_ms: int) -> dict:
    spam_score = _clamp(raw.get("spam_score"), 0.1)
    intent = raw.get("intent") if raw.get("intent") in INTENT_TAXONOMY else "other"
    sentiment = raw.get("sentiment") if raw.get("sentiment") in SENTIMENT_LABELS else "neutral"
    urgency = raw.get("urgency") if raw.get("urgency") in URGENCY_LABELS else "normal"
    reply = raw.get("reply") if isinstance(raw.get("reply"), str) else None
    return {
        "spam_score": spam_score,
        "approval_confidence": _clamp(raw.get("approval_confidence"), max(0.0, 1 - spam_score)),
        "moderation_reason": _short_text(raw.get("moderation_reason"), "The comment was evaluated against this page's content and moderation policy."),
        "intent": intent,
        "intent_confidence": _clamp(raw.get("intent_confidence"), 0.0),
        "intent_reason": _short_text(raw.get("intent_reason"), "The intent could not be determined with confidence."),
        "sentiment": sentiment,
        "sentiment_score": _clamp(raw.get("sentiment_score"), 0.0, -1.0, 1.0),
        "urgency": urgency,
        "detected_entities": _normalize_entities(raw.get("detected_entities")),
        "should_reply": bool(raw.get("should_reply")),
        "reply": reply.strip()[:5000] if reply and reply.strip() else None,
        "processing_time_ms": processing_time_ms,
    }


def _fallback_analysis(processing_time_ms: int) -> dict:
    return {
        "spam_score": 0.1,
        "approval_confidence": 0.0,
        "moderation_reason": "AI analysis was unavailable, so this comment needs human review.",
        "intent": "other",
        "intent_confidence": 0.0,
        "intent_reason": "AI analysis was unavailable.",
        "sentiment": "neutral",
        "sentiment_score": 0.0,
        "urgency": "normal",
        "detected_entities": [],
        "should_reply": False,
        "reply": None,
        "processing_time_ms": processing_time_ms,
    }


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
2. Estimate confidence the comment is legitimate and safe to publish (approval_confidence).
3. Give a concise moderation reason that refers only to observable comment or page context.
4. Classify the writer's intent from the controlled taxonomy below and estimate intent_confidence.
5. Detect comment sentiment, sentiment_score, urgency, and only explicitly mentioned entities.
6. Write an appropriate reply when needed.

## Intent taxonomy
- purchase_intent: a clear desire to buy, order, or find where to purchase.
- product_inquiry: product features, specifications, fit, variants, or comparison questions.
- pricing_inquiry: price, cost, discount, coupon, or payment questions.
- shipping_inquiry: delivery speed, shipping destinations, shipping cost, or tracking questions before purchase.
- order_issue: an existing order is missing, incorrect, delayed, damaged, or needs order support.
- complaint: a specific dissatisfaction with product, service, or business operations.
- technical_question: installation, setup, troubleshooting, compatibility, or technical use.
- contact_request: asks for a call, contact details, or direct contact from the team.
- positive_feedback: praise, appreciation, or a positive experience.
- negative_feedback: negative opinion without a specific service complaint.
- general_question: a question that does not fit a more specific category.
- spam: irrelevant promotion, suspicious links, or unwanted advertising.
- other: use only when no category is reasonably supported.

## Classification rules
- intent_confidence measures intent classification only; do not copy moderation confidence.
- Lower intent_confidence for ambiguous comments. Use other when genuinely unclear.
- Do not infer products, prices, quantities, order IDs, or delivery facts. Include detected_entities only when the visitor explicitly wrote them.
- Use high urgency only for time-sensitive order problems, safety concerns, or an explicit urgent request.

## Reply tone: {tone_desc}
## Reply language: {lang_desc}

## Spam rules
- Advertising or commercial links should usually score above 0.9.
- Abusive content should usually score above 0.85.
- Irrelevant content should usually score above 0.75.
- Genuine customer comments should usually score below 0.3.

## Approval confidence rules
- Clear, genuine questions and ordinary constructive comments should usually be at least 0.9.
- Comments that are ambiguous, potentially harmful, or missing important context should be below 0.9.
- Spam, abusive, or clearly irrelevant comments should be below 0.2.

## Reply rules
- If the comment asks a question, answer it.
- If it is a complaint, respond empathetically and suggest a next step.
- If it is praise, thank the customer.
- If it is spam, set reply to null.
- Keep replies short, useful, and on-brand.
- If page context includes Search Console queries, use them only when they naturally clarify
  the answer. Never force keywords, repeat phrases, or write for search engines over people.
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
