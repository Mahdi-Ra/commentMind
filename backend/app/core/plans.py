"""
Plan definitions and enforcement helpers.

Plans:
  free      — 1 site, 100 comments/month
  starter   — 3 sites, 2 000 comments/month
  pro       — 10 sites, 15 000 comments/month
  agency    — unlimited sites, unlimited comments
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True)
class PlanLimits:
    max_sites: int          # -1 = unlimited
    max_comments_month: int  # -1 = unlimited
    display_name: str


PLANS: dict[str, PlanLimits] = {
    "free":    PlanLimits(max_sites=1,  max_comments_month=100,    display_name="Free"),
    "starter": PlanLimits(max_sites=3,  max_comments_month=2_000,  display_name="Starter"),
    "pro":     PlanLimits(max_sites=10, max_comments_month=15_000, display_name="Pro"),
    "agency":  PlanLimits(max_sites=-1, max_comments_month=-1,     display_name="Agency"),
}

# Fallback for unknown plan strings
_DEFAULT_LIMITS = PLANS["free"]


def get_limits(plan: str) -> PlanLimits:
    return PLANS.get(plan, _DEFAULT_LIMITS)


async def enforce_site_limit(db: AsyncSession, owner_id: str, plan: str) -> None:
    """Raise 403 if the user has reached their site quota."""
    limits = get_limits(plan)
    if limits.max_sites == -1:
        return

    from app.models.site import Site  # local import to avoid circular deps

    result = await db.execute(
        select(func.count()).where(Site.owner_id == owner_id)
    )
    count = result.scalar() or 0

    if count >= limits.max_sites:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Your {limits.display_name} plan allows up to {limits.max_sites} site(s). "
                "Upgrade to add more."
            ),
        )


async def enforce_comment_limit(db: AsyncSession, site_id: str, plan: str) -> None:
    """Raise 429 if the site has exceeded its monthly comment quota."""
    limits = get_limits(plan)
    if limits.max_comments_month == -1:
        return

    from app.models.comment import Comment  # local import to avoid circular deps
    from sqlalchemy import and_
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=None)

    result = await db.execute(
        select(func.count()).where(
            and_(
                Comment.site_id == site_id,
                Comment.created_at >= month_start,
            )
        )
    )
    count = result.scalar() or 0

    if count >= limits.max_comments_month:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Monthly comment limit ({limits.max_comments_month:,}) reached for your "
                f"{limits.display_name} plan. Upgrade for more capacity."
            ),
        )


def plan_info(plan: str) -> dict:
    """Return plan details as a dict (for the /auth/me response)."""
    limits = get_limits(plan)
    return {
        "plan": plan,
        "display_name": limits.display_name,
        "max_sites": limits.max_sites,
        "max_comments_month": limits.max_comments_month,
    }
