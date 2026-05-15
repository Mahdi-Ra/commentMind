from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CommentMind AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"
    
    # Database
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://commentmind:commentmind@db:5432/commentmind"
    DATABASE_URL_SYNC: str = "postgresql://commentmind:commentmind@db:5432/commentmind"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    
    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # Spam thresholds
    SPAM_CONFIDENCE_THRESHOLD: float = 0.85
    AUTO_APPROVE_THRESHOLD: float = 0.90

    class Config:
        env_file = ".env"


settings = Settings()
