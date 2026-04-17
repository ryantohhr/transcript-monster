import json
import logging
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.models.transcript import Transcript
from app.schemas.chat import (
    ChatHistoryResponse,
    ChatMessageRequest,
    ChatMessageSchema,
    ChatSessionCreateRequest,
    ChatSessionCreateResponse,
    ChatSessionSchema,
)
from app.services.ai.graph import stream_agent_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post(
    "/sessions/create", response_model=ChatSessionCreateResponse, status_code=201
)
def create_chat_session(
    body: ChatSessionCreateRequest,
    db: Session = Depends(get_db),
) -> ChatSessionCreateResponse:
    """Create a new chat session associated with an existing transcript.

    Returns the session ID that the client must pass to subsequent message
    and history endpoints.
    """
    transcript = db.get(Transcript, body.transcript_id)
    if transcript is None:
        raise HTTPException(
            status_code=404,
            detail=f"Transcript {body.transcript_id} not found.",
        )

    session = ChatSession(transcript_id=body.transcript_id)
    db.add(session)
    db.flush()

    logger.info(
        "Created chat session %s for transcript %d", session.id, body.transcript_id
    )

    return ChatSessionCreateResponse(session=ChatSessionSchema.model_validate(session))

@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: uuid.UUID,
    body: ChatMessageRequest,
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """Send a user message and stream the assistant reply via SSE.

    SSE event format
    ----------------
    ``data: {"type": "token",  "content": "<token>"}``  — partial token
    ``data: {"type": "done",   "content": ""}``          — stream finished
    ``data: {"type": "error",  "content": "<message>"}`` — error occurred

    The client should concatenate ``token`` events to reconstruct the full
    response, then treat ``done`` as the signal to stop listening.
    """
    if not body.content.strip():
        raise HTTPException(status_code=422, detail="Message content cannot be empty.")

    session = db.get(ChatSession, session_id)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail=f"Chat session {session_id} not found.",
        )

    transcript = db.get(Transcript, session.transcript_id)
    if transcript is None:
        raise HTTPException(status_code=404, detail="Associated transcript not found.")

    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=body.content.strip(),
    )
    db.add(user_msg)
    db.flush()

    history = _build_lc_messages(session.messages)

    transcript_context = "\n\n".join(transcript.text_chunks)

    async def event_stream() -> AsyncIterator[str]:
        """Generate SSE-formatted events from the agent's token stream."""
        full_response: list[str] = []

        try:
            async for token in stream_agent_response(history, transcript_context):
                full_response.append(token)
                payload = json.dumps({"type": "token", "content": token})
                yield f"data: {payload}\n\n"

            assistant_content = "".join(full_response)
            assistant_msg = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=assistant_content,
            )
            db.add(assistant_msg)
            db.commit()

            logger.info(
                "Session %s: streamed %d tokens for user message %s",
                session_id,
                len(full_response),
                user_msg.id,
            )

            yield f"data: {json.dumps({'type': 'done', 'content': ''})}\n\n"

        except ValueError as exc:
            logger.warning("Chat config error for session %s: %s", session_id, exc)
            db.rollback()
            yield f"data: {json.dumps({'type': 'error', 'content': str(exc)})}\n\n"

        except Exception:
            logger.exception(
                "Unexpected error streaming response for session %s", session_id
            )
            db.rollback()
            yield f"data: {json.dumps({'type': 'error', 'content': 'An unexpected error occurred.'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/sessions/{session_id}/messages", response_model=ChatHistoryResponse)
def get_message_history(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ChatHistoryResponse:
    """Return the full message history for a chat session.

    Messages are returned in chronological order (oldest first). The client
    can call this endpoint on page load to restore a previous conversation.
    """
    session = db.get(ChatSession, session_id)
    if session is None:
        raise HTTPException(
            status_code=404,
            detail=f"Chat session {session_id} not found.",
        )

    messages = [ChatMessageSchema.model_validate(msg) for msg in session.messages]
    return ChatHistoryResponse(messages=messages)


def _build_lc_messages(
    db_messages: list[ChatMessage],
) -> list[HumanMessage | AIMessage]:
    """Convert persisted ChatMessage rows into LangChain message objects.

    Args:
        db_messages: Ordered list of ChatMessage ORM instances.

    Returns:
        List of LangChain ``HumanMessage`` / ``AIMessage`` objects ready to
        be passed to the agent graph.
    """
    lc_messages: list[HumanMessage | AIMessage] = []
    for msg in db_messages:
        if msg.role == "user":
            lc_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            lc_messages.append(AIMessage(content=msg.content))
    return lc_messages
