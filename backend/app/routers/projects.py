from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, Project
from app.services.embedder import delete_project_vectors

router = APIRouter()


@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [
        {
            "project_id": p.id,
            "name": p.name,
            "source": p.source,
            "total_files": p.total_files,
            "total_chunks": p.total_chunks,
            "status": p.status,
            "created_at": p.created_at.isoformat()
        }
        for p in projects
    ]


@router.get("/projects/{project_id}")
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {
        "project_id": project.id,
        "name": project.name,
        "source": project.source,
        "total_files": project.total_files,
        "total_chunks": project.total_chunks,
        "status": project.status,
        "created_at": project.created_at.isoformat()
    }


@router.get("/projects/{project_id}/files")
def get_project_files(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Get unique filenames from ChromaDB vectors
    from app.services.embedder import get_collection
    try:
        collection = get_collection(project_id)
        results = collection.get(include=["metadatas"])
        filenames = []
        seen = set()
        for meta in results.get("metadatas", []):
            fn = meta.get("filename", "")
            if fn and fn not in seen:
                seen.add(fn)
                filenames.append(fn)
        filenames.sort()
    except Exception:
        filenames = []

    return {"project_id": project_id, "files": filenames, "total": len(filenames)}



def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # Delete vectors from ChromaDB
    delete_project_vectors(project_id)

    # Delete from DB
    db.delete(project)
    db.commit()

    return {"message": f"Project '{project.name}' deleted successfully."}