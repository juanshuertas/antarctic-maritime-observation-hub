"""FastAPI entry point."""
from fastapi import FastAPI, Depends, HTTPException
from .database import get_db
from .config import get_settings
from .ais_service import AISService
from .behavioral_analysis import BehavioralAnalysisService
import duckdb

app = FastAPI(
    title="Antarctic Maritime Observation Hub",
    version="0.1.0",
)

def get_ais_service(db: duckdb.DuckDBPyConnection = Depends(get_db)):
    return AISService(db)

def get_behavioral_service(db: duckdb.DuckDBPyConnection = Depends(get_db)):
    return BehavioralAnalysisService(db)

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

@app.get("/ais/summary")
async def ais_summary(service: AISService = Depends(get_ais_service)):
    return service.get_summary()

@app.get("/ais/vessel/{mmsi}")
async def ais_vessel(mmsi: str, service: AISService = Depends(get_ais_service)):
    route = service.get_vessel_route(mmsi)
    if not route:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return route

@app.get("/ais/routes")
async def ais_routes(service: AISService = Depends(get_ais_service)):
    return service.get_all_routes_geojson()

@app.get("/ais/behavior/{mmsi}")
async def ais_behavior(mmsi: str, service: BehavioralAnalysisService = Depends(get_behavioral_service)):
    analysis = service.analyze_behavior(mmsi)
    if analysis.get("status") == "insufficient_data":
        raise HTTPException(status_code=400, detail="Insufficient data to analyze behavior")
    return analysis

