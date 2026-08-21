from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_customer_user
from app.core.config import settings
from app.core.database import AsyncSessionLocal, get_db
from app.models.user import User
from app.schemas.search_console import SearchConsolePropertySelect, SearchConsoleStatus
from app.services.search_console_service import (
    build_authorize_url,
    complete_authorization,
    disconnect,
    get_connection,
    is_configured,
    list_properties,
)
from app.services.site_service import get_site

router = APIRouter(prefix="/sites", tags=["Search Console"])


async def _status(db: AsyncSession, site_id: str) -> SearchConsoleStatus:
    connection = await get_connection(db, site_id)
    if not connection:
        return SearchConsoleStatus(configured=is_configured(), connected=False)
    properties: list[str] = []
    if is_configured():
        try:
            properties = await list_properties(db, connection)
        except Exception:
            # Keep an existing connection visible even when Google is temporarily unavailable.
            pass
    return SearchConsoleStatus(
        configured=is_configured(),
        connected=True,
        property_url=connection.property_url,
        properties=properties,
    )


@router.get("/{site_id}/search-console", response_model=SearchConsoleStatus)
async def search_console_status(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    return await _status(db, site_id)


@router.get("/{site_id}/search-console/authorize")
async def authorize_search_console(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    if not is_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Search Console integration is not configured")
    return {"url": build_authorize_url(current_user.id, site_id)}


@router.get("/search-console/callback", include_in_schema=False)
async def search_console_callback(code: str = Query(...), state: str = Query(...)):
    if not is_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Search Console integration is not configured")
    try:
        async with AsyncSessionLocal() as db:
            site_id, _ = await complete_authorization(db, code, state)
            await db.commit()
    except Exception as exc:
        params = urlencode({"search_console": "error", "message": str(exc)[:160]})
        return RedirectResponse(f"{settings.FRONTEND_BASE_URL}/dashboard?{params}")
    return RedirectResponse(f"{settings.FRONTEND_BASE_URL}/dashboard/sites/{site_id}?search_console=connected")


@router.post("/{site_id}/search-console/property", response_model=SearchConsoleStatus)
async def select_search_console_property(
    site_id: str,
    payload: SearchConsolePropertySelect,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    connection = await get_connection(db, site_id)
    if not connection:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Connect Google first")
    properties = await list_properties(db, connection)
    if payload.property_url not in properties:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Select a verified Search Console property")
    connection.property_url = payload.property_url
    await db.flush()
    return await _status(db, site_id)


@router.delete("/{site_id}/search-console", status_code=204)
async def disconnect_search_console(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    await disconnect(db, site_id)
