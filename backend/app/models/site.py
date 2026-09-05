from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, func, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name: Mapped[str] = mapped_column(String, nullable=False)
    domain: Mapped[str] = mapped_column(String, nullable=False)
    api_key_hash: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    # AI Settings
    tone: Mapped[str] = mapped_column(String, default="friendly")  # formal, friendly, professional
    language: Mapped[str] = mapped_column(String, default="en")
    custom_instructions: Mapped[str] = mapped_column(Text, nullable=True)

    # Moderation Settings
    auto_reply: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_approve: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_spam: Mapped[bool] = mapped_column(Boolean, default=True)
    spam_threshold: Mapped[float] = mapped_column(Float, default=0.85)
    approve_threshold: Mapped[float] = mapped_column(Float, default=0.90)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_connected_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="sites", lazy="selectin")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="site", cascade="all, delete-orphan")
    knowledge_chunks: Mapped[list["KnowledgeChunk"]] = relationship("KnowledgeChunk", back_populates="site", cascade="all, delete-orphan")
