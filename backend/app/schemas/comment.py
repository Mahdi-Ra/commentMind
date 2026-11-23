from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


INTENT_TAXONOMY = (
    "purchase_intent",
    "product_inquiry",
    "pricing_inquiry",
    "shipping_inquiry",
    "order_issue",
    "complaint",
    "technical_question",
    "contact_request",
    "positive_feedback",
    "negative_feedback",
    "general_question",
    "spam",
    "other",
)


class DetectedEntity(BaseModel):
    type: Literal["product", "price", "quantity", "order_reference", "delivery"]
    value: str = Field(min_length=1, max_length=160)


class CommentSubmit(BaseModel):
    """Payload sent by WordPress plugin or JS widget"""
    external_id: Optional[str] = None
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    content: str
    post_title: Optional[str] = None
    post_url: Optional[str] = None
    product_sku: Optional[str] = None
    product_price: Optional[str] = None
    product_stock_status: Optional[str] = None
    product_context: Optional[str] = None


class CommentResult(BaseModel):
    """Response back to the plugin/widget"""
    comment_id: str
    status: str          # approved | spam | uncertain
    ai_reply: Optional[str] = None
    spam_score: float
    intent: Optional[str] = None
    intent_confidence: Optional[float] = None
    intent_reason: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    urgency: Optional[str] = None
    detected_entities: list[DetectedEntity] = Field(default_factory=list)
    moderation_confidence: Optional[float] = None
    moderation_reason: Optional[str] = None


class CommentOut(BaseModel):
    id: str
    external_id: Optional[str]
    author_name: Optional[str]
    content: str
    post_title: Optional[str]
    product_sku: Optional[str]
    product_price: Optional[str]
    product_stock_status: Optional[str]
    status: str
    intent: Optional[str]
    intent_confidence: Optional[float]
    intent_reason: Optional[str]
    spam_score: Optional[float]
    moderation_confidence: Optional[float]
    moderation_reason: Optional[str]
    decision_source: str
    sentiment: Optional[str]
    sentiment_score: Optional[float]
    urgency: Optional[str]
    detected_entities: list[DetectedEntity] | None
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


class CommentModerateIn(BaseModel):
    action: str = Field(..., pattern="^(approve|spam|reply|pending|uncertain)$")
    ai_reply: Optional[str] = None
