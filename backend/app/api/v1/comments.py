from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_
from app.core.database import get_db
from app.models.comment import Comment
from app.models.site import Site
from app.schemas.comment import CommentModerateIn, CommentOut, CommentStats
from app.services.comment_service import get_comment_stats
from app.api.v1.deps import get_customer_user
from app.models.user import User
from app.services.site_service import get_user_sites, get_site
from app.services.audit_service import write_audit_log
from app.services.insight_service import InsightScope, build_insights
from app.models.professional import CommentFeedback

router = APIRouter(tags=["Comments"])


class UsageSummary(BaseModel):
    comments_this_month: int
    sites_count: int


class CommentFeedbackIn(BaseModel):
    rating: int
    corrected_status: str | None = None
    corrected_reply: str | None = None
    note: str | None = None


class AnalyticsSummary(BaseModel):
    by_status: dict[str, int]
    by_intent: dict[str, int]
    by_sentiment: dict[str, int]
    avg_processing_time_ms: int | None


class InsightSummary(BaseModel):
    roi: dict
    lost_sales: dict
    confidence: dict
    knowledge_gaps: list[dict]
    suggested_faqs: list[dict]
    comment_funnel: dict
    review_queue: list[dict]
    risk_radar: dict
    weekly_report: dict


# ─── Dashboard endpoints (authenticated via JWT) ───────────────────────────

@router.get("/sites/{site_id}/comments", response_model=list[CommentOut])
async def list_comments(
    site_id: str,
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)  # ownership check

    query = select(Comment).where(Comment.site_id == site_id).order_by(desc(Comment.created_at))
    if status:
        query = query.where(Comment.status == status)
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/sites/{site_id}/stats", response_model=CommentStats)
async def stats(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    return await get_comment_stats(db, site_id)


@router.get("/sites/{site_id}/analytics", response_model=AnalyticsSummary)
async def analytics(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)

    async def grouped(column):
        result = await db.execute(
            select(column, func.count()).where(Comment.site_id == site_id).group_by(column)
        )
        return {str(key or "unknown"): int(value or 0) for key, value in result.all()}

    avg_result = await db.execute(
        select(func.avg(Comment.processing_time_ms)).where(Comment.site_id == site_id)
    )
    avg = avg_result.scalar()
    return AnalyticsSummary(
        by_status=await grouped(Comment.status),
        by_intent=await grouped(Comment.intent),
        by_sentiment=await grouped(Comment.sentiment),
        avg_processing_time_ms=int(avg) if avg is not None else None,
    )


@router.get("/sites/{site_id}/insights", response_model=InsightSummary)
async def site_insights(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    return await build_insights(db, InsightScope(site_ids=[site_id]))


@router.get("/insights", response_model=InsightSummary)
async def account_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    sites = await get_user_sites(db, current_user.id)
    return await build_insights(db, InsightScope(site_ids=[site.id for site in sites]))


@router.patch("/sites/{site_id}/comments/{comment_id}", response_model=CommentOut)
async def moderate_comment(
    site_id: str,
    comment_id: str,
    payload: CommentModerateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    result = await db.execute(
        select(Comment).where(Comment.id == comment_id, Comment.site_id == site_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if payload.action == "approve":
        comment.status = "approved"
        comment.reply_sent = False
        comment.reply_sent_at = None
    elif payload.action == "spam":
        comment.status = "spam"
        comment.reply_sent = False
        comment.reply_sent_at = None
    elif payload.action == "reply":
        comment.status = "replied"
        comment.ai_reply = payload.ai_reply or comment.ai_reply
        comment.reply_sent = True
        comment.reply_sent_at = now
    elif payload.action == "pending":
        comment.status = "pending"
        comment.reply_sent = False
        comment.reply_sent_at = None
    else:
        comment.status = "uncertain"
        comment.reply_sent = False
        comment.reply_sent_at = None

    comment.processed_at = now
    await write_audit_log(
        db,
        action=f"comment.{payload.action}",
        actor_id=current_user.id,
        site_id=site_id,
        target_type="comment",
        target_id=comment_id,
        metadata={"status": comment.status},
    )
    await db.flush()
    return comment


@router.post("/sites/{site_id}/comments/{comment_id}/feedback", status_code=201)
async def add_comment_feedback(
    site_id: str,
    comment_id: str,
    payload: CommentFeedbackIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    result = await db.execute(
        select(Comment.id).where(Comment.id == comment_id, Comment.site_id == site_id)
    )
    if not result.scalar_one_or_none():
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    feedback = CommentFeedback(
        comment_id=comment_id,
        user_id=current_user.id,
        rating=payload.rating,
        corrected_status=payload.corrected_status,
        corrected_reply=payload.corrected_reply,
        note=payload.note,
    )
    db.add(feedback)
    await write_audit_log(
        db,
        action="comment.feedback_added",
        actor_id=current_user.id,
        site_id=site_id,
        target_type="comment",
        target_id=comment_id,
        metadata={"rating": payload.rating},
    )
    return {"ok": True}


@router.get("/usage", response_model=UsageSummary)
async def usage_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    """Return total comments this month + site count for the current user."""
    sites = await get_user_sites(db, current_user.id)
    site_ids = [s.id for s in sites]

    if not site_ids:
        return UsageSummary(comments_this_month=0, sites_count=0)

    month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )

    result = await db.execute(
        select(func.count()).where(
            and_(
                Comment.site_id.in_(site_ids),
                Comment.created_at >= month_start.replace(tzinfo=None),
            )
        )
    )
    count = result.scalar() or 0

    return UsageSummary(comments_this_month=count, sites_count=len(sites))
