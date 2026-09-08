"""add comment moderation audit fields

Revision ID: 0013
Revises: 0012
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0013"
down_revision: Union[str, None] = "0012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("comments", sa.Column("moderation_confidence", sa.Float(), nullable=True))
    op.add_column("comments", sa.Column("moderation_reason", sa.Text(), nullable=True))
    op.add_column(
        "comments",
        sa.Column("decision_source", sa.String(), server_default="ai", nullable=False),
    )
    op.create_index("ix_comments_site_status_spam_score", "comments", ["site_id", "status", "spam_score"])


def downgrade() -> None:
    op.drop_index("ix_comments_site_status_spam_score", table_name="comments")
    op.drop_column("comments", "decision_source")
    op.drop_column("comments", "moderation_reason")
    op.drop_column("comments", "moderation_confidence")
