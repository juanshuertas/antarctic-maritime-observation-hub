"""FastAPI entry point."""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import get_db
from .config import get_settings
from .routers import ais, exports, gee, observations, public_routes


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    get_db()
    print("[AMOH] Backend iniciado")
    yield

app = FastAPI(
    title="Antarctic Maritime Observation Hub",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(ais.router)
app.include_router(observations.router)
app.include_router(exports.router)
app.include_router(gee.router)
app.include_router(public_routes.router)


@app.get("/health")
async def health():
    s = get_settings()
    return {
        "status": "ok",
        "service": "Antarctic Maritime Observation Hub",
        "expedition": s.expedition_id,
        "version": s.version,
    }