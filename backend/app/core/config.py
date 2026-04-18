from urllib.parse import quote_plus

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str | None = None

    POSTGRES_USER: str | None = None
    POSTGRES_PASSWORD: str | None = None
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str | None = None

    SQL_ECHO: bool = False

    GOOGLE_API_KEY: str | None = None

    # LLM provider: "openrouter" or "anthropic"
    LLM_PROVIDER: str = "openrouter"

    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_MODEL: str | None = None

    ANTHROPIC_API_KEY: str | None = None
    ANTHROPIC_MODEL: str | None = None

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    @model_validator(mode="after")
    def check_db_config(self) -> "Settings":
        if not self.DATABASE_URL:
            missing = [
                name
                for name in ("POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB")
                if not getattr(self, name)
            ]
            if missing:
                raise ValueError(f"Either DATABASE_URL or all of {missing} must be set")

        provider = self.LLM_PROVIDER.lower()
        if provider == "openrouter":
            missing_llm = [
                name
                for name in ("OPENROUTER_API_KEY", "OPENROUTER_MODEL")
                if not getattr(self, name)
            ]
            if missing_llm:
                raise ValueError(
                    f"LLM_PROVIDER=openrouter requires: {', '.join(missing_llm)}"
                )
        elif provider == "anthropic":
            missing_llm = [
                name
                for name in ("ANTHROPIC_API_KEY", "ANTHROPIC_MODEL")
                if not getattr(self, name)
            ]
            if missing_llm:
                raise ValueError(
                    f"LLM_PROVIDER=anthropic requires: {', '.join(missing_llm)}"
                )
        else:
            raise ValueError(
                f"Unknown LLM_PROVIDER={provider!r}. Must be 'openrouter' or 'anthropic'."
            )

        return self

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL

        password = quote_plus(self.POSTGRES_PASSWORD)  # type: ignore[arg-type]
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{password}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
