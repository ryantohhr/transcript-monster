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
                raise ValueError(
                    f"Either DATABASE_URL or all of {missing} must be set"
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
