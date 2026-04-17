import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

class ChatSessionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    transcript_id: int
    created_at: datetime

class ChatMessageSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime

class ChatSessionCreateRequest(BaseModel):
    transcript_id: int

class ChatSessionCreateResponse(BaseModel):
    session: ChatSessionSchema

class ChatMessageRequest(BaseModel):
    content: str

class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessageSchema]
