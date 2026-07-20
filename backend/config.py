"""Application configuration.

All settings are read from environment variables (optionally via a local
`.env` file) so that secrets like the database password never live in source
control. Sensible defaults are provided for local development.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Database ---
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "postgres"
    db_user: str = "postgres"
    db_password: str = "postgres"
    db_pool_min: int = 1
    db_pool_max: int = 10

    # --- CORS ---
    # Comma-separated list of allowed origins for the browser frontend.
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- Face recognition ---
    face_model_name: str = "buffalo_l"
    face_match_threshold: float = 0.6

    @property
    def dsn(self) -> dict:
        return {
            "host": self.db_host,
            "port": self.db_port,
            "dbname": self.db_name,
            "user": self.db_user,
            "password": self.db_password,
        }

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
