from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

from app.db.base import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    video_id = Column(String, nullable=False, index=True)
    video_url = Column(String, nullable=False)
    video_title = Column(String, nullable=False)
    channel_name = Column(String, nullable=False)
    thumbnail_url = Column(String)
    publish_date = Column(DateTime, nullable=False)

    text_chunks = Column(JSONB, nullable=False)
    timestamp_chunks = Column(JSONB, nullable=False)

    def __repr__(self):
        return (
            f"<Transcript video_id={self.video_id!r} title={self.video_title!r} channel_name={self.channel_name!r} publish_date={self.publish_date}>"
        )