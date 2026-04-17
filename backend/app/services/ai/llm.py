"""LLM client factory for OpenRouter via the native langchain-openrouter integration."""

import logging

from langchain_openrouter import ChatOpenRouter

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_llm(*, streaming: bool = True) -> ChatOpenRouter:
    logger.debug(
        "Creating LLM client: model=%s streaming=%s",
        settings.OPENROUTER_MODEL,
        streaming,
    )

    return ChatOpenRouter(
        model=settings.OPENROUTER_MODEL,  # type: ignore[arg-type]
        api_key=settings.OPENROUTER_API_KEY,  # type: ignore[arg-type]
        streaming=streaming,
        max_retries=1,
    )
