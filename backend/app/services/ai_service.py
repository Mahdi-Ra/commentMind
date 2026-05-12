import time
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

TONE_MAP = {
    "friendly": "دوستانه، صمیمی و گرم",
    "formal": "رسمی، محترمانه و حرفه‌ای",
    "professional": "تخصصی، دقیق و مختصر",
}

INTENT_LABELS = ["question", "complaint", "praise", "spam", "other"]
SENTIMENT_LABELS = ["positive", "negative", "neutral"]


async def analyze_comment(
    content: str,
    site_name: str,
    tone: str = "friendly",
    language: str = "fa",
    knowledge_context: str = "",
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
        custom_instructions=custom_instructions,
    )

    user_prompt = f"""
کامنت زیر را تحلیل کن و JSON برگردان:

کامنت: "{content}"

باید دقیقاً این JSON را برگردانی (بدون هیچ متن اضافه):
{{
  "spam_score": <عدد بین 0 تا 1 - احتمال اسپم بودن>,
  "intent": <"question"|"complaint"|"praise"|"spam"|"other">,
  "sentiment": <"positive"|"negative"|"neutral">,
  "should_reply": <true|false - آیا باید جواب داد>,
  "reply": <"متن جواب" یا null اگر نباید جواب داد>
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
    custom_instructions: str,
) -> str:
    tone_desc = TONE_MAP.get(tone, TONE_MAP["friendly"])
    lang_desc = "فارسی" if language == "fa" else "English"

    prompt = f"""تو دستیار هوشمند سایت «{site_name}» هستی و وظیفه‌ات مدیریت کامنت‌هاست.

## وظایف تو:
1. تشخیص اسپم بودن کامنت (spam_score)
2. تشخیص هدف نویسنده (intent)
3. تشخیص احساس کامنت (sentiment)
4. نوشتن جواب مناسب (در صورت نیاز)

## لحن جواب: {tone_desc}
## زبان جواب: {lang_desc}

## قوانین اسپم:
- تبلیغات و لینک‌های تجاری → spam_score بالای 0.9
- محتوای توهین‌آمیز → spam_score بالای 0.85
- محتوای نامربوط → spam_score بالای 0.75
- کامنت‌های واقعی → spam_score پایین‌تر از 0.3

## قوانین جواب:
- اگه سوال داره → حتماً جواب بده
- اگه شکایت داره → با همدلی جواب بده و راه‌حل پیشنهاد بده
- اگه تعریف کرده → تشکر کن
- اگه اسپمه → reply: null
- جواب‌ها کوتاه، مفید و صمیمی باشند
"""

    if knowledge_context:
        prompt += f"\n## اطلاعات سایت (برای جواب دادن از اینها استفاده کن):\n{knowledge_context}\n"

    if custom_instructions:
        prompt += f"\n## دستورالعمل‌های خاص ادمین:\n{custom_instructions}\n"

    return prompt


async def generate_standalone_reply(
    content: str,
    site_name: str,
    tone: str = "friendly",
    language: str = "fa",
    knowledge_context: str = "",
) -> str:
    """Generate just a reply for a comment"""
    tone_desc = TONE_MAP.get(tone, TONE_MAP["friendly"])
    lang_desc = "فارسی" if language == "fa" else "English"

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": f"تو ادمین سایت «{site_name}» هستی. با لحن {tone_desc} به کامنت‌ها جواب بده. زبان: {lang_desc}.\n{knowledge_context}",
            },
            {
                "role": "user",
                "content": f"به این کامنت جواب بده:\n{content}",
            },
        ],
        temperature=0.6,
        max_tokens=400,
    )

    return response.choices[0].message.content.strip()
