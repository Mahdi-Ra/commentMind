"""upgrade comment intent detection

Revision ID: 0014
Revises: 0013
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0014"
down_revision: Union[str, None] = "0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("comments", sa.Column("intent_confidence", sa.Float(), nullable=True))
    op.add_column("comments", sa.Column("sentiment_score", sa.Float(), nullable=True))
    op.add_column("comments", sa.Column("urgency", sa.String(), nullable=True))
    op.add_column("comments", sa.Column("intent_reason", sa.Text(), nullable=True))
    op.add_column("comments", sa.Column("detected_entities", sa.JSON(), nullable=True))
    op.add_column("comment_feedback", sa.Column("corrected_intent", sa.String(), nullable=True))
    op.create_index("ix_comments_site_intent", "comments", ["site_id", "intent"])


def downgrade() -> None:
    op.drop_index("ix_comments_site_intent", table_name="comments")
    op.drop_column("comment_feedback", "corrected_intent")
    op.drop_column("comments", "detected_entities")
    op.drop_column("comments", "intent_reason")
    op.drop_column("comments", "urgency")
    op.drop_column("comments", "sentiment_score")
    op.drop_column("comments", "intent_confidence")
