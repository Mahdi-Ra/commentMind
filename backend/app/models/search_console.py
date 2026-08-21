from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
import uuid


class SearchConsoleConnection(Base):
    __tablename__ = "search_console_connections"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(String, ForeignKey("sites.id", ondelete="CASCADE"), unique=True, nullable=False)
    property_url: Mapped[str | None] = mapped_column(String, nullable=True)
    access_token_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    refresh_token_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    token_expires_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class SearchConsoleQueryCache(Base):
    __tablename__ = "search_console_query_cache"
    __table_args__ = (UniqueConstraint("site_id", "page_url", name="uq_search_console_cache_page"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(String, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    page_url: Mapped[str] = mapped_column(String, nullable=False)
    queries_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    refreshed_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
