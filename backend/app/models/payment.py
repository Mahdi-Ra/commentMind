from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid


class PaymentIntent(Base):
    __tablename__ = "payment_intents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    plan: Mapped[str] = mapped_column(String, nullable=False)
    billing_cycle: Mapped[str] = mapped_column(String, nullable=False, default="monthly")
    currency: Mapped[str] = mapped_column(String, nullable=False, default="USDT")
    network: Mapped[str] = mapped_column(String, nullable=False, default="TRC20")
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)

    status: Mapped[str] = mapped_column(String, nullable=False, default="created")
    tx_hash: Mapped[str] = mapped_column(String, nullable=True)
    note: Mapped[str] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    confirmed_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User")
