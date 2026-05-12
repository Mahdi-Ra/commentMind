from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate, SiteOut, SiteWithKey
from app.services.site_service import (
    create_site, get_user_sites, get_site, update_site, regenerate_api_key
)
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/sites", tags=["Sites"])


@router.post("", response_model=SiteWithKey, status_code=201)
async def create(
    payload: SiteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site, api_key = await create_site(db, current_user.id, payload)
    return SiteWithKey(**SiteOut.model_validate(site).model_dump(), api_key=api_key)


@router.get("", response_model=list[SiteOut])
async def list_sites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_sites(db, current_user.id)


@router.get("/{site_id}", response_model=SiteOut)
async def get_one(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_site(db, site_id, current_user.id)


@router.patch("/{site_id}", response_model=SiteOut)
async def update(
    site_id: str,
    payload: SiteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = await get_site(db, site_id, current_user.id)
    return await update_site(db, site, payload)


@router.post("/{site_id}/regenerate-key", response_model=dict)
async def regen_key(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = await get_site(db, site_id, current_user.id)
    new_key = await regenerate_api_key(db, site)
    return {"api_key": new_key}
