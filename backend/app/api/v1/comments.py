from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.comment import Comment
from app.models.site import Site
from app.schemas.comment import CommentSubmit, CommentResult, CommentOut, CommentStats
from app.services.comment_service import process_comment, get_comment_stats
from app.api.v1.deps import get_site_from_api_key, get_current_user
from app.models.user import User
from app.services.site_service import get_site

router = APIRouter(tags=["Comments"])


# ─── Plugin endpoint (authenticated via API key) ───────────────────────────

@router.post("/widget/comment", response_model=CommentResult)
async def submit_comment(
    payload: CommentSubmit,
    db: AsyncSession = Depends(get_db),
    site: Site = Depends(get_site_from_api_key),
):
    """
    Called by WP plugin / JS widget when a new comment is posted.
    Returns moderation decision + AI reply.
    """
    return await process_comment(db, site, payload)


# ─── Dashboard endpoints (authenticated via JWT) ───────────────────────────

@router.get("/sites/{site_id}/comments", response_model=list[CommentOut])
async def list_comments(
    site_id: str,
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
):
    await get_site(db, site_id, current_user.id)
    return await get_comment_stats(db, site_id)
