"""add composite index for monthly comment count queries

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-25 00:02:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Composite index used by enforce_comment_limit (site_id + created_at)
    op.create_index(
        "ix_comments_site_created",
        "comments",
        ["site_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_comments_site_created", table_name="comments")
