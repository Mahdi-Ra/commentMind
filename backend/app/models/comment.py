from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, func, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(String, ForeignKey("sites.id"), nullable=False)
    
    # Original comment data
    external_id: Mapped[str] = mapped_column(String, nullable=True)  # WP comment ID
    author_name: Mapped[str] = mapped_column(String, nullable=True)
    author_email: Mapped[str] = mapped_column(String, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    post_title: Mapped[str] = mapped_column(String, nullable=True)
    post_url: Mapped[str] = mapped_column(String, nullable=True)
    product_sku: Mapped[str] = mapped_column(String, nullable=True)
    product_price: Mapped[str] = mapped_column(String, nullable=True)
    product_stock_status: Mapped[str] = mapped_column(String, nullable=True)
    product_context: Mapped[str] = mapped_column(Text, nullable=True)
    
    # AI Analysis
    status: Mapped[str] = mapped_column(String, default="pending")  # pending, approved, spam, replied, uncertain
    intent: Mapped[str] = mapped_column(String, nullable=True)  # question, complaint, praise, spam, other
    spam_score: Mapped[float] = mapped_column(Float, nullable=True)
    sentiment: Mapped[str] = mapped_column(String, nullable=True)  # positive, negative, neutral
    
    # AI Reply
    ai_reply: Mapped[str] = mapped_column(Text, nullable=True)
    reply_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    reply_sent_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    
    # Meta
    processing_time_ms: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    processed_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)

    site: Mapped["Site"] = relationship("Site", back_populates="comments")
