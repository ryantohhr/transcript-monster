from dotenv import load_dotenv
import os
from urllib.parse import quote_plus

load_dotenv()


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


class Settings:
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    POSTGRES_USER: str | None = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD: str | None = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str | None = os.getenv("POSTGRES_DB")

    SQL_ECHO: bool = os.getenv("SQL_ECHO", "false").lower() in {"1", "true", "yes", "on"}

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL and self.DATABASE_URL.strip():
            return self.DATABASE_URL

        user = _require_env("POSTGRES_USER")
        password = quote_plus(_require_env("POSTGRES_PASSWORD"))
        host = self.POSTGRES_HOST
        port = self.POSTGRES_PORT
        db_name = _require_env("POSTGRES_DB")

        return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db_name}"


settings = Settings()
