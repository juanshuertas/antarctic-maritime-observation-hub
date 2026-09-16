"""Endpoints para observaciones de campo."""
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from ..config import get_settings
from ..database import get_db


router = APIRouter(prefix="/observations", tags=["observations"])


class ObservationCreate(BaseModel):
    """Metadatos mínimos para registrar una observación georreferenciada."""

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    target_latitude: float | None = Field(default=None, ge=-90, le=90)
    target_longitude: float | None = Field(default=None, ge=-180, le=180)
    target_location_method: str | None = Field(default=None, max_length=64)
    observer_type: str = Field(min_length=1, max_length=64)
    observation_type: str = Field(min_length=1, max_length=128)
    utc: datetime | None = None
    timestamp_source: str = Field(default="device", max_length=32)
    position_source: str = Field(default="phone_gps", max_length=64)
    accuracy_m: float | None = Field(default=None, ge=0)
    source_type: str = Field(default="field", max_length=32)
    method_sensor: str | None = Field(default=None, max_length=128)
    environmental_context: str | None = None
    quality_level: int = Field(default=1, ge=1, le=4)
    uncertainty_mixed: str | None = None
    data_owner: str | None = None
    sharing_permission: str = Field(default="private", max_length=32)
    media_path: str | None = None
    notes: str | None = None
    is_demo: bool = False


@router.post("/", status_code=201)
async def create_observation(observation: ObservationCreate):
    """Registra una observación y conserva su hora y expedición de origen."""
    db = get_db()
    observation_id = str(uuid4())
    observed_at = observation.utc or datetime.now(timezone.utc)
    settings = get_settings()

    db.execute(
        """
        INSERT INTO observations (
            observation_id, expedition_id, utc, timestamp_source, latitude,
            longitude, target_latitude, target_longitude, target_location_method,
            position_source, accuracy_m, observer_type, observation_type,
            source_type, method_sensor, environmental_context,
            quality_level, uncertainty_mixed, data_owner, sharing_permission,
            media_path, notes, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            observation_id,
            settings.expedition_id,
            observed_at,
            observation.timestamp_source,
            observation.latitude,
            observation.longitude,
            observation.target_latitude,
            observation.target_longitude,
            observation.target_location_method,
            observation.position_source,
            observation.accuracy_m,
            observation.observer_type,
            observation.observation_type,
            observation.source_type,
            observation.method_sensor,
            observation.environmental_context,
            observation.quality_level,
            observation.uncertainty_mixed,
            observation.data_owner,
            observation.sharing_permission,
            observation.media_path,
            observation.notes,
            observation.is_demo,
        ],
    )

    return {"observation_id": observation_id, "status": "created"}


@router.get("/")
async def list_observations(limit: int = Query(100, ge=1, le=1000)) -> dict[str, Any]:
    """Lista las observaciones más recientes del nodo local."""
    db = get_db()
    rows = db.execute(
        """
        SELECT * FROM observations
        ORDER BY utc DESC
        LIMIT ?
        """,
        [limit],
    ).fetchall()
    columns = [column[0] for column in db.description]
    return {
        "observations": [dict(zip(columns, row)) for row in rows],
        "count": len(rows),
    }