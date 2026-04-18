import logging

from langchain_openrouter import ChatOpenRouter
from langchain_anthropic import ChatAnthropic
from langchain_core.language_models.chat_models import BaseChatModel

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_llm(*, streaming: bool = True) -> BaseChatModel:
    provider = settings.LLM_PROVIDER.lower()

    if provider == "anthropic":
        logger.debug(
            "Creating Anthropic LLM client: model=%s streaming=%s",
            settings.ANTHROPIC_MODEL,
            streaming,
        )
        return ChatAnthropic(
            model=settings.ANTHROPIC_MODEL,  # type: ignore[arg-type]
            api_key=settings.ANTHROPIC_API_KEY,  # type: ignore[arg-type]
            streaming=streaming,
            max_retries=2,
        )

    logger.debug(
        "Creating OpenRouter LLM client: model=%s streaming=%s",
        settings.OPENROUTER_MODEL,
        streaming,
    )
    return ChatOpenRouter(
        model=settings.OPENROUTER_MODEL,  # type: ignore[arg-type]
        api_key=settings.OPENROUTER_API_KEY,  # type: ignore[arg-type]
        streaming=streaming,
        max_retries=1,
    )
