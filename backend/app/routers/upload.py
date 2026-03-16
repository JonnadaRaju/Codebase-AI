import uuid
import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, Project
from app.routers.auth import get_current_user
from app.services.file_processor import extract_files_from_zip, extract_files_from_github
from app.services.chunker import chunk_all_files
from app.services.embedder import store_chunks

router = APIRouter()


def clean_github_url(url: str) -> str:
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    if url.endswith('.git'):
        url = url[:-4]
    url = url.rstrip('/')
    return url


@router.post("/upload/zip")
async def upload_zip(
    file: UploadFile = File(...),
    project_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported.")

    project_id = str(uuid.uuid4())

    # Save uploaded ZIP temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    project = None
    try:
        # Create project record
        project = Project(
            id=project_id,
            user_id=current_user.id,
            name=project_name,
            source="zip",
            status="processing",
        )
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
        if project is not None:
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
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if "github.com" not in github_url:
        raise HTTPException(status_code=400, detail="Please provide a valid GitHub URL.")

    github_url = clean_github_url(github_url)

    if not github_url.endswith(".git"):
        github_url = github_url + ".git"

    project_id = str(uuid.uuid4())

    project = None
    try:
        project = Project(
            id=project_id,
            user_id=current_user.id,
            name=project_name,
            source="github",
            status="processing",
        )
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

    except HTTPException:
        if project is not None:
            project.status = "failed"
            db.commit()
        raise
    except Exception as e:
        if project is not None:
            project.status = "failed"
            db.commit()
        error_msg = str(e).lower()
        if 'not found' in error_msg or 'could not find' in error_msg:
            raise HTTPException(status_code=404, detail="Repository not found. Check if it is public.")
        elif 'rate limit' in error_msg or '403' in error_msg:
            raise HTTPException(status_code=429, detail="GitHub rate limit. Try again in 1 hour.")
        elif 'timeout' in error_msg or 'timed out' in error_msg:
            raise HTTPException(status_code=408, detail="Repository too large or slow. Try ZIP upload.")
        else:
            raise HTTPException(status_code=500, detail=f"Clone failed: {error_msg}")

    return {
        "project_id": project_id,
        "project_name": project_name,
        "total_files": len(files),
        "total_chunks": stored,
        "status": "ready"
    }
