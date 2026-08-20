from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, Integer

from app.models.comment import Comment
from app.models.site import Site
from app.schemas.comment import CommentSubmit, CommentResult, CommentStats
from app.services.ai_service import analyze_comment
from app.services.embedding_service import get_relevant_chunks


def determine_comment_status(site: Site, analysis: dict) -> tuple[str, float]:
    """Apply one moderation policy for both synchronous and worker processing."""
    spam_score = max(0.0, min(1.0, float(analysis.get("spam_score", 0.1))))
    approval_confidence = max(
        0.0,
        min(1.0, float(analysis.get("approval_confidence", 1 - spam_score))),
    )

    if spam_score >= site.spam_threshold and site.auto_spam:
        return "spam", spam_score

    if site.auto_approve and approval_confidence >= site.approve_threshold:
        if analysis.get("reply") and site.auto_reply:
            return "replied", spam_score
        return "approved", spam_score

    return "uncertain", spam_score


async def process_comment(
    db: AsyncSession,
    site: Site,
    payload: CommentSubmit,
    existing_comment: Optional[Comment] = None,
) -> CommentResult:
    """
    Full AI pipeline:
    1. Retrieve relevant knowledge via vector search
    2. Call GPT for analysis
    3. Determine status
    4. Save / update comment in DB
    5. Return decision to caller

    If `existing_comment` is provided (already saved as "pending"),
    it is updated in-place instead of creating a new row.
    """
    # 1. Vector-aware knowledge retrieval
    knowledge_chunks = await get_relevant_chunks(
        db, site.id, payload.content, limit=8
    )
    knowledge_context = "\n---\n".join(knowledge_chunks)

    # 2. AI analysis
    page_context = _build_page_context(payload)
    analysis = await analyze_comment(
        content=payload.content,
        site_name=site.name,
        tone=site.tone,
        language=site.language,
        knowledge_context=knowledge_context,
        page_context=page_context,
        custom_instructions=site.custom_instructions or "",
    )

    # 3. Determine status
    status, spam_score = determine_comment_status(site, analysis)

    # Database columns use TIMESTAMP WITHOUT TIME ZONE; store UTC consistently.
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # 4. Save or update
    if existing_comment is not None:
        comment = existing_comment
        comment.status = status
        comment.intent = analysis.get("intent")
        comment.spam_score = spam_score
        comment.sentiment = analysis.get("sentiment")
        comment.ai_reply = analysis.get("reply")
        comment.product_sku = payload.product_sku
        comment.product_price = payload.product_price
        comment.product_stock_status = payload.product_stock_status
        comment.product_context = payload.product_context
        comment.reply_sent = status == "replied"
        comment.reply_sent_at = now if status == "replied" else None
        comment.processing_time_ms = analysis.get("processing_time_ms")
        comment.processed_at = now
    else:
        comment = Comment(
            site_id=site.id,
            external_id=payload.external_id,
            author_name=payload.author_name,
            author_email=payload.author_email,
            content=payload.content,
            post_title=payload.post_title,
            post_url=payload.post_url,
            product_sku=payload.product_sku,
            product_price=payload.product_price,
            product_stock_status=payload.product_stock_status,
            product_context=payload.product_context,
            status=status,
            intent=analysis.get("intent"),
            spam_score=spam_score,
            sentiment=analysis.get("sentiment"),
            ai_reply=analysis.get("reply"),
            reply_sent=status == "replied",
            reply_sent_at=now if status == "replied" else None,
            processing_time_ms=analysis.get("processing_time_ms"),
            processed_at=now,
        )
        db.add(comment)

    await db.flush()

    return CommentResult(
        comment_id=comment.id,
        status=status,
        ai_reply=analysis.get("reply") if status in ("approved", "replied") else None,
        spam_score=spam_score,
        intent=analysis.get("intent"),
        sentiment=analysis.get("sentiment"),
    )


def _build_page_context(payload: CommentSubmit) -> str:
    parts = []
    if payload.post_title:
        parts.append(f"Page/product title: {payload.post_title}")
    if payload.post_url:
        parts.append(f"URL: {payload.post_url}")
    if payload.product_sku:
        parts.append(f"SKU: {payload.product_sku}")
    if payload.product_price:
        parts.append(f"Price: {payload.product_price}")
    if payload.product_stock_status:
        parts.append(f"Stock status: {payload.product_stock_status}")
    if payload.product_context:
        parts.append(payload.product_context)
    return "\n".join(parts)


async def get_comment_stats(db: AsyncSession, site_id: str) -> CommentStats:
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0, tzinfo=None
    )

    result = await db.execute(
        select(
            func.count().label("total"),
            func.sum((Comment.status == "approved").cast(Integer)).label("approved"),
            func.sum((Comment.status == "spam").cast(Integer)).label("spam"),
            func.sum((Comment.status == "replied").cast(Integer)).label("replied"),
            func.sum((Comment.status == "uncertain").cast(Integer)).label("uncertain"),
        ).where(Comment.site_id == site_id)
    )
    row = result.one()

    today_result = await db.execute(
        select(func.count()).where(
            and_(Comment.site_id == site_id, Comment.created_at >= today_start)
        )
    )
    today_count = today_result.scalar() or 0

    return CommentStats(
        total=row.total or 0,
        approved=row.approved or 0,
        spam=row.spam or 0,
        replied=row.replied or 0,
        uncertain=row.uncertain or 0,
        today=today_count,
    )
