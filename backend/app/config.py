from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Groq LLM
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    # Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # PostgreSQL Database
    DATABASE_URL: str

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # Chunking
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    MAX_FILE_SIZE_KB: int = 500
    TOP_K_RETRIEVAL: int = 3

    class Config:
        env_file = ".env"

settings = Settings()