from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.core.security import decode_token, get_password_hash, verify_password, create_access_token
from app.core.plans import plan_info
from app.models.user import User
from app.services.email_service import send_password_reset_email
from app.schemas.auth import (
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetResponse,
    UserRegister,
    UserLogin,
    Token,
    UserOut,
    UserProfileUpdate,
    UserPasswordChange,
)
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


def _user_out(user: User) -> UserOut:
    """Build UserOut with plan limits attached."""
    info = plan_info(user.plan)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    trial_days_left = None
    if user.trial_ends_at and user.trial_ends_at > now:
        delta = user.trial_ends_at - now
        trial_days_left = max(1, delta.days + (1 if delta.seconds else 0))
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        plan=user.plan,
        is_active=user.is_active,
        plan_display_name=info["display_name"],
        plan_max_sites=info["max_sites"],
        plan_max_comments_month=info["max_comments_month"],
        trial_plan=user.trial_plan,
        trial_ends_at=user.trial_ends_at,
        trial_days_left=trial_days_left,
    )


@router.post("/register", response_model=Token)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.flush()

    token = create_access_token({"sub": user.id})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.id})
    return Token(access_token=token)


@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(payload: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user:
        token = create_access_token(
            {"sub": user.id, "purpose": "password_reset"},
            expires_delta=timedelta(minutes=30),
        )
        reset_url = f"{settings.FRONTEND_BASE_URL}/auth?{urlencode({'reset_token': token})}"
        send_password_reset_email(user.email, reset_url)

    return PasswordResetResponse(
        message="If an account exists for that email, a reset link has been sent."
    )


@router.post("/reset-password", status_code=204)
async def reset_password(payload: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    data = decode_token(payload.token)
    if not data or data.get("purpose") != "password_reset" or not data.get("sub"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link")

    result = await db.execute(select(User).where(User.id == data["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link")

    if verify_password(payload.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password",
        )

    user.hashed_password = get_password_hash(payload.new_password)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return _user_out(current_user)


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.full_name is not None:
        name = payload.full_name.strip()
        current_user.full_name = name if name else None
    await db.flush()
    return _user_out(current_user)


@router.post("/change-password", status_code=204)
async def change_password(
    payload: UserPasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if verify_password(payload.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password",
        )
    current_user.hashed_password = get_password_hash(payload.new_password)
    await db.flush()
