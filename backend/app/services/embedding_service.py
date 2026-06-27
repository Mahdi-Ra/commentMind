"""
Embedding service — generates and retrieves vector embeddings for knowledge chunks.

Uses OpenAI text-embedding-3-small (1536 dims).
Falls back to simple keyword search if embeddings are unavailable.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

if TYPE_CHECKING:
    from app.models.knowledge import KnowledgeChunk

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMS = 1536

_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def embed_text(text_input: str) -> list[float] | None:
    """Return embedding vector for a single text string, or None on failure."""
    try:
        response = await _client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text_input.replace("\n", " "),
        )
        return response.data[0].embedding
    except Exception as exc:
        logger.warning("Embedding generation failed: %s", exc)
        return None


def _vector_to_pg(vec: list[float]) -> str:
    """Convert a Python float list to Postgres vector literal string."""
    return "[" + ",".join(f"{v:.8f}" for v in vec) + "]"


async def embed_chunk(db: AsyncSession, chunk: "KnowledgeChunk") -> None:
    """
    Generate and persist an embedding for a single KnowledgeChunk.
    Silently skips if OpenAI is unavailable.
    """
    vec = await embed_text(chunk.content)
    if vec is None:
        return

    pg_vec = _vector_to_pg(vec)
    chunk.embedding = pg_vec

    # Also update the generated vector column directly via raw SQL
    # (SQLAlchemy doesn't know about the generated column)
    await db.execute(
        text(
            "UPDATE knowledge_chunks "
            "SET embedding = :emb "
            "WHERE id = :id"
        ),
        {"emb": pg_vec, "id": chunk.id},
    )


async def get_relevant_chunks(
    db: AsyncSession,
    site_id: str,
    query: str,
    limit: int = 8,
) -> list[str]:
    """
    Return the most relevant knowledge chunk contents for a query.

    Uses cosine similarity via pgvector when embeddings exist,
    falls back to simple LIMIT query otherwise.
    """
    query_vec = await embed_text(query)

    if query_vec is not None:
        pg_vec = _vector_to_pg(query_vec)
        try:
            result = await db.execute(
                text(
                    """
                    SELECT content
                    FROM knowledge_chunks
                    WHERE site_id = :site_id
                      AND embedding IS NOT NULL
                    ORDER BY embedding::vector(1536) <=> :query_vec::vector(1536)
                    LIMIT :limit
                    """
                ),
                {"site_id": site_id, "query_vec": pg_vec, "limit": limit},
            )
            rows = result.fetchall()
            if rows:
                return [row[0] for row in rows]
        except Exception as exc:
            logger.warning("Vector search failed, falling back to FIFO: %s", exc)

    # Fallback: return most recent chunks
    result = await db.execute(
        text(
            "SELECT content FROM knowledge_chunks "
            "WHERE site_id = :site_id "
            "ORDER BY created_at DESC "
            "LIMIT :limit"
        ),
        {"site_id": site_id, "limit": limit},
    )
    return [row[0] for row in result.fetchall()]
