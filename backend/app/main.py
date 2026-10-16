"""FastAPI entry point."""
from fastapi import FastAPI
from .database import get_db
from .config import get_settings

app = FastAPI(
    title="Antarctic Maritime Observation Hub",
    version="0.1.0",
)

@app.on_event("startup")
async def startup():
    get_db()
    print("[AMOH] Backend iniciado")

@app.get("/health")
async def health():
    s = get_settings()
    return {
        "status": "ok",
        "service": "Antarctic Maritime Observation Hub",
        "expedition": s.expedition_id,
        "version": s.version,
    }