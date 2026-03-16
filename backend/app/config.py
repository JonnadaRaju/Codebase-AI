from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):
    APP_ENV: Literal["development", "production"] = "development"

    # ── LLM Provider ──────────────────────────────────────
    LLM_PROVIDER: Literal["openrouter", "ollama"] = "openrouter"

    # ── OpenRouter ────────────────────────────────────────
    OPENROUTER_API_KEY: str = ""

    # ── Ollama ────────────────────────────────────────────
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL:    str = "llama3.2:3b"

    # ── Embeddings ────────────────────────────────────────
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # ── PostgreSQL ────────────────────────────────────────
    DATABASE_URL: str

    # ── ChromaDB ──────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # ── Chunking ──────────────────────────────────────────
    CHUNK_SIZE:       int = 400
    CHUNK_OVERLAP:    int = 50
    MAX_FILE_SIZE_KB: int = 500
    TOP_K_RETRIEVAL:  int = 8

    # ── JWT Auth ────────────────────────────────────────────
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: str = ""

    @property
    def cors_origins(self) -> list[str]:
        if not self.CORS_ORIGINS.strip():
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def validate_runtime(self) -> None:
        if self.APP_ENV != "production":
            return
        if self.JWT_SECRET_KEY == "your-secret-key-change-in-production":
            raise ValueError("JWT_SECRET_KEY must be changed in production.")
        if self.cors_origins == ["*"]:
            raise ValueError("CORS_ORIGINS must be set explicitly in production.")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # strip inline comments and extra spaces from .env values
        extra = "ignore"

settings = Settings()
