from datetime import datetime

from pydantic import BaseModel, Field


class AdminOverview(BaseModel):
    total_users: int
    active_users: int
    total_sites: int
    comments_this_month: int
    pending_payments: int


class AdminUserOut(BaseModel):
    id: str
    email: str
    full_name: str | None
    plan: str
    is_active: bool
    sites_count: int
    comments_count: int
    created_at: datetime


class AdminUserUpdate(BaseModel):
    plan: str | None = Field(None, pattern="^(free|starter|pro|agency)$")
    is_active: bool | None = None


class AdminSiteOut(BaseModel):
    id: str
    name: str
    domain: str
    owner_email: str
    owner_name: str | None
    is_active: bool
    comments_count: int
    created_at: datetime


class AdminPaymentOut(BaseModel):
    id: str
    user_id: str
    user_email: str
    plan: str
    billing_cycle: str
    currency: str
    amount: float
    status: str
    tx_hash: str | None
    created_at: datetime
    submitted_at: datetime | None
    confirmed_at: datetime | None
