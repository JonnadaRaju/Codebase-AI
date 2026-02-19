from typing import List, Dict
from app.services.embedder import embedding_model, get_collection
from app.config import settings


def retrieve_context(project_id: str, query: str, top_k: int = None) -> List[Dict]:
    if top_k is None:
        top_k = settings.TOP_K_RETRIEVAL

    collection = get_collection(project_id)

    query_embedding = embedding_model.encode([query]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    chunks = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for doc, meta, dist in zip(documents, metadatas, distances):
        chunks.append({
            "text": doc,
            "filename": meta.get("filename", "unknown"),
            "language": meta.get("language", ""),
            "start_line": meta.get("start_line", 0),
            "end_line": meta.get("end_line", 0),
            "relevance_score": round(1 - dist, 4)  # cosine similarity
        })

    return chunks


def format_context_for_llm(chunks: List[Dict]) -> str:

    formatted = []
    for i, chunk in enumerate(chunks, 1):
        formatted.append(
            f"--- File: {chunk['filename']} (Lines {chunk['start_line']}-{chunk['end_line']}) ---\n"
            f"{chunk['text']}"
        )
    return "\n\n".join(formatted)


def get_relevant_filenames(chunks: List[Dict]) -> List[str]:
    seen = set()
    filenames = []
    for chunk in chunks:
        fn = chunk["filename"]
        if fn not in seen:
            seen.add(fn)
            filenames.append(fn)
    return filenames