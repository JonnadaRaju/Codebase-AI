from fastapi import FastAPI
from app.routers import upload, query, projects
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import init_db


app = FastAPI(
    title="Codebase AI",
    description="AI-Powered Project Intelligence System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    init_db()


app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(query.router, prefix="/api", tags=["Query"])
app.include_router(projects.router, prefix="/api", tags=["Projects"])

@app.get("/health")
def health():
    return {"status": "ok", "message": "Codebase AI is running"}