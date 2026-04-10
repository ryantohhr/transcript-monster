from datetime import datetime

from sqlalchemy import String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )
    video_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    video_url: Mapped[str] = mapped_column(String, nullable=False)
    video_title: Mapped[str] = mapped_column(String, nullable=False)
    channel_name: Mapped[str] = mapped_column(String, nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String, nullable=True)
    publish_date: Mapped[datetime] = mapped_column(nullable=False)

    text_chunks: Mapped[list] = mapped_column(JSONB, nullable=False)
    timestamp_chunks: Mapped[list] = mapped_column(JSONB, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<Transcript id={self.id} video_id={self.video_id!r}"
            f" title={self.video_title!r}>"
        )