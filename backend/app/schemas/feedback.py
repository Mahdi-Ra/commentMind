from datetime import datetime

from pydantic import BaseModel, Field


class CustomerFeedbackCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    message: str | None = Field(None, max_length=1000)


class CustomerFeedbackOut(BaseModel):
    id: str
    rating: int
    message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminFeedbackOut(CustomerFeedbackOut):
    user_id: str
    user_email: str
    user_name: str | None
