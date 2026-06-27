from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import Comment

PURCHASE_KEYWORDS = [
    "price",
    "buy",
    "order",
    "discount",
    "available",
    "shipping",
    "delivery",
    "warranty",
]

GAP_TOPICS = {
    "warranty": ["warranty", "guarantee"],
    "delivery": ["shipping", "delivery"],
    "returns": ["return", "refund", "exchange"],
    "pricing": ["price", "discount", "coupon"],
    "availability": ["available", "stock", "inventory", "sold out"],
}

NEGATIVE_KEYWORDS = ["bad", "angry", "complaint", "broken", "unhappy", "late", "terrible"]


@dataclass
class InsightScope:
    site_ids: list[str]


def _now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _has_any(text: str, keywords: list[str]) -> bool:
    lower = text.lower()
    return any(keyword.lower() in lower for keyword in keywords)


def _priority_reason(comment: Comment) -> str | None:
    text = comment.content or ""
    if comment.status in ("pending", "uncertain"):
        return "Needs human review"
    if comment.sentiment == "negative" or comment.intent == "complaint" or _has_any(text, NEGATIVE_KEYWORDS):
        return "Customer risk"
    if comment.intent == "question" and _has_any(text, PURCHASE_KEYWORDS):
        return "Buying intent"
    if comment.spam_score is not None and 0.55 <= comment.spam_score < 0.85:
        return "Low confidence moderation"
    return None


def _suggest_faq(question: str) -> str:
    if _has_any(question, GAP_TOPICS["warranty"]):
        return "What warranty or guarantee does this product include?"
    if _has_any(question, GAP_TOPICS["delivery"]):
        return "How long does delivery take and what shipping options are available?"
    if _has_any(question, GAP_TOPICS["returns"]):
        return "What is the return or exchange policy?"
    if _has_any(question, GAP_TOPICS["pricing"]):
        return "Are discounts, installment payments, or special prices available?"
    if _has_any(question, GAP_TOPICS["availability"]):
        return "Is this product currently available?"
    return question.strip()[:120]


async def build_insights(db: AsyncSession, scope: InsightScope) -> dict:
    if not scope.site_ids:
        return _empty_insights()

    since = _now_naive() - timedelta(days=7)
    result = await db.execute(
        select(Comment)
        .where(Comment.site_id.in_(scope.site_ids), Comment.created_at >= since)
        .order_by(desc(Comment.created_at))
        .limit(500)
    )
    comments = list(result.scalars().all())

    handled = [c for c in comments if c.status in ("approved", "replied", "spam")]
    replied = [c for c in comments if c.status == "replied"]
    spam = [c for c in comments if c.status == "spam"]
    questions = [c for c in comments if c.intent == "question" or "?" in (c.content or "")]
    purchase = [c for c in comments if _has_any(c.content or "", PURCHASE_KEYWORDS)]
    negative = [
        c
        for c in comments
        if c.sentiment == "negative" or c.intent == "complaint" or _has_any(c.content or "", NEGATIVE_KEYWORDS)
    ]

    minutes_saved = len(handled) * 4
    support_value = round((minutes_saved / 60) * 18, 2)

    topic_counts = Counter()
    topic_examples: dict[str, str] = {}
    for comment in questions:
        for topic, keywords in GAP_TOPICS.items():
            if _has_any(comment.content or "", keywords):
                topic_counts[topic] += 1
                topic_examples.setdefault(topic, comment.content)

    queue = []
    for comment in comments:
        reason = _priority_reason(comment)
        if reason:
            queue.append(
                {
                    "id": comment.id,
                    "site_id": comment.site_id,
                    "reason": reason,
                    "author_name": comment.author_name,
                    "content": comment.content,
                    "status": comment.status,
                    "sentiment": comment.sentiment,
                    "created_at": comment.created_at,
                }
            )
    queue = queue[:8]

    faq_questions = []
    seen_faq = set()
    for comment in questions:
        faq = _suggest_faq(comment.content or "")
        if faq and faq not in seen_faq:
            seen_faq.add(faq)
            faq_questions.append({"question": faq, "source_comment": comment.content, "site_id": comment.site_id})
        if len(faq_questions) >= 6:
            break

    confidence = {
        "auto_publish": len([c for c in comments if c.status in ("approved", "replied") and (c.spam_score or 0) < 0.25]),
        "needs_review": len([c for c in comments if c.status in ("pending", "uncertain")]),
        "do_not_answer": len(spam),
    }

    top_gap = topic_counts.most_common(1)[0] if topic_counts else None
    weekly_summary = (
        f"Handled {len(handled)} comments, blocked {len(spam)} spam, answered {len(replied)} with AI, "
        f"and found {len(purchase)} buying-intent opportunities."
    )
    suggested_action = (
        f"Add a knowledge-base entry about {top_gap[0]}."
        if top_gap
        else "Add your most common shipping, warranty, and return policies to the knowledge base."
    )

    return {
        "roi": {
            "comments_handled": len(handled),
            "hours_saved": round(minutes_saved / 60, 1),
            "questions_answered": len(replied),
            "estimated_support_value_usd": support_value,
        },
        "lost_sales": {
            "count": len(purchase),
            "examples": [
                {"id": c.id, "site_id": c.site_id, "content": c.content, "status": c.status}
                for c in purchase[:5]
            ],
        },
        "confidence": confidence,
        "knowledge_gaps": [
            {
                "topic": topic,
                "count": count,
                "example": topic_examples.get(topic),
                "suggestion": f"Add a clear {topic} answer to your knowledge base.",
            }
            for topic, count in topic_counts.most_common(5)
        ],
        "suggested_faqs": faq_questions,
        "comment_funnel": {
            "questions": len(questions),
            "complaints": len([c for c in comments if c.intent == "complaint"]),
            "purchase_intent": len(purchase),
            "spam": len(spam),
            "praise": len([c for c in comments if c.intent == "praise"]),
        },
        "review_queue": queue,
        "risk_radar": {
            "negative_comments": len(negative),
            "unanswered_complaints": len([c for c in negative if c.status in ("pending", "uncertain")]),
            "repeated_issue": top_gap[0] if top_gap else None,
        },
        "weekly_report": {
            "summary": weekly_summary,
            "suggested_action": suggested_action,
        },
    }


def _empty_insights() -> dict:
    return {
        "roi": {"comments_handled": 0, "hours_saved": 0, "questions_answered": 0, "estimated_support_value_usd": 0},
        "lost_sales": {"count": 0, "examples": []},
        "confidence": {"auto_publish": 0, "needs_review": 0, "do_not_answer": 0},
        "knowledge_gaps": [],
        "suggested_faqs": [],
        "comment_funnel": {"questions": 0, "complaints": 0, "purchase_intent": 0, "spam": 0, "praise": 0},
        "review_queue": [],
        "risk_radar": {"negative_comments": 0, "unanswered_complaints": 0, "repeated_issue": None},
        "weekly_report": {"summary": "No comments yet.", "suggested_action": "Connect a site to start collecting insights."},
    }
