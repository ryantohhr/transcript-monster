from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class TranscriptSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    video_id: str
    video_url: str
    video_title: str
    channel_name: str
    thumbnail_url: str | None = None
    publish_date: datetime
    created_at: datetime
    text_chunks: list[str]
    timestamp_chunks: list[str]


class TranscriptCreateRequest(BaseModel):
    video_url: str


class TranscriptCreateResponse(BaseModel):
    transcript: TranscriptSchema