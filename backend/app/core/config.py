from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CommentMind AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"
    PUBLIC_BASE_URL: str = "http://localhost:8000"
    FRONTEND_BASE_URL: str = "http://localhost:3000"

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

    # Widget
    WIDGET_RATE_LIMIT_PER_MINUTE: int = 30
    WIDGET_ALLOW_LOCALHOST_ORIGINS: bool = True

    # Crypto checkout
    USDT_TRC20_ADDRESS: str = ""
    TRX_ADDRESS: str = ""
    PAYMENT_ADMIN_EMAILS: str = ""
    ADMIN_EMAILS: str = ""

    # Google Search Console (optional, read-only OAuth connection)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_OAUTH_REDIRECT_URI: str = ""

    # Optional SMTP for password reset emails
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_USE_TLS: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
