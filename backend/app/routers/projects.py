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


@router.delete("/projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    delete_project_vectors(project_id)

    db.delete(project)
    db.commit()

    return {"message": f"Project '{project.name}' deleted successfully."}