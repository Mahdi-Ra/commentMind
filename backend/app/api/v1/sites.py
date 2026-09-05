from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_api_key
from app.core.plans import enforce_site_limit
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate, SiteOut, SiteWithKey
from app.schemas.widget import TestConnectionIn, WidgetPingOut
from app.services.site_service import (
    create_site, get_user_sites, get_site, update_site, regenerate_api_key
)
from app.api.v1.deps import get_customer_user

router = APIRouter(prefix="/sites", tags=["Sites"])


@router.post("", response_model=SiteWithKey, status_code=201)
async def create(
    payload: SiteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await enforce_site_limit(db, current_user.id, current_user.plan)
    site, api_key = await create_site(db, current_user.id, payload)
    return SiteWithKey(**SiteOut.model_validate(site).model_dump(), api_key=api_key)


@router.get("", response_model=list[SiteOut])
async def list_sites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    return await get_user_sites(db, current_user.id)


@router.get("/{site_id}", response_model=SiteOut)
async def get_one(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    return await get_site(db, site_id, current_user.id)


@router.patch("/{site_id}", response_model=SiteOut)
async def update(
    site_id: str,
    payload: SiteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    site = await get_site(db, site_id, current_user.id)
    return await update_site(db, site, payload)


@router.post("/{site_id}/regenerate-key", response_model=dict)
async def regen_key(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    site = await get_site(db, site_id, current_user.id)
    new_key = await regenerate_api_key(db, site)
    return {"api_key": new_key}


@router.get("/{site_id}/embed")
async def embed_snippet(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    site = await get_site(db, site_id, current_user.id)
    base = settings.PUBLIC_BASE_URL.rstrip("/")
    widget_url = f"{base}/static/widget.js"
    snippet = (
        f'<div id="commentmind-root"></div>\n'
        f'<script src="{widget_url}"\n'
        f'  data-api-key="YOUR_API_KEY"\n'
        f'  data-api-url="{base}"\n'
        f'  data-page-title="{{{{PAGE_TITLE}}}}"\n'
        f'  data-page-url="{{{{PAGE_URL}}}}"\n'
        f'  async\n'
        f"></script>"
    )
    return {
        "api_url": base,
        "widget_url": widget_url,
        "domain": site.domain,
        "site_name": site.name,
        "snippet": snippet,
    }


@router.post("/{site_id}/test-connection", response_model=WidgetPingOut)
async def test_connection(
    site_id: str,
    payload: TestConnectionIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    site = await get_site(db, site_id, current_user.id)
    if hash_api_key(payload.api_key) != site.api_key_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API key does not match this site",
        )
    site.last_connected_at = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.flush()
    return WidgetPingOut(ok=True, site_name=site.name, message="API key is valid")
