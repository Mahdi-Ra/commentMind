import time
from collections import defaultdict
from threading import Lock

from fastapi import HTTPException, status

from app.core.config import settings

_memory: dict[str, list[float]] = defaultdict(list)
_memory_lock = Lock()


async def check_widget_rate_limit(site_id: str, limit: int | None = None) -> None:
    """Per-site rate limit for widget endpoints (Redis with in-memory fallback)."""
    limit = limit or settings.WIDGET_RATE_LIMIT_PER_MINUTE
    key = f"widget:rl:{site_id}"
    now = time.time()
    window_start = now - 60

    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        try:
            pipe = client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, 120)
            results = await pipe.execute()
            count = results[2]
            if count > limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later.",
                )
        finally:
            await client.aclose()
        return
    except HTTPException:
        raise
    except Exception:
        pass

    with _memory_lock:
        hits = [t for t in _memory[site_id] if t > window_start]
        if len(hits) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
            )
        hits.append(now)
        _memory[site_id] = hits
