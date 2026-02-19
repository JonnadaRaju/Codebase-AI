from fastapi import FastAPI
from app.routers import upload, query, projects


app = FastAPI(
    title="Codebase AI",
    description="AI-Powered Project Intelligence System",
    version="1.0.0"
)


app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(query.router, prefix="/api", tags=["Query"])
app.include_router(projects.router, prefix="/api", tags=["Projects"])

@app.get("/health")
def health():
    return {"status": "ok", "message": "Codebase AI is running"}