from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TransformAI API"
    environment: str = "development"
    database_url: str = "sqlite:///./transformai.db"
    supabase_url: str = ""
    supabase_secret_key: str = ""
    frontend_origin: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    demo_mode: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

