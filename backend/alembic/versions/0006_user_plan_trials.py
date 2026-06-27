"""add user plan trial fields

Revision ID: 0006
Revises: 0005
Create Date: 2026-06-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("trial_plan", sa.String(), nullable=True))
    op.add_column("users", sa.Column("trial_started_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("trial_ends_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "trial_ends_at")
    op.drop_column("users", "trial_started_at")
    op.drop_column("users", "trial_plan")
