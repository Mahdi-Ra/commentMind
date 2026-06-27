"""add pgvector embedding to knowledge_chunks

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-25 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Add embedding column — stores the raw vector as a pgvector literal string
    # e.g. "[0.123,0.456,...]"  (1536 dims = text-embedding-3-small)
    op.add_column(
        "knowledge_chunks",
        sa.Column("embedding", sa.Text(), nullable=True),
    )

    # CREATE INDEX CONCURRENTLY cannot run inside Alembic's transaction.
    # The cast to vector(1536) happens at query time; no generated column needed.
    with op.get_context().autocommit_block():
        op.execute(
            """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_knowledge_chunks_embedding
            ON knowledge_chunks
            USING hnsw ((embedding::vector(1536)) vector_cosine_ops)
            WHERE embedding IS NOT NULL
            """
        )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_knowledge_chunks_embedding")
    op.drop_column("knowledge_chunks", "embedding")
