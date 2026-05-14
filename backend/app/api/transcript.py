import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.transcript import Transcript
from app.schemas.transcript import (
    TranscriptCreateRequest,
    TranscriptCreateResponse,
    TranscriptItemResponse,
    TranscriptHistoryResponse,
    TranscriptSchema,
)
from app.services.transcript import create_transcript

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transcript", tags=["transcript"])


@router.post("/create", response_model=TranscriptCreateResponse)
def create_transcript_endpoint(
    body: TranscriptCreateRequest,
    db: Session = Depends(get_db),
):
    try:
        transcript = create_transcript(body.video_url, db)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception:
        logger.exception("Failed to create transcript")
        raise HTTPException(
            status_code=502, detail="Failed to fetch transcript data")

    return TranscriptCreateResponse(
        transcript=TranscriptSchema.model_validate(transcript)
    )


@router.get("/history", response_model=TranscriptHistoryResponse)
def get_transcript_history(
    limit: int = 50,
    db: Session = Depends(get_db),
) -> TranscriptHistoryResponse:
    transcripts = (
        db.query(Transcript)
        .order_by(Transcript.created_at.desc())
        .limit(limit)
        .all()
    )
    return TranscriptHistoryResponse(
        transcripts=[TranscriptSchema.model_validate(t) for t in transcripts]
    )


@router.get("/{transcript_id}", response_model=TranscriptItemResponse)
def get_transcript(
    transcript_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> TranscriptItemResponse:
    transcript = db.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return TranscriptItemResponse(transcript=TranscriptSchema.model_validate(transcript))


@router.delete("/{transcript_id}", status_code=204)
def delete_transcript(
    transcript_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> None:
    transcript = db.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(status_code=404, detail="Transcript not found")
    db.delete(transcript)
    db.commit()
