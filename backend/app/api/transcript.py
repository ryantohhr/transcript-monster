from fastapi import APIRouter

from app.services.transcript import create_transcript

router = APIRouter(prefix="/transcript", tags=["transcript"])

@router.post("/create")
def create_transcript_endpoint(video_url: str):
    transcript = create_transcript(video_url)
    return {"transcript": transcript}
