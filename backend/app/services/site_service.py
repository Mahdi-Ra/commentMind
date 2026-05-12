from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.site import Site
from app.schemas.site import SiteCreate, SiteUpdate
from app.core.security import generate_api_key, hash_api_key
from fastapi import HTTPException, status


async def create_site(db: AsyncSession, owner_id: str, payload: SiteCreate) -> tuple[Site, str]:
    api_key = generate_api_key()
    site = Site(
        owner_id=owner_id,
        name=payload.name,
        domain=payload.domain,
        tone=payload.tone,
        language=payload.language,
        custom_instructions=payload.custom_instructions,
        auto_reply=payload.auto_reply,
        auto_approve=payload.auto_approve,
        auto_spam=payload.auto_spam,
        api_key_hash=hash_api_key(api_key),
    )
    db.add(site)
    await db.flush()
    return site, api_key


async def get_site_by_api_key(db: AsyncSession, api_key: str) -> Site | None:
    key_hash = hash_api_key(api_key)
    result = await db.execute(select(Site).where(Site.api_key_hash == key_hash))
    return result.scalar_one_or_none()


async def get_user_sites(db: AsyncSession, owner_id: str) -> list[Site]:
    result = await db.execute(select(Site).where(Site.owner_id == owner_id))
    return list(result.scalars().all())


async def get_site(db: AsyncSession, site_id: str, owner_id: str) -> Site:
    result = await db.execute(
        select(Site).where(Site.id == site_id, Site.owner_id == owner_id)
    )
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return site


async def update_site(db: AsyncSession, site: Site, payload: SiteUpdate) -> Site:
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(site, field, value)
    await db.flush()
    return site


async def regenerate_api_key(db: AsyncSession, site: Site) -> str:
    new_key = generate_api_key()
    site.api_key_hash = hash_api_key(new_key)
    await db.flush()
    return new_key
