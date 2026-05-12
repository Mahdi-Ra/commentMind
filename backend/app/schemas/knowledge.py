from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class KnowledgeAdd(BaseModel):
    content: str
    source_name: Optional[str] = "manual"


class KnowledgeOut(BaseModel):
    id: str
    source_name: Optional[str]
    content: str
    chunk_index: int
    created_at: datetime

    model_config = {"from_attributes": True}
