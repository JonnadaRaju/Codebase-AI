from sentence_transformers import SentenceTransformer
import chromadb
from typing import List, Dict
from app.config import settings
import os

embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)

os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)


def get_collection(project_id: str):
    return chroma_client.get_or_create_collection(
        name=f"project_{project_id}",
        metadata={"hnsw:space": "cosine"}
    )


def store_chunks(project_id: str, chunks: List[Dict]) -> int:
    if not chunks:
        return 0

    collection = get_collection(project_id)

    texts = [c["text"] for c in chunks]
    metadatas = [
        {
            "filename": c["filename"],
            "language": c["language"],
            "start_line": c["start_line"],
            "end_line": c["end_line"],
            "project_id": project_id,
        }
        for c in chunks
    ]
    ids = [f"{project_id}_chunk_{i}" for i in range(len(chunks))]

    batch_size = 100
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i + batch_size]
        batch_meta = metadatas[i:i + batch_size]
        batch_ids = ids[i:i + batch_size]

        embeddings = embedding_model.encode(batch_texts, show_progress_bar=False).tolist()

        collection.add(
            documents=batch_texts,
            embeddings=embeddings,
            metadatas=batch_meta,
            ids=batch_ids
        )

    return len(chunks)


def delete_project_vectors(project_id: str):

    try:
        chroma_client.delete_collection(f"project_{project_id}")
    except Exception:
        pass