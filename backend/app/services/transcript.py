import logging
from dataclasses import dataclass
from html import unescape
from urllib.parse import parse_qs, urlparse

import requests
from sqlalchemy.orm import Session
from youtube_transcript_api import YouTubeTranscriptApi

from app.core.config import settings
from app.models.transcript import Transcript

logger = logging.getLogger(__name__)

ytt_api = YouTubeTranscriptApi()


@dataclass(frozen=True)
class VideoMetadata:
    title: str
    channel_name: str
    thumbnail_url: str | None
    publish_date: str


def create_transcript(video_url: str, db: Session) -> Transcript:
    video_id = extract_video_id(video_url)

    existing = db.query(Transcript).filter_by(video_id=video_id).first()
    if existing:
        logger.info("Returning existing transcript for video_id=%s", video_id)
        return existing

    raw_transcript = fetch_transcript(video_id)
    metadata = fetch_metadata(video_id)
    text_chunks, timestamp_chunks = get_transcript_chunks(raw_transcript)

    transcript = Transcript(
        video_id=video_id,
        video_url=video_url,
        video_title=metadata.title,
        channel_name=metadata.channel_name,
        thumbnail_url=metadata.thumbnail_url,
        publish_date=metadata.publish_date,
        text_chunks=text_chunks,
        timestamp_chunks=timestamp_chunks,
    )

    save_transcript(transcript, db)
    return transcript


def extract_video_id(video_url: str) -> str:
    parsed_url = urlparse(video_url)
    query_params = parse_qs(parsed_url.query)

    video_id = query_params.get("v", [""])[0]
    if not video_id:
        raise ValueError("Invalid YouTube URL: missing video id")

    return video_id


def fetch_transcript(video_id: str) -> list[dict]:
    transcript = ytt_api.fetch(video_id)
    return transcript.to_raw_data()


def fetch_metadata(video_id: str) -> VideoMetadata:
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is required")

    url = "https://youtube.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet",
        "id": video_id,
        "key": api_key,
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()
    items = data.get("items", [])
    if not items:
        raise ValueError(f"No metadata found for video_id={video_id}")

    snippet = items[0].get("snippet", {})
    thumbnails = snippet.get("thumbnails", {})
    thumbnail_url = (
        thumbnails.get("maxres", {}).get("url")
        or thumbnails.get("standard", {}).get("url")
        or thumbnails.get("high", {}).get("url")
        or thumbnails.get("medium", {}).get("url")
        or thumbnails.get("default", {}).get("url")
    )

    return VideoMetadata(
        title=snippet.get("title", ""),
        channel_name=snippet.get("channelTitle", ""),
        thumbnail_url=thumbnail_url,
        publish_date=snippet.get("publishedAt", ""),
    )


def format_timestamp(seconds: float) -> str:
    total_seconds = int(seconds)
    hours, remainder = divmod(total_seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def get_transcript_chunks(
    raw_transcript: list[dict], chunk_size: int = 3
) -> tuple[list[str], list[str]]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    text_chunks: list[str] = []
    timestamp_chunks: list[str] = []

    for i in range(0, len(raw_transcript), chunk_size):
        chunk_items = raw_transcript[i : i + chunk_size]

        current_text = []
        for item in chunk_items:
            current_text.append(item.get("text", ""))

        chunk_text = unescape(" ".join(current_text)).strip()
        text_chunks.append(chunk_text)

        first_item = chunk_items[0]
        start_time = first_item.get("start", 0)
        timestamp_chunks.append(format_timestamp(float(start_time or 0)))

    return text_chunks, timestamp_chunks


def save_transcript(transcript: Transcript, db: Session) -> None:
    db.add(transcript)
    db.flush()
    db.refresh(transcript)
    logger.info("Saved transcript id=%s for video_id=%s", transcript.id, transcript.video_id)