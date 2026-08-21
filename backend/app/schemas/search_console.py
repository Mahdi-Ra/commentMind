from pydantic import BaseModel, Field


class SearchConsoleStatus(BaseModel):
    configured: bool
    connected: bool
    property_url: str | None = None
    properties: list[str] = Field(default_factory=list)


class SearchConsolePropertySelect(BaseModel):
    property_url: str
