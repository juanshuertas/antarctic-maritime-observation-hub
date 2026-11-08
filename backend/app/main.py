"""FastAPI entry point for the Antarctic Maritime Observation Hub (AMOH)."""
from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
import re
import socket
from typing import Any
import uuid

import duckdb
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .ais_service import AISService
from .behavioral_analysis import BehavioralAnalysisService
from .config import Settings, get_settings
from .database import get_db, is_spatial_available
from .environmental_service import EnvironmentalService
from .schemas import BrierWeightsRequest, GSDRequest, MatchupRequest, ObservationCreate
from .scientific_metrics import (
    MatchupService,
    calculate_gsd_cm_per_px,
    compute_brier_weights,
)

logger = logging.getLogger("amoh.api")

_MMSI_PATTERN = re.compile(r"^[A-Za-z0-9_-]{3,32}$")


def _validate_mmsi(mmsi: str) -> str:
    cleaned = mmsi.strip()
    if not _MMSI_PATTERN.match(cleaned):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid MMSI format",
        )
    return cleaned


def _detect_lan_ip() -> str:
    """Detecta la dirección IP de la LAN activa evitando loopback (127.0.0.1 / 0.0.0.0)."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.settimeout(0.2)
            sock.connect(("192.0.2.1", 80))
            ip = sock.getsockname()[0]
            if ip and not ip.startswith("127.") and ip != "0.0.0.0":
                return ip
    except OSError:
        pass

    try:
        hostname = socket.gethostname()
        for info in socket.getaddrinfo(hostname, None, socket.AF_INET):
            ip = str(info[4][0])
            if ip and not ip.startswith("127.") and ip != "0.0.0.0":
                return ip
    except OSError:
        pass

    return "192.168.1.100"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Inicializa la base de datos DuckDB al arrancar la aplicación."""
    get_db()
    logger.info("[AMOH] Backend iniciado")
    yield


app = FastAPI(
    title="Antarctic Maritime Observation Hub",
    version="0.1.0",
    lifespan=lifespan,
)

_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    """Aplica cabeceras defensivas contra XSS, Clickjacking y MIME sniffing."""
    # TODO(security): Add OAuth2/JWT RBAC authentication and rate-limiting middleware for production multi-user deployments.
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; frame-ancestors 'none'; object-src 'none'"
    )
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cache-Control"] = "no-store"
    return response


def get_ais_service(db: duckdb.DuckDBPyConnection = Depends(get_db)) -> AISService:
    return AISService(db)


def get_environmental_service(
    db: duckdb.DuckDBPyConnection = Depends(get_db),
) -> EnvironmentalService:
    return EnvironmentalService(db)


def get_behavioral_service(
    db: duckdb.DuckDBPyConnection = Depends(get_db),
    env_service: EnvironmentalService = Depends(get_environmental_service),
) -> BehavioralAnalysisService:
    return BehavioralAnalysisService(db, env_service)


def get_matchup_service(
    db: duckdb.DuckDBPyConnection = Depends(get_db),
    env_service: EnvironmentalService = Depends(get_environmental_service),
) -> MatchupService:
    return MatchupService(db, env_service)


# ---------------------------------------------------------------------------
# Health, System Status & Network Info (LAN QR)
# ---------------------------------------------------------------------------

@app.get("/health")
@app.get("/api/health")
def health(s: Settings = Depends(get_settings)) -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "Antarctic Maritime Observation Hub",
        "expedition": s.expedition_id,
        "version": s.version,
        "environment": s.environment,
    }


@app.get("/api/system/status")
def system_status(
    db: duckdb.DuckDBPyConnection = Depends(get_db),
    s: Settings = Depends(get_settings),
) -> dict[str, Any]:
    """Expone el estado real de cada adaptador/proveedor según la tabla de estados del README."""
    ais_count = db.execute("SELECT count(*) FROM ais_vessels").fetchone()[0]
    obs_count = db.execute("SELECT count(*) FROM observations").fetchone()[0]
    return {
        "status": "ok",
        "expedition_id": s.expedition_id,
        "offline_mode": s.offline_mode,
        "duckdb_spatial_loaded": is_spatial_available(),
        "counts": {
            "ais_positions": ais_count,
            "observations": obs_count,
        },
        "providers": {
            "ais_stream": "LIVE" if s.aisstream_api_key else ("HISTORICAL" if ais_count > 0 else "NOT_CONFIGURED"),
            "global_fishing_watch": "LIVE" if s.gfw_api_token else "NOT_CONFIGURED",
            "environmental_earthdata": "SIMULATION",
            "google_earth_engine": "LIVE" if s.gee_project else "NOT_CONFIGURED",
            "world_id": "LIVE" if s.world_app_id else "NOT_CONFIGURED",
            "pythia_local_ai": "READY",
            "arcgis_surie": "ON_DEMAND",
        },
    }


@app.get("/api/network-info")
def network_info(s: Settings = Depends(get_settings)) -> dict[str, Any]:
    """Resuelve la IP activa de la LAN del barco/expedición para generación de códigos QR."""
    lan_ip = _detect_lan_ip()
    return {
        "lan_ip": lan_ip,
        "frontend_port": s.frontend_port,
        "qr_target_url": f"http://{lan_ip}:{s.frontend_port}/",
        "disallowed_hosts": ["localhost", "127.0.0.1", "0.0.0.0"],
        "environment": s.environment,
    }


# ---------------------------------------------------------------------------
# AIS & Maritime Activity Routes (/ais/* and /api/vessels)
# ---------------------------------------------------------------------------

@app.get("/ais/summary")
def ais_summary(service: AISService = Depends(get_ais_service)) -> dict[str, Any]:
    return service.get_summary()


@app.get("/api/vessels")
def api_vessels(
    mmsi: str | None = Query(default=None),
    search: str | None = Query(default=None, max_length=64),
    min_lat: float | None = Query(default=None, ge=-90.0, le=90.0),
    max_lat: float | None = Query(default=None, ge=-90.0, le=90.0),
    min_lon: float | None = Query(default=None, ge=-180.0, le=180.0),
    max_lon: float | None = Query(default=None, ge=-180.0, le=180.0),
    service: AISService = Depends(get_ais_service),
) -> dict[str, Any]:
    if mmsi is not None:
        mmsi = _validate_mmsi(mmsi)
    vessels = service.list_vessels(
        mmsi=mmsi,
        search=search,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lon=min_lon,
        max_lon=max_lon,
    )
    return {
        "count": len(vessels),
        "data_state": "HISTORICAL" if vessels else "EMPTY",
        "vessels": vessels,
    }


@app.get("/ais/vessel/{mmsi}")
def ais_vessel(mmsi: str, service: AISService = Depends(get_ais_service)) -> dict[str, Any]:
    clean_mmsi = _validate_mmsi(mmsi)
    route = service.get_vessel_route(clean_mmsi)
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vessel not found")
    return route


@app.get("/ais/routes")
def ais_routes(service: AISService = Depends(get_ais_service)) -> dict[str, Any]:
    return service.get_all_routes_geojson()


@app.get("/ais/encounters")
def ais_encounters(
    min_duration_hours: float = Query(default=2.0, ge=0.0, le=720.0),
    max_dist_m: float = Query(default=500.0, gt=0.0, le=50000.0),
    service: AISService = Depends(get_ais_service),
) -> list[dict[str, Any]]:
    return service.get_encounters(min_duration_hours=min_duration_hours, max_dist_m=max_dist_m)


@app.get("/ais/behavior/{mmsi}")
def ais_behavior(
    mmsi: str,
    service: BehavioralAnalysisService = Depends(get_behavioral_service),
) -> dict[str, Any]:
    clean_mmsi = _validate_mmsi(mmsi)
    analysis = service.analyze_behavior(clean_mmsi)
    if analysis.get("status") == "not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vessel not found")
    if analysis.get("status") == "insufficient_data":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient data to analyze behavior",
        )
    return analysis


@app.get("/ais/environment/{mmsi}")
def ais_environment(
    mmsi: str,
    service: EnvironmentalService = Depends(get_environmental_service),
) -> list[dict[str, Any]]:
    clean_mmsi = _validate_mmsi(mmsi)
    correlations = service.correlate_vessel_with_environment(clean_mmsi)
    if not correlations:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vessel not found")
    return correlations


# ---------------------------------------------------------------------------
# Field Observations & Scientific Matchups
# ---------------------------------------------------------------------------

@app.get("/api/observations")
def list_observations(
    expedition_id: str | None = Query(default=None, max_length=64),
    review_state: str | None = Query(default=None, max_length=32),
    limit: int = Query(default=100, ge=1, le=500),
    db: duckdb.DuckDBPyConnection = Depends(get_db),
) -> dict[str, Any]:
    conditions: list[str] = ["1=1"]
    params: list[Any] = []
    if expedition_id:
        conditions.append("expedition_id = ?")
        params.append(expedition_id)
    if review_state:
        conditions.append("review_state = ?")
        params.append(review_state)
    params.append(limit)

    where_sql = " AND ".join(conditions)
    rows = db.execute(
        f"""
        SELECT
            observation_id, expedition_id, utc, latitude, longitude,
            position_source, accuracy_m, observer_type, observation_type,
            quality_level, qa_qc_status, review_state, sharing_permission, notes, created_at
        FROM observations
        WHERE {where_sql}
        ORDER BY utc DESC
        LIMIT ?
        """,
        params,
    ).fetchall()

    observations = [
        {
            "observation_id": r[0],
            "expedition_id": r[1],
            "utc": str(r[2]),
            "latitude": r[3],
            "longitude": r[4],
            "position_source": r[5],
            "accuracy_m": r[6],
            "observer_type": r[7],
            "observation_type": r[8],
            "quality_level": r[9],
            "qa_qc_status": r[10],
            "review_state": r[11],
            "sharing_permission": r[12],
            "notes": r[13],
            "created_at": str(r[14]),
        }
        for r in rows
    ]
    return {"count": len(observations), "observations": observations}


@app.post("/api/observations", status_code=status.HTTP_201_CREATED)
def create_observation(
    payload: ObservationCreate,
    db: duckdb.DuckDBPyConnection = Depends(get_db),
    s: Settings = Depends(get_settings),
) -> dict[str, Any]:
    """Registra una observación de campo.

    Regla científica AMOH: Ninguna contribución se convierte en ciencia validada
    automáticamente; toda observación inicia en estado `UNREVIEWED`.
    """
    obs_id = str(uuid.uuid4())
    exp_id = payload.expedition_id or s.expedition_id
    obs_utc = payload.utc or datetime.now(timezone.utc)

    db.execute(
        """
        INSERT INTO observations (
            observation_id, expedition_id, utc, latitude, longitude,
            position_source, accuracy_m, observer_type, observation_type,
            quality_level, qa_qc_status, review_state, data_state,
            sharing_permission, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNREVIEWED', 'UNREVIEWED', 'SERVER_RECEIVED', ?, ?)
        """,
        [
            obs_id,
            exp_id,
            obs_utc,
            payload.latitude,
            payload.longitude,
            payload.position_source,
            payload.accuracy_m,
            payload.observer_type,
            payload.observation_type,
            payload.quality_level,
            payload.sharing_permission,
            payload.notes,
        ],
    )

    return {
        "observation_id": obs_id,
        "expedition_id": exp_id,
        "utc": obs_utc.isoformat(),
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "observer_type": payload.observer_type,
        "observation_type": payload.observation_type,
        "review_state": "UNREVIEWED",
        "data_state": "SERVER_RECEIVED",
    }


@app.post("/api/matchups/evaluate")
def evaluate_matchup(
    payload: MatchupRequest,
    service: MatchupService = Depends(get_matchup_service),
) -> dict[str, Any]:
    return service.evaluate_observation(
        observation_id=payload.observation_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        utc=payload.utc,
        expected_mmsi=payload.expected_mmsi,
    )


# ---------------------------------------------------------------------------
# Scientific Formulas: DJI Aerial GSD & Pythia Swarm Brier Weighting
# ---------------------------------------------------------------------------

@app.post("/api/science/gsd")
def compute_gsd(payload: GSDRequest) -> dict[str, Any]:
    return calculate_gsd_cm_per_px(
        sensor_width_mm=payload.sensor_width_mm,
        altitude_m=payload.altitude_m,
        focal_length_mm=payload.focal_length_mm,
        image_width_px=payload.image_width_px,
    )


@app.post("/api/pythia/brier-weights")
def pythia_brier_weights(payload: BrierWeightsRequest) -> dict[str, Any]:
    try:
        return compute_brier_weights(
            agent_forecasts=payload.agent_forecasts,
            outcomes=payload.outcomes,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


# ---------------------------------------------------------------------------
# Expeditions, Forecast Rings, Scientific Passport & Rewards
# ---------------------------------------------------------------------------

@app.get("/api/expeditions")
def list_expeditions(db: duckdb.DuckDBPyConnection = Depends(get_db)) -> dict[str, Any]:
    rows = db.execute(
        """
        SELECT expedition_id, title, program, lifecycle_state, region, method_version, created_at
        FROM expeditions
        ORDER BY created_at ASC
        """
    ).fetchall()
    return {
        "expeditions": [
            {
                "expedition_id": r[0],
                "title": r[1],
                "program": r[2],
                "lifecycle_state": r[3],
                "region": r[4],
                "method_version": r[5],
                "created_at": str(r[6]),
            }
            for r in rows
        ]
    }


@app.get("/api/expeditions/{expedition_id}")
def get_expedition(
    expedition_id: str,
    db: duckdb.DuckDBPyConnection = Depends(get_db),
) -> dict[str, Any]:
    row = db.execute(
        """
        SELECT expedition_id, title, program, lifecycle_state, region, method_version, created_at
        FROM expeditions
        WHERE expedition_id = ?
        """,
        [expedition_id],
    ).fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expedition not found")
    return {
        "expedition_id": row[0],
        "title": row[1],
        "program": row[2],
        "lifecycle_state": row[3],
        "region": row[4],
        "method_version": row[5],
        "created_at": str(row[6]),
    }


@app.get("/api/forecast-rings")
def list_forecast_rings(db: duckdb.DuckDBPyConnection = Depends(get_db)) -> dict[str, Any]:
    """Expone anillos prospectivos etiquetados obligatoriamente como SIMULATION."""
    rows = db.execute(
        """
        SELECT ring_id, horizon_code, confidence_score, prophecy_text,
               center_lat, center_lon, radius_meters, model_name, data_state, generated_at
        FROM forecast_rings
        ORDER BY generated_at DESC
        """
    ).fetchall()
    return {
        "data_state": "SIMULATION",
        "rings": [
            {
                "ring_id": r[0],
                "horizon_code": r[1],
                "confidence_score": r[2],
                "prophecy_text": r[3],
                "center_lat": r[4],
                "center_lon": r[5],
                "radius_meters": r[6],
                "model": r[7],
                "data_state": "SIMULATION",
                "generated_at": str(r[9]),
            }
            for r in rows
        ],
    }


@app.get("/api/passport/me")
def passport_me(
    db: duckdb.DuckDBPyConnection = Depends(get_db),
    s: Settings = Depends(get_settings),
) -> dict[str, Any]:
    total_obs = db.execute("SELECT count(*) FROM observations").fetchone()[0]
    validated_obs = db.execute(
        "SELECT count(*) FROM observations WHERE review_state = 'VALIDATED'"
    ).fetchone()[0]
    return {
        "document_type": "PROTOTYPE_SCIENTIFIC_PASSPORT",
        "legal_disclaimer": "Prototype scientific passport. It is not a legal travel document or government ID.",
        "active_expedition": s.expedition_id,
        "observations_submitted": total_obs,
        "observations_validated": validated_obs,
        "world_proof_of_human": "NOT_CONFIGURED" if not s.world_app_id else "OPTIONAL_AVAILABLE",
    }


@app.get("/api/rewards")
def list_rewards(db: duckdb.DuckDBPyConnection = Depends(get_db)) -> dict[str, Any]:
    """Expone el estado de elegibilidad de recompensas cumpliendo PENDING != PAID."""
    rows = db.execute(
        """
        SELECT claim_id, investigator_did, observation_type, review_state, reward_state, reward_wld_amount, utc
        FROM passport_claims
        ORDER BY utc DESC
        """
    ).fetchall()
    return {
        "rule": "PENDING != PAID; only VALIDATED scientific observations may advance to reward eligibility.",
        "claims": [
            {
                "claim_id": r[0],
                "investigator_did": r[1],
                "observation_type": r[2],
                "review_state": r[3],
                "reward_state": r[4],
                "reward_wld_amount": r[5],
                "utc": str(r[6]),
            }
            for r in rows
        ],
    }

