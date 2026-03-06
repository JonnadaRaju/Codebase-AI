from pydantic_settings import BaseSettings
from typing import Literal

class Settings(BaseSettings):

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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # strip inline comments and extra spaces from .env values
        extra = "ignore"

settings = Settings()