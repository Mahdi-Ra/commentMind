from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.admin import is_platform_admin_email
from app.core.plans import get_limits
from app.models.payment import PaymentIntent
from app.models.user import User
from app.schemas.billing import CheckoutCreate, PaymentSubmit, TrialCreate
from app.services.audit_service import write_audit_log

PLAN_PRICES_USD = {
    "starter": {"monthly": 9.0, "annual": 84.0},
    "pro": {"monthly": 29.0, "annual": 276.0},
    "agency": {"monthly": 79.0, "annual": 756.0},
}


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _checkout_address(currency: str) -> str:
    if currency == "TRX":
        return settings.TRX_ADDRESS or settings.USDT_TRC20_ADDRESS
    return settings.USDT_TRC20_ADDRESS


async def create_payment_intent(
    db: AsyncSession,
    user: User,
    payload: CheckoutCreate,
) -> PaymentIntent:
    if payload.plan not in PLAN_PRICES_USD:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported plan")

    amount = PLAN_PRICES_USD[payload.plan][payload.billing_cycle]
    address = _checkout_address(payload.currency)
    if not address:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Crypto checkout address is not configured",
        )

    payment = PaymentIntent(
        user_id=user.id,
        plan=payload.plan,
        billing_cycle=payload.billing_cycle,
        currency=payload.currency,
        network=payload.network,
        amount=amount,
        address=address,
        expires_at=_utcnow_naive() + timedelta(hours=2),
    )
    db.add(payment)
    await db.flush()
    await write_audit_log(
        db,
        action="billing.checkout_created",
        actor_id=user.id,
        target_type="payment_intent",
        target_id=payment.id,
        metadata={"plan": payload.plan, "billing_cycle": payload.billing_cycle},
    )
    return payment


async def start_trial(
    db: AsyncSession,
    user: User,
    payload: TrialCreate,
) -> User:
    if payload.plan not in PLAN_PRICES_USD:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported plan")
    if user.trial_started_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already used your free trial",
        )

    now = _utcnow_naive()
    user.plan = payload.plan
    user.trial_plan = payload.plan
    user.trial_started_at = now
    user.trial_ends_at = now + timedelta(days=7)
    await write_audit_log(
        db,
        action="billing.trial_started",
        actor_id=user.id,
        target_type="user",
        target_id=user.id,
        metadata={"plan": payload.plan, "trial_ends_at": user.trial_ends_at.isoformat()},
    )
    return user


async def submit_payment_tx(
    db: AsyncSession,
    user: User,
    payment_id: str,
    payload: PaymentSubmit,
) -> PaymentIntent:
    result = await db.execute(
        select(PaymentIntent).where(
            PaymentIntent.id == payment_id,
            PaymentIntent.user_id == user.id,
        )
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    if payment.status == "confirmed":
        return payment

    payment.status = "submitted"
    payment.tx_hash = payload.tx_hash.strip()
    payment.note = payload.note
    payment.submitted_at = _utcnow_naive()
    await write_audit_log(
        db,
        action="billing.tx_submitted",
        actor_id=user.id,
        target_type="payment_intent",
        target_id=payment.id,
        metadata={"tx_hash": payment.tx_hash},
    )
    return payment


async def get_user_payments(db: AsyncSession, user_id: str) -> list[PaymentIntent]:
    result = await db.execute(
        select(PaymentIntent)
        .where(PaymentIntent.user_id == user_id)
        .order_by(desc(PaymentIntent.created_at))
        .limit(20)
    )
    return list(result.scalars().all())


def is_payment_admin(user: User) -> bool:
    return is_platform_admin_email(user.email)


async def confirm_payment(
    db: AsyncSession,
    admin: User,
    payment_id: str,
) -> PaymentIntent:
    if not is_payment_admin(admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    result = await db.execute(select(PaymentIntent).where(PaymentIntent.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    result = await db.execute(select(User).where(User.id == payment.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The customer must verify their email address before a plan can be activated.",
        )

    get_limits(payment.plan)  # validates fallback behavior for known plan strings
    payment.status = "confirmed"
    payment.confirmed_at = _utcnow_naive()
    user.plan = payment.plan
    user.trial_plan = None
    user.trial_ends_at = None
    await write_audit_log(
        db,
        action="billing.payment_confirmed",
        actor_id=admin.id,
        target_type="payment_intent",
        target_id=payment.id,
        metadata={"user_id": user.id, "plan": payment.plan},
    )
    return payment
