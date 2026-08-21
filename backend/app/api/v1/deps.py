from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.admin import is_platform_admin_email
from app.models.user import User
from app.models.site import Site
from app.services.site_service import get_site_by_api_key
from sqlalchemy import select
from datetime import datetime, timezone

bearer_scheme = HTTPBearer()


def is_platform_admin(user: User) -> bool:
    return is_platform_admin_email(user.email)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.trial_ends_at and user.trial_ends_at <= datetime.now(timezone.utc).replace(tzinfo=None):
        user.plan = "free"
        user.trial_plan = None
        user.trial_ends_at = None
    return user


async def get_platform_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if not is_platform_admin(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user


async def get_site_from_api_key(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Site:
    site = await get_site_by_api_key(db, credentials.credentials)
    if not site or not site.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
    return site
