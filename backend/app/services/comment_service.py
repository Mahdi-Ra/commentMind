from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.comment import Comment
from app.models.site import Site
from app.models.knowledge import KnowledgeChunk
from app.schemas.comment import CommentSubmit, CommentResult, CommentStats
from app.services.ai_service import analyze_comment


async def process_comment(
    db: AsyncSession,
    site: Site,
    payload: CommentSubmit,
) -> CommentResult:
    """
    Main pipeline:
    1. Load knowledge base context
    2. Call AI for analysis
    3. Save result to DB
    4. Return decision to plugin
    """
    # 1. Build knowledge context
    knowledge_context = await _get_knowledge_context(db, site.id)

    # 2. AI analysis
    analysis = await analyze_comment(
        content=payload.content,
        site_name=site.name,
        tone=site.tone,
        language=site.language,
        knowledge_context=knowledge_context,
        custom_instructions=site.custom_instructions or "",
    )

    # 3. Determine status
    spam_score = float(analysis.get("spam_score", 0.1))
    
    if spam_score >= site.spam_threshold and site.auto_spam:
        status = "spam"
    elif spam_score < (1 - site.approve_threshold) and site.auto_approve:
        status = "approved"
        if analysis.get("reply") and site.auto_reply:
            status = "replied"
    else:
        status = "uncertain"

    # 4. Save to DB
    comment = Comment(
        site_id=site.id,
        external_id=payload.external_id,
        author_name=payload.author_name,
        author_email=payload.author_email,
        content=payload.content,
        post_title=payload.post_title,
        post_url=payload.post_url,
        status=status,
        intent=analysis.get("intent"),
        spam_score=spam_score,
        sentiment=analysis.get("sentiment"),
        ai_reply=analysis.get("reply"),
        reply_sent=status == "replied",
        reply_sent_at=datetime.now(timezone.utc) if status == "replied" else None,
        processing_time_ms=analysis.get("processing_time_ms"),
        processed_at=datetime.now(timezone.utc),
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


async def _get_knowledge_context(db: AsyncSession, site_id: str, limit: int = 10) -> str:
    """Fetch relevant knowledge chunks for context"""
    result = await db.execute(
        select(KnowledgeChunk)
        .where(KnowledgeChunk.site_id == site_id)
        .limit(limit)
    )
    chunks = result.scalars().all()
    if not chunks:
        return ""
    return "\n---\n".join([c.content for c in chunks])


async def get_comment_stats(db: AsyncSession, site_id: str) -> CommentStats:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    result = await db.execute(
        select(
            func.count().label("total"),
            func.sum((Comment.status == "approved").cast(int)).label("approved"),
            func.sum((Comment.status == "spam").cast(int)).label("spam"),
            func.sum((Comment.status == "replied").cast(int)).label("replied"),
            func.sum((Comment.status == "uncertain").cast(int)).label("uncertain"),
        ).where(Comment.site_id == site_id)
    )
    row = result.one()

    today_result = await db.execute(
        select(func.count())
        .where(and_(Comment.site_id == site_id, Comment.created_at >= today_start))
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
