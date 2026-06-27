from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SiteCreate(BaseModel):
    name: str
    domain: str
    tone: str = "friendly"
    language: str = "en"
    custom_instructions: Optional[str] = None
    auto_reply: bool = True
    auto_approve: bool = True
    auto_spam: bool = True


class SiteUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    domain: Optional[str] = Field(None, min_length=1, max_length=255)
    tone: Optional[str] = None
    language: Optional[str] = None
    custom_instructions: Optional[str] = None
    auto_reply: Optional[bool] = None
    auto_approve: Optional[bool] = None
    auto_spam: Optional[bool] = None
    spam_threshold: Optional[float] = None
    approve_threshold: Optional[float] = None


class SiteOut(BaseModel):
    id: str
    name: str
    domain: str
    tone: str
    language: str
    custom_instructions: Optional[str]
    auto_reply: bool
    auto_approve: bool
    auto_spam: bool
    spam_threshold: float
    approve_threshold: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SiteWithKey(SiteOut):
    api_key: str  # Only shown on creation
