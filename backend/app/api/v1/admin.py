from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_platform_admin, is_platform_admin
from app.core.database import get_db
from app.models.comment import Comment
from app.models.payment import PaymentIntent
from app.models.site import Site
from app.models.user import User
from app.schemas.admin import (
    AdminOverview,
    AdminPaymentOut,
    AdminSiteOut,
    AdminUserOut,
    AdminUserUpdate,
)
from app.services.audit_service import write_audit_log
from app.services.billing_service import confirm_payment

router = APIRouter(prefix="/admin", tags=["Platform Admin"])


@router.get("/overview", response_model=AdminOverview)
async def overview(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_platform_admin),
):
    month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=None
    )
    total_users = await db.scalar(select(func.count()).select_from(User)) or 0
    active_users = await db.scalar(
        select(func.count()).select_from(User).where(User.is_active.is_(True))
    ) or 0
    total_sites = await db.scalar(select(func.count()).select_from(Site)) or 0
    comments_this_month = await db.scalar(
        select(func.count()).select_from(Comment).where(Comment.created_at >= month_start)
    ) or 0
    pending_payments = await db.scalar(
        select(func.count())
        .select_from(PaymentIntent)
        .where(PaymentIntent.status.in_(["created", "submitted"]))
    ) or 0
    return AdminOverview(
        total_users=total_users,
        active_users=active_users,
        total_sites=total_sites,
        comments_this_month=comments_this_month,
        pending_payments=pending_payments,
    )


@router.get("/users", response_model=list[AdminUserOut])
async def list_users(
    search: str | None = Query(None, max_length=120),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_platform_admin),
):
    sites_count = func.count(func.distinct(Site.id)).label("sites_count")
    comments_count = func.count(Comment.id).label("comments_count")
    query = (
        select(User, sites_count, comments_count)
        .outerjoin(Site, Site.owner_id == User.id)
        .outerjoin(Comment, Comment.site_id == Site.id)
        .group_by(User.id)
        .order_by(User.created_at.desc())
        .limit(200)
    )
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(or_(User.email.ilike(term), User.full_name.ilike(term)))
    rows = (await db.execute(query)).all()
    return [
        AdminUserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            plan=user.plan,
            is_active=user.is_active,
            is_admin=is_platform_admin(user),
            sites_count=sites_count,
            comments_count=comments_count,
            created_at=user.created_at,
        )
        for user, sites_count, comments_count in rows
    ]


@router.patch("/users/{user_id}", response_model=AdminUserOut)
async def update_user(
    user_id: str,
    payload: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_platform_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if is_platform_admin(user):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform admin accounts cannot be modified here",
        )
    if payload.plan is not None:
        user.plan = payload.plan
    if payload.is_active is not None:
        user.is_active = payload.is_active
    await write_audit_log(
        db,
        action="admin.user_updated",
        actor_id=admin.id,
        target_type="user",
        target_id=user.id,
        metadata=payload.model_dump(exclude_none=True),
    )
    sites_count = await db.scalar(select(func.count()).where(Site.owner_id == user.id)) or 0
    comments_count = await db.scalar(
        select(func.count()).select_from(Comment).join(Site).where(Site.owner_id == user.id)
    ) or 0
    return AdminUserOut(
        id=user.id, email=user.email, full_name=user.full_name, plan=user.plan,
        is_active=user.is_active, is_admin=is_platform_admin(user), sites_count=sites_count, comments_count=comments_count,
        created_at=user.created_at,
    )


@router.get("/sites", response_model=list[AdminSiteOut])
async def list_all_sites(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_platform_admin),
):
    comments_count = func.count(Comment.id).label("comments_count")
    rows = (await db.execute(
        select(Site, User.email, User.full_name, comments_count)
        .join(User, User.id == Site.owner_id)
        .outerjoin(Comment, Comment.site_id == Site.id)
        .group_by(Site.id, User.email, User.full_name)
        .order_by(Site.created_at.desc())
        .limit(300)
    )).all()
    return [
        AdminSiteOut(
            id=site.id, name=site.name, domain=site.domain, owner_email=email,
            owner_name=name, is_active=site.is_active, comments_count=comments_count,
            created_at=site.created_at,
        )
        for site, email, name, comments_count in rows
    ]


@router.get("/payments", response_model=list[AdminPaymentOut])
async def list_all_payments(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_platform_admin),
):
    rows = (await db.execute(
        select(PaymentIntent, User.email)
        .join(User, User.id == PaymentIntent.user_id)
        .order_by(PaymentIntent.created_at.desc())
        .limit(300)
    )).all()
    return [
        AdminPaymentOut(
            id=payment.id, user_id=payment.user_id, user_email=email, plan=payment.plan,
            billing_cycle=payment.billing_cycle, currency=payment.currency, amount=payment.amount,
            status=payment.status, tx_hash=payment.tx_hash, created_at=payment.created_at,
            submitted_at=payment.submitted_at, confirmed_at=payment.confirmed_at,
        )
        for payment, email in rows
    ]


@router.post("/payments/{payment_id}/confirm", response_model=AdminPaymentOut)
async def confirm_admin_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_platform_admin),
):
    payment = await confirm_payment(db, admin, payment_id)
    result = await db.execute(select(User.email).where(User.id == payment.user_id))
    return AdminPaymentOut(
        id=payment.id, user_id=payment.user_id, user_email=result.scalar_one(), plan=payment.plan,
        billing_cycle=payment.billing_cycle, currency=payment.currency, amount=payment.amount,
        status=payment.status, tx_hash=payment.tx_hash, created_at=payment.created_at,
        submitted_at=payment.submitted_at, confirmed_at=payment.confirmed_at,
    )
