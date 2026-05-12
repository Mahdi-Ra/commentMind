from sqlalchemy import String, DateTime, ForeignKey, Text, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(String, ForeignKey("sites.id"), nullable=False)
    
    source_name: Mapped[str] = mapped_column(String, nullable=True)  # filename or "manual"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    site: Mapped["Site"] = relationship("Site", back_populates="knowledge_chunks")
