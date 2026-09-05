from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_user, get_customer_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.billing import CheckoutCreate, CheckoutOut, PaymentOut, PaymentSubmit, TrialCreate, TrialOut
from app.services.billing_service import (
    confirm_payment,
    create_payment_intent,
    get_user_payments,
    start_trial,
    submit_payment_tx,
)
from app.services.email_service import send_trial_started_email

router = APIRouter(prefix="/billing", tags=["Billing"])


def _instructions(payment) -> list[str]:
    return [
        f"Send exactly {payment.amount:g} {payment.currency} on {payment.network}.",
        "Use the destination address shown in checkout.",
        "After sending, paste the transaction hash so support can verify and activate your plan.",
    ]


@router.post("/checkout", response_model=CheckoutOut, status_code=201)
async def create_checkout(
    payload: CheckoutCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    payment = await create_payment_intent(db, current_user, payload)
    return CheckoutOut(payment=PaymentOut.model_validate(payment), instructions=_instructions(payment))


@router.get("/payments", response_model=list[PaymentOut])
async def list_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    return await get_user_payments(db, current_user.id)


@router.post("/trial", response_model=TrialOut, status_code=201)
async def start_free_trial(
    payload: TrialCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    user = await start_trial(db, current_user, payload)
    background_tasks.add_task(send_trial_started_email, user.email, user.plan, user.trial_ends_at.date().isoformat())
    return TrialOut(
        plan=user.plan,
        trial_ends_at=user.trial_ends_at,
        message="Your 7-day free trial is active",
    )


@router.post("/payments/{payment_id}/submit", response_model=PaymentOut)
async def submit_payment(
    payment_id: str,
    payload: PaymentSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    return await submit_payment_tx(db, current_user, payment_id, payload)


@router.post("/payments/{payment_id}/confirm", response_model=PaymentOut)
async def admin_confirm_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await confirm_payment(db, current_user, payment_id)
