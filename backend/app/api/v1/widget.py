from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_site_from_api_key
from app.core.database import get_db
from app.core.origin import origin_matches_domain
from app.core.plans import enforce_comment_limit
from app.core.rate_limit import check_widget_rate_limit
from app.models.comment import Comment
from app.models.site import Site
from app.schemas.comment import CommentResult, CommentSubmit
from app.schemas.widget import WidgetCommentPublic, WidgetConfigOut, WidgetPingOut

router = APIRouter(prefix="/widget", tags=["Widget"])


def _validate_origin(request: Request, site: Site) -> None:
    origin = request.headers.get("origin") or request.headers.get("referer")
    if origin and not origin_matches_domain(origin, site.domain):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Origin not allowed for this site",
        )


@router.get("/config", response_model=WidgetConfigOut)
async def widget_config(
    request: Request,
    site: Site = Depends(get_site_from_api_key),
):
    _validate_origin(request, site)
    return WidgetConfigOut(
        site_id=site.id,
        site_name=site.name,
        language=site.language,
        tone=site.tone,
        auto_reply=site.auto_reply,
        auto_approve=site.auto_approve,
        auto_spam=site.auto_spam,
    )


@router.get("/ping", response_model=WidgetPingOut)
async def widget_ping(
    request: Request,
    site: Site = Depends(get_site_from_api_key),
):
    _validate_origin(request, site)
    return WidgetPingOut(ok=True, site_name=site.name)


@router.post("/comment", response_model=CommentResult)
async def submit_comment(
    payload: CommentSubmit,
    request: Request,
    wait: bool = Query(False, description="Process synchronously before returning"),
    db: AsyncSession = Depends(get_db),
    site: Site = Depends(get_site_from_api_key),
):
    _validate_origin(request, site)
    await check_widget_rate_limit(site.id)
    site.last_connected_at = datetime.now(timezone.utc).replace(tzinfo=None)

    # Enforce monthly comment quota based on site owner's plan
    await enforce_comment_limit(db, site.id, site.owner.plan if site.owner else "free")

    # Save comment immediately as "pending"
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
        status="pending",
    )
    db.add(comment)
    await db.flush()
    comment_id = comment.id
    await db.commit()

    if wait:
        return await _sync_process_inline(db, site, payload, comment_id)

    # Try to dispatch to Celery worker; fall back to synchronous processing
    dispatched = False
    try:
        from app.worker.tasks import process_comment_async
        process_comment_async.delay(comment_id, site.id)
        dispatched = True
    except Exception:
        pass

    if not dispatched:
        # Celery unavailable — process synchronously (dev / single-container mode)
        result = await _sync_process_inline(db, site, payload, comment_id)
        return result

    # Return immediately with "pending" status so the widget isn't blocked
    return CommentResult(
        comment_id=comment_id,
        status="pending",
        ai_reply=None,
        spam_score=0.0,
        intent=None,
        sentiment=None,
    )


async def _sync_process_inline(
    db: AsyncSession,
    site: Site,
    payload: CommentSubmit,
    comment_id: str,
) -> CommentResult:
    """
    Synchronous fallback when Celery is not available.
    Runs the full AI pipeline in-request.
    """
    from app.services.comment_service import process_comment
    from sqlalchemy import select as _select
    from app.models.comment import Comment as _Comment

    # Load the already-saved pending comment
    result = await db.execute(_select(_Comment).where(_Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=500, detail="Comment save failed")

    return await process_comment(db, site, payload, existing_comment=comment)


@router.get("/comments", response_model=list[WidgetCommentPublic])
async def list_public_comments(
    request: Request,
    post_url: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    site: Site = Depends(get_site_from_api_key),
):
    _validate_origin(request, site)
    result = await db.execute(
        select(Comment)
        .where(
            Comment.site_id == site.id,
            Comment.post_url == post_url,
            Comment.status.in_(["approved", "replied"]),
        )
        .order_by(desc(Comment.created_at))
        .limit(limit)
    )
    return result.scalars().all()
