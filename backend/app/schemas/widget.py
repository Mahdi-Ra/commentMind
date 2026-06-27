from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WidgetConfigOut(BaseModel):
    site_id: str
    site_name: str
    language: str
    tone: str
    auto_reply: bool
    auto_approve: bool
    auto_spam: bool


class WidgetPingOut(BaseModel):
    ok: bool
    site_name: str
    message: str = "Connection successful"


class WidgetCommentPublic(BaseModel):
    id: str
    author_name: Optional[str]
    content: str
    ai_reply: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TestConnectionIn(BaseModel):
    api_key: str
