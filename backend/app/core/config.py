from pydantic_settings import BaseSettings
from functools import lru_cache
import logging
import os

logger = logging.getLogger(__name__)

INSECURE_SECRET_KEYS = {
    "change-this-secret-key-in-production",
    "careercure-super-secret-key-fyp-2024",
    "your-super-secret-key-change-this",
    "CHANGE_ME_GENERATE_A_LONG_RANDOM_STRING",
}


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CareerCure API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://careercure:careercure@localhost:5432/careercure"

    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Groq LLM
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # ChromaDB
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # HuggingFace Embeddings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Gmail SMTP
    GMAIL_USER: str = ""
    GMAIL_APP_PASSWORD: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""

    # External Job/Course APIs
    JSEARCH_API_KEY: str = ""  # RapidAPI JSearch - Free tier 100 requests/month
    ADZUNA_API_ID: str = ""    # Adzuna API - Free tier
    ADZUNA_API_KEY: str = ""   # Adzuna API - Free tier
    
    # RapidAPI Keys for LinkedIn and Indeed
    RAPIDAPI_KEY: str = ""     # Your RapidAPI key for LinkedIn/Indeed APIs
    LINKEDIN_JOBS_API_KEY: str = ""  # linkedin-job-search-api.p.rapidapi.com
    INDEED_JOBS_API_KEY: str = ""    # indeed12.p.rapidapi.com
    
    UDEMY_CLIENT_ID: str = ""  # Udemy API (requires approval)
    UDEMY_CLIENT_SECRET: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"

    @property
    def get_allowed_origins(self) -> list:
        """Parse ALLOWED_ORIGINS string into list"""
        if self.ALLOWED_ORIGINS:
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        return ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    _settings = Settings()
    if _settings.SECRET_KEY in INSECURE_SECRET_KEYS or len(_settings.SECRET_KEY) < 32:
        logger.warning(
            "SECRET_KEY is insecure or too short (%d chars). Generate a strong one with "
            "`python -c \"import secrets; print(secrets.token_urlsafe(64))\"`.",
            len(_settings.SECRET_KEY),
        )
    return _settings


settings = get_settings()
