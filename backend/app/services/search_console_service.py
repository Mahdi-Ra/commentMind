"""Read-only Google Search Console integration and page-query context cache."""
from __future__ import annotations

import base64
import hashlib
import json
import logging
from datetime import datetime, timedelta, timezone
from urllib.parse import quote, urlencode

import httpx
from cryptography.fernet import Fernet
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, decode_token
from app.models.search_console import SearchConsoleConnection, SearchConsoleQueryCache

logger = logging.getLogger(__name__)
GOOGLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
SEARCH_CONSOLE_API = "https://searchconsole.googleapis.com/webmasters/v3"


def is_configured() -> bool:
    return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET and settings.GOOGLE_OAUTH_REDIRECT_URI)


def _fernet() -> Fernet:
    key = base64.urlsafe_b64encode(hashlib.sha256(settings.SECRET_KEY.encode()).digest())
    return Fernet(key)


def _encrypt(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def _decrypt(value: str | None) -> str | None:
    if not value:
        return None
    return _fernet().decrypt(value.encode()).decode()


def build_authorize_url(user_id: str, site_id: str) -> str:
    if not is_configured():
        raise ValueError("Google Search Console is not configured")
    state = create_access_token(
        {"sub": user_id, "site_id": site_id, "purpose": "search_console_oauth"},
        expires_delta=timedelta(minutes=10),
    )
    params = {
        'client_id': settings.GOOGLE_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_OAUTH_REDIRECT_URI,
        'response_type': 'code',
        'scope': GOOGLE_SCOPE,
        'access_type': 'offline',
        'prompt': 'consent',
        'state': state,
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


async def complete_authorization(db: AsyncSession, code: str, state: str) -> tuple[str, str]:
    payload = decode_token(state)
    if not payload or payload.get("purpose") != "search_console_oauth":
        raise ValueError("Invalid or expired connection request")
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        response.raise_for_status()
    token = response.json()
    result = await db.execute(select(SearchConsoleConnection).where(SearchConsoleConnection.site_id == payload["site_id"]))
    connection = result.scalar_one_or_none()
    expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(seconds=int(token.get("expires_in", 3600)))
    if connection is None:
        connection = SearchConsoleConnection(
            site_id=payload["site_id"],
            access_token_encrypted=_encrypt(token["access_token"]),
            refresh_token_encrypted=_encrypt(token["refresh_token"]) if token.get("refresh_token") else None,
            token_expires_at=expires_at,
        )
        db.add(connection)
    else:
        connection.access_token_encrypted = _encrypt(token["access_token"])
        if token.get("refresh_token"):
            connection.refresh_token_encrypted = _encrypt(token["refresh_token"])
        connection.token_expires_at = expires_at
    await db.flush()
    return payload["site_id"], payload["sub"]


async def _access_token(db: AsyncSession, connection: SearchConsoleConnection) -> str:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if connection.token_expires_at and connection.token_expires_at > now + timedelta(minutes=2):
        return _decrypt(connection.access_token_encrypted) or ""
    refresh_token = _decrypt(connection.refresh_token_encrypted)
    if not refresh_token:
        raise ValueError("Google authorization expired. Reconnect Search Console.")
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(GOOGLE_TOKEN_URL, data={
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        })
        response.raise_for_status()
    token = response.json()
    connection.access_token_encrypted = _encrypt(token["access_token"])
    connection.token_expires_at = now + timedelta(seconds=int(token.get("expires_in", 3600)))
    await db.flush()
    return token["access_token"]


async def list_properties(db: AsyncSession, connection: SearchConsoleConnection) -> list[str]:
    token = await _access_token(db, connection)
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{SEARCH_CONSOLE_API}/sites", headers={"Authorization": f"Bearer {token}"})
        response.raise_for_status()
    return [item["siteUrl"] for item in response.json().get("siteEntry", []) if item.get("permissionLevel") != "siteUnverifiedUser"]


async def get_connection(db: AsyncSession, site_id: str) -> SearchConsoleConnection | None:
    result = await db.execute(select(SearchConsoleConnection).where(SearchConsoleConnection.site_id == site_id))
    return result.scalar_one_or_none()


async def disconnect(db: AsyncSession, site_id: str) -> None:
    connection = await get_connection(db, site_id)
    if connection:
        await db.delete(connection)


async def get_page_query_context(db: AsyncSession, site_id: str, page_url: str | None) -> str:
    """Return a concise, cached GSC query context. Never blocks comment moderation."""
    if not page_url:
        return ""
    try:
        cache_result = await db.execute(select(SearchConsoleQueryCache).where(SearchConsoleQueryCache.site_id == site_id, SearchConsoleQueryCache.page_url == page_url))
        cache = cache_result.scalar_one_or_none()
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if cache and cache.refreshed_at > now - timedelta(hours=24):
            queries = json.loads(cache.queries_json)
            return _format_query_context(queries)
        connection = await get_connection(db, site_id)
        if not connection or not connection.property_url:
            return ""
        token = await _access_token(db, connection)
        body = {
            "startDate": (now - timedelta(days=90)).date().isoformat(),
            "endDate": (now - timedelta(days=3)).date().isoformat(),
            "dimensions": ["query"],
            "dimensionFilterGroups": [{"filters": [{"dimension": "page", "operator": "equals", "expression": page_url}]}],
            "rowLimit": 10,
        }
        encoded_property = quote(connection.property_url, safe="")
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(f"{SEARCH_CONSOLE_API}/sites/{encoded_property}/searchAnalytics/query", headers={"Authorization": f"Bearer {token}"}, json=body)
            response.raise_for_status()
        queries = [row["keys"][0] for row in response.json().get("rows", []) if row.get("keys")]
        if cache is None:
            cache = SearchConsoleQueryCache(site_id=site_id, page_url=page_url, queries_json=json.dumps(queries), refreshed_at=now)
            db.add(cache)
        else:
            cache.queries_json, cache.refreshed_at = json.dumps(queries), now
        await db.flush()
        return _format_query_context(queries)
    except Exception as exc:
        logger.warning("Search Console query lookup failed; continuing without SEO context: %s", exc)
        return ""


def _format_query_context(queries: list[str]) -> str:
    if not queries:
        return ""
    return "Search Console queries that bring visitors to this page: " + ", ".join(queries)
