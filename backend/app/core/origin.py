from urllib.parse import urlparse
from app.core.config import settings


def _normalize_host(host: str | None) -> str:
    if not host:
        return ""
    h = host.lower().strip()
    if h.startswith("www."):
        h = h[4:]
    return h


def origin_matches_domain(origin: str | None, domain: str) -> bool:
    """Check if browser Origin is allowed for the registered site domain."""
    if not origin:
        return settings.DEBUG

    try:
        parsed = urlparse(origin)
        host = _normalize_host(parsed.hostname)
    except Exception:
        return False

    if settings.WIDGET_ALLOW_LOCALHOST_ORIGINS and host in (
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
    ):
        return True

    site_host = _normalize_host(domain.split("/")[0].split(":")[0])
    if not site_host:
        return False

    return host == site_host or host.endswith(f".{site_host}")
