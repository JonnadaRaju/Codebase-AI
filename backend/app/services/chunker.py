from typing import List, Dict
from app.config import settings


def chunk_code(content: str, filename: str, language: str) -> List[Dict]:

    lines = content.split('\n')
    chunks = []
    chunk_size = settings.CHUNK_SIZE
    overlap = settings.CHUNK_OVERLAP

    step = chunk_size - overlap
    if step <= 0:
        step = chunk_size

    for i in range(0, len(lines), step):
        chunk_lines = lines[i:i + chunk_size]
        chunk_text = '\n'.join(chunk_lines).strip()

        if not chunk_text:
            continue

        chunks.append({
            "text": chunk_text,
            "filename": filename,
            "language": language,
            "start_line": i + 1,
            "end_line": i + len(chunk_lines),
        })

    return chunks


def chunk_all_files(files: List[Dict]) -> List[Dict]:
    all_chunks = []
    for file in files:
        file_chunks = chunk_code(
            content=file["content"],
            filename=file["filename"],
            language=file["language"]
        )
        all_chunks.extend(file_chunks)
    return all_chunks