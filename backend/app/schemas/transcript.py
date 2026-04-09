from pydantic import BaseModel

class TranscriptSchema(BaseModel):
    video_id: str
    video_url: str
    video_title: str
    channel_name: str
    thumbnail_url: Optional[str] = None
    publish_date: datetime
    text_chunks: List[Dict]
    timestamp_chunks: List[Dict]

    class Config:
        orm_mode = True