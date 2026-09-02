from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_customer_user
from app.core.config import settings
from app.core.database import AsyncSessionLocal, get_db
from app.models.user import User
from app.services.shopify_service import (
    build_authorize_url,
    complete_authorization,
    disconnect,
    get_connection,
    is_configured,
    normalize_shop_domain,
    sync_catalog,
)
from app.services.site_service import get_site

router = APIRouter(prefix="/sites", tags=["Shopify"])


class ShopifyConnectIn(BaseModel):
    shop: str = Field(..., min_length=8, max_length=255)


class ShopifyStatus(BaseModel):
    configured: bool
    connected: bool
    shop_domain: str | None = None
    product_count: int = 0
    last_synced_at: str | None = None


def _status(connection) -> ShopifyStatus:
    return ShopifyStatus(
        configured=is_configured(),
        connected=connection is not None,
        shop_domain=connection.shop_domain if connection else None,
        product_count=connection.product_count if connection else 0,
        last_synced_at=connection.last_synced_at.isoformat() if connection and connection.last_synced_at else None,
    )


@router.get("/{site_id}/shopify", response_model=ShopifyStatus)
async def shopify_status(site_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_customer_user)):
    await get_site(db, site_id, current_user.id)
    return _status(await get_connection(db, site_id))


@router.post("/{site_id}/shopify/authorize")
async def authorize_shopify(
    site_id: str,
    payload: ShopifyConnectIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_customer_user),
):
    await get_site(db, site_id, current_user.id)
    if not is_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Shopify integration is not configured")
    try:
        return {"url": build_authorize_url(current_user.id, site_id, payload.shop)}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/shopify/callback", include_in_schema=False)
async def shopify_callback(request: Request):
    if not is_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Shopify integration is not configured")
    params = {key: value for key, value in request.query_params.items()}
    try:
        async with AsyncSessionLocal() as db:
            connection = await complete_authorization(db, params)
            await db.commit()
    except Exception as exc:
        query = urlencode({"shopify": "error", "message": str(exc)[:160]})
        return RedirectResponse(f"{settings.FRONTEND_BASE_URL}/dashboard?{query}")
    return RedirectResponse(f"{settings.FRONTEND_BASE_URL}/dashboard/sites/{connection.site_id}?shopify=connected")


@router.post("/{site_id}/shopify/sync", response_model=ShopifyStatus)
async def sync_shopify_catalog(site_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_customer_user)):
    await get_site(db, site_id, current_user.id)
    connection = await get_connection(db, site_id)
    if not connection:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Connect Shopify first")
    try:
        await sync_catalog(db, connection)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not sync the Shopify catalog") from exc
    return _status(connection)


@router.delete("/{site_id}/shopify", status_code=204)
async def disconnect_shopify(site_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_customer_user)):
    await get_site(db, site_id, current_user.id)
    await disconnect(db, site_id)
