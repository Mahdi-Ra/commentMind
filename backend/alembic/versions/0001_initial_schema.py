"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("plan", sa.String(), nullable=False, server_default="free"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── sites ──────────────────────────────────────────────────────────────
    op.create_table(
        "sites",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("owner_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("domain", sa.String(), nullable=False),
        sa.Column("api_key_hash", sa.String(), nullable=False),
        sa.Column("tone", sa.String(), nullable=False, server_default="friendly"),
        sa.Column("language", sa.String(), nullable=False, server_default="en"),
        sa.Column("custom_instructions", sa.Text(), nullable=True),
        sa.Column("auto_reply", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("auto_approve", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("auto_spam", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("spam_threshold", sa.Float(), nullable=False, server_default="0.85"),
        sa.Column("approve_threshold", sa.Float(), nullable=False, server_default="0.90"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("api_key_hash"),
    )

    # ── comments ───────────────────────────────────────────────────────────
    op.create_table(
        "comments",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("site_id", sa.String(), nullable=False),
        sa.Column("external_id", sa.String(), nullable=True),
        sa.Column("author_name", sa.String(), nullable=True),
        sa.Column("author_email", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("post_title", sa.String(), nullable=True),
        sa.Column("post_url", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("intent", sa.String(), nullable=True),
        sa.Column("spam_score", sa.Float(), nullable=True),
        sa.Column("sentiment", sa.String(), nullable=True),
        sa.Column("ai_reply", sa.Text(), nullable=True),
        sa.Column("reply_sent", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("reply_sent_at", sa.DateTime(), nullable=True),
        sa.Column("processing_time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("processed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["site_id"], ["sites.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_comments_site_id", "comments", ["site_id"])
    op.create_index("ix_comments_status", "comments", ["status"])
    op.create_index("ix_comments_created_at", "comments", ["created_at"])

    # ── knowledge_chunks ───────────────────────────────────────────────────
    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("site_id", sa.String(), nullable=False),
        sa.Column("source_name", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["site_id"], ["sites.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_knowledge_chunks_site_id", "knowledge_chunks", ["site_id"])


def downgrade() -> None:
    op.drop_table("knowledge_chunks")
    op.drop_table("comments")
    op.drop_table("sites")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
