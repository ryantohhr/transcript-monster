import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.transcript import (
    TranscriptCreateRequest,
    TranscriptCreateResponse,
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
        raise HTTPException(status_code=502, detail="Failed to fetch transcript data")

    return TranscriptCreateResponse(
        transcript=TranscriptSchema.model_validate(transcript)
    )
