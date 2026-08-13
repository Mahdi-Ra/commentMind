from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=120)


class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetResponse(BaseModel):
    message: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    plan: str
    is_active: bool
    # Plan limits — populated by the endpoint, not from the ORM row
    plan_display_name: Optional[str] = None
    plan_max_sites: Optional[int] = None
    plan_max_comments_month: Optional[int] = None
    trial_plan: Optional[str] = None
    trial_ends_at: Optional[datetime] = None
    trial_days_left: Optional[int] = None

    model_config = {"from_attributes": True}
