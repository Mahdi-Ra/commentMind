from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CheckoutCreate(BaseModel):
    plan: str = Field(..., pattern="^(starter|pro|agency)$")
    billing_cycle: str = Field("monthly", pattern="^(monthly|annual)$")
    currency: str = Field("USDT", pattern="^(USDT|TRX)$")
    network: str = Field("TRC20", pattern="^(TRC20)$")


class TrialCreate(BaseModel):
    plan: str = Field(..., pattern="^(starter|pro|agency)$")


class PaymentSubmit(BaseModel):
    tx_hash: str = Field(..., min_length=12, max_length=128)
    note: Optional[str] = Field(None, max_length=500)


class PaymentOut(BaseModel):
    id: str
    plan: str
    billing_cycle: str
    currency: str
    network: str
    amount: float
    address: str
    status: str
    tx_hash: Optional[str]
    note: Optional[str]
    expires_at: Optional[datetime]
    submitted_at: Optional[datetime]
    confirmed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class CheckoutOut(BaseModel):
    payment: PaymentOut
    instructions: list[str]


class TrialOut(BaseModel):
    plan: str
    trial_ends_at: datetime
    message: str
