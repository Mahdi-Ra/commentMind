"""add subscription lifecycle and site connection fields

Revision ID: 0011
Revises: 0010
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("plan_ends_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("trial_reminder_sent_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("plan_reminder_sent_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("welcome_email_sent_at", sa.DateTime(), nullable=True))
    op.add_column("sites", sa.Column("last_connected_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("sites", "last_connected_at")
    op.drop_column("users", "welcome_email_sent_at")
    op.drop_column("users", "plan_reminder_sent_at")
    op.drop_column("users", "trial_reminder_sent_at")
    op.drop_column("users", "plan_ends_at")
