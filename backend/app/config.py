from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    
    # OpenRouter API Key
    OPENROUTER_API_KEY: str
    
    # Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # PostgreSQL Database
    DATABASE_URL: str

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # Chunking
    CHUNK_SIZE: int = 400
    CHUNK_OVERLAP: int = 50
    MAX_FILE_SIZE_KB: int = 500
    TOP_K_RETRIEVAL: int = 8

    class Config:
        env_file = ".env"

settings = Settings()