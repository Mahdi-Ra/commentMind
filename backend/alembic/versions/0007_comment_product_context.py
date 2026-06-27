"""add product context to comments

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-19 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("comments", sa.Column("product_sku", sa.String(), nullable=True))
    op.add_column("comments", sa.Column("product_price", sa.String(), nullable=True))
    op.add_column("comments", sa.Column("product_stock_status", sa.String(), nullable=True))
    op.add_column("comments", sa.Column("product_context", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("comments", "product_context")
    op.drop_column("comments", "product_stock_status")
    op.drop_column("comments", "product_price")
    op.drop_column("comments", "product_sku")
