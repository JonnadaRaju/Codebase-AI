import uuid
import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, Project
from app.services.file_processor import extract_files_from_zip, extract_files_from_github
from app.services.chunker import chunk_all_files
from app.services.embedder import store_chunks

router = APIRouter()


@router.post("/upload/zip")
async def upload_zip(
    file: UploadFile = File(...),
    project_name: str = Form(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")

    project_id = str(uuid.uuid4())

    # Save uploaded ZIP temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        # Create project record
        project = Project(id=project_id, name=project_name, source="zip", status="processing")
        db.add(project)
        db.commit()

        # Extract → Chunk → Embed
        files = extract_files_from_zip(tmp_path)
        if not files:
            raise HTTPException(status_code=400, detail="No valid source files found in ZIP.")

        chunks = chunk_all_files(files)
        stored = store_chunks(project_id, chunks)

        # Update project record
        project.total_files = len(files)
        project.total_chunks = stored
        project.status = "ready"
        db.commit()

    except Exception as e:
        project.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

    return {
        "project_id": project_id,
        "project_name": project_name,
        "total_files": len(files),
        "total_chunks": stored,
        "status": "ready"
    }


@router.post("/upload/github")
async def upload_github(
    github_url: str = Form(...),
    project_name: str = Form(...),
    db: Session = Depends(get_db)
):
    if "github.com" not in github_url:
        raise HTTPException(status_code=400, detail="Please provide a valid GitHub URL.")

    project_id = str(uuid.uuid4())

    try:
        project = Project(id=project_id, name=project_name, source="github", status="processing")
        db.add(project)
        db.commit()

        files = extract_files_from_github(github_url)
        if not files:
            raise HTTPException(status_code=400, detail="No valid source files found in repository.")

        chunks = chunk_all_files(files)
        stored = store_chunks(project_id, chunks)

        project.total_files = len(files)
        project.total_chunks = stored
        project.status = "ready"
        db.commit()

    except Exception as e:
        project.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "project_id": project_id,
        "project_name": project_name,
        "total_files": len(files),
        "total_chunks": stored,
        "status": "ready"
    }