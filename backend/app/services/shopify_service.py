"""Shopify OAuth and catalog sync for product-aware AI replies."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from cryptography.fernet import Fernet
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, decode_token
from app.models.knowledge import KnowledgeChunk
from app.models.shopify import ShopifyConnection

SHOP_DOMAIN_RE = re.compile(r"^[a-z0-9][a-z0-9-]*\.myshopify\.com$")
SHOPIFY_SCOPES = "read_products,read_inventory"


def is_configured() -> bool:
    return bool(settings.SHOPIFY_CLIENT_ID and settings.SHOPIFY_CLIENT_SECRET and settings.SHOPIFY_OAUTH_REDIRECT_URI)


def _fernet() -> Fernet:
    key = base64.urlsafe_b64encode(hashlib.sha256(settings.SECRET_KEY.encode()).digest())
    return Fernet(key)


def _encrypt(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def _decrypt(value: str) -> str:
    return _fernet().decrypt(value.encode()).decode()


def normalize_shop_domain(shop: str) -> str:
    domain = shop.strip().lower().removeprefix("https://").removeprefix("http://").split("/")[0]
    if not SHOP_DOMAIN_RE.fullmatch(domain):
        raise ValueError("Enter a valid Shopify store domain, for example your-store.myshopify.com")
    return domain


def build_authorize_url(user_id: str, site_id: str, shop: str) -> str:
    if not is_configured():
        raise ValueError("Shopify integration is not configured")
    domain = normalize_shop_domain(shop)
    state = create_access_token(
        {"sub": user_id, "site_id": site_id, "shop": domain, "purpose": "shopify_oauth"},
        expires_delta=timedelta(minutes=10),
    )
    params = {
        "client_id": settings.SHOPIFY_CLIENT_ID,
        "scope": SHOPIFY_SCOPES,
        "redirect_uri": settings.SHOPIFY_OAUTH_REDIRECT_URI,
        "state": state,
    }
    return f"https://{domain}/admin/oauth/authorize?{urlencode(params)}"


def validate_callback_hmac(params: dict[str, str]) -> bool:
    supplied = params.get("hmac", "")
    message = urlencode(sorted((key, value) for key, value in params.items() if key not in {"hmac", "signature"}))
    expected = hmac.new(settings.SHOPIFY_CLIENT_SECRET.encode(), message.encode(), hashlib.sha256).hexdigest()
    return bool(supplied) and hmac.compare_digest(supplied, expected)


async def complete_authorization(db: AsyncSession, params: dict[str, str]) -> ShopifyConnection:
    if not validate_callback_hmac(params):
        raise ValueError("Shopify callback signature is invalid")
    state = decode_token(params.get("state", ""))
    if not state or state.get("purpose") != "shopify_oauth":
        raise ValueError("Shopify connection request is invalid or expired")
    shop = normalize_shop_domain(params.get("shop", ""))
    if shop != state.get("shop") or not params.get("code"):
        raise ValueError("Shopify connection request does not match this store")

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"https://{shop}/admin/oauth/access_token",
            json={"client_id": settings.SHOPIFY_CLIENT_ID, "client_secret": settings.SHOPIFY_CLIENT_SECRET, "code": params["code"]},
        )
        response.raise_for_status()
    token = response.json().get("access_token")
    if not token:
        raise ValueError("Shopify did not return an access token")

    result = await db.execute(select(ShopifyConnection).where(ShopifyConnection.site_id == state["site_id"]))
    connection = result.scalar_one_or_none()
    if connection is None:
        connection = ShopifyConnection(site_id=state["site_id"], shop_domain=shop, access_token_encrypted=_encrypt(token))
        db.add(connection)
    else:
        connection.shop_domain = shop
        connection.access_token_encrypted = _encrypt(token)
    await db.flush()
    await sync_catalog(db, connection)
    return connection


async def get_connection(db: AsyncSession, site_id: str) -> ShopifyConnection | None:
    result = await db.execute(select(ShopifyConnection).where(ShopifyConnection.site_id == site_id))
    return result.scalar_one_or_none()


async def disconnect(db: AsyncSession, site_id: str) -> None:
    connection = await get_connection(db, site_id)
    if connection:
        await db.delete(connection)
    await db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.site_id == site_id, KnowledgeChunk.source_name == "Shopify catalog"))


async def sync_catalog(db: AsyncSession, connection: ShopifyConnection) -> ShopifyConnection:
    query = """
    { products(first: 100) { nodes { title handle description variants(first: 20) { nodes { sku title price inventoryQuantity availableForSale } } } } }
    """
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"https://{connection.shop_domain}/admin/api/{settings.SHOPIFY_API_VERSION}/graphql.json",
            headers={"X-Shopify-Access-Token": _decrypt(connection.access_token_encrypted), "Content-Type": "application/json"},
            json={"query": query},
        )
        response.raise_for_status()
    payload = response.json()
    if payload.get("errors"):
        raise ValueError("Shopify catalog sync failed")
    products = payload.get("data", {}).get("products", {}).get("nodes", [])
    await db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.site_id == connection.site_id, KnowledgeChunk.source_name == "Shopify catalog"))
    for index, product in enumerate(products):
        variants = product.get("variants", {}).get("nodes", [])
        variant_lines = [
            f"{variant.get('title') or 'Default'}: SKU {variant.get('sku') or 'n/a'}, price {variant.get('price') or 'n/a'}, stock {variant.get('inventoryQuantity') if variant.get('inventoryQuantity') is not None else 'unknown'}, available {variant.get('availableForSale')}"
            for variant in variants
        ]
        content = "\n".join([
            f"Product: {product.get('title') or ''}",
            f"Handle: {product.get('handle') or ''}",
            f"Description: {product.get('description') or ''}",
            "Variants:",
            *variant_lines,
        ])
        db.add(KnowledgeChunk(site_id=connection.site_id, source_name="Shopify catalog", content=content, chunk_index=index))
    connection.product_count = len(products)
    connection.last_synced_at = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.flush()
    return connection
