from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Groq LLM
    # GROQ_API_KEY: str
    # GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    # Gemini LLM
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.0-flash"

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
    TOP_K_RETRIEVAL: int = 10

    class Config:
        env_file = ".env"

settings = Settings()