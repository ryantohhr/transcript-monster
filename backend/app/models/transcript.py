from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    video_id = Column(String, nullable=False, index=True)
    video_url = Column(String, nullable=False)
    video_title = Column(String, nullable=False)
    channel_name = Column(String, nullable=False)
    thumbnail_url = Column(String)
    publish_date = Column(DateTime, nullable=False)

    text_chunks = Column(JSONB, nullable=False)
    timestamp_chunks = Column(JSONB, nullable=False)