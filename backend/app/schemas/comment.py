from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CommentSubmit(BaseModel):
    """Payload sent by WordPress plugin or JS widget"""
    external_id: Optional[str] = None
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    content: str
    post_title: Optional[str] = None
    post_url: Optional[str] = None


class CommentResult(BaseModel):
    """Response back to the plugin/widget"""
    comment_id: str
    status: str          # approved | spam | uncertain
    ai_reply: Optional[str] = None
    spam_score: float
    intent: Optional[str] = None
    sentiment: Optional[str] = None


class CommentOut(BaseModel):
    id: str
    external_id: Optional[str]
    author_name: Optional[str]
    content: str
    post_title: Optional[str]
    status: str
    intent: Optional[str]
    spam_score: Optional[float]
    sentiment: Optional[str]
    ai_reply: Optional[str]
    reply_sent: bool
    created_at: datetime
    processed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class CommentStats(BaseModel):
    total: int
    approved: int
    spam: int
    replied: int
    uncertain: int
    today: int
