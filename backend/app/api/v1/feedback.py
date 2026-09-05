from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_customer_user
from app.core.database import get_db
from app.models.customer_feedback import CustomerFeedback
from app.models.user import User
from app.schemas.feedback import CustomerFeedbackCreate, CustomerFeedbackOut

router = APIRouter(prefix="/feedback", tags=["Customer Feedback"])


@router.post("", response_model=CustomerFeedbackOut, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    payload: CustomerFeedbackCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_customer_user),
):
    message = payload.message.strip() if payload.message else None
    feedback = CustomerFeedback(user_id=user.id, rating=payload.rating, message=message or None)
    db.add(feedback)
    await db.flush()
    await db.refresh(feedback)
    return feedback
