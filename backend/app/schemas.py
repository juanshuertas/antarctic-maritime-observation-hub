"""Esquemas Pydantic v2 para validación de entradas y respuestas del API AMOH."""
from __future__ import annotations

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, field_validator


class ObservationCreate(BaseModel):
    """Payload de creación de una observación científica o de campo."""

    expedition_id: str | None = Field(default=None, min_length=2, max_length=64)
    utc: datetime | None = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    position_source: str = Field(default="phone_gps", min_length=2, max_length=64)
    accuracy_m: float | None = Field(default=None, ge=0.0, le=100000.0)
    observer_type: Literal["RESEARCHER", "EXPEDITION_STAFF", "GUEST_COMMUNITY", "SENSOR"] = "RESEARCHER"
    observation_type: str = Field(..., min_length=2, max_length=64)
    quality_level: int = Field(default=1, ge=1, le=5)
    sharing_permission: Literal["private", "expedition", "public_science"] = "private"
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("observation_type", "position_source")
    @classmethod
    def _strip_and_validate_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or whitespace")
        return cleaned


class MatchupRequest(BaseModel):
    """Solicitud de reconciliación científica (Observación + AIS + Contexto Ambiental)."""

    observation_id: str = Field(..., min_length=1, max_length=128)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    utc: datetime
    expected_mmsi: str | None = Field(default=None, max_length=32)


class GSDRequest(BaseModel):
    """Parámetros de cámara y altura para cálculo de Ground Sample Distance (GSD)."""

    sensor_width_mm: float | None = None
    altitude_m: float | None = None
    focal_length_mm: float | None = None
    image_width_px: int | float | None = None


class BrierWeightsRequest(BaseModel):
    """Pronósticos probabilísticos de agentes del Swarm Council y resultados observados."""

    agent_forecasts: dict[str, list[float | None]]
    outcomes: list[int | float | None]
