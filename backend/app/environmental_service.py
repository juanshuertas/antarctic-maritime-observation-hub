"""Servicio de contexto ambiental polar con trazabilidad explícita de estado (SIMULATION)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import duckdb

from .geodesy import validate_coordinates


class EnvironmentalService:
    """Proporciona contexto ambiental polar etiquetado explícitamente como SIMULATION.

    Regla científica AMOH (README): Nunca presentar datos de SIMULATION o DEMO como LIVE.
    """

    def __init__(self, db_conn: duckdb.DuckDBPyConnection) -> None:
        self.db = db_conn

    def get_context(self, lat: float, lon: float, utc: datetime | None = None) -> dict[str, Any]:
        lat_f, lon_f = validate_coordinates(lat, lon)

        # Modelo heurístico antártico (explícitamente marcado como SIMULATION)
        sea_ice_conc = 0.8 if lat_f < -65.0 else (0.2 if lat_f < -60.0 else 0.0)
        chlorophyll = 1.5 if (-62.0 < lat_f < -58.0) and (-65.0 < lon_f < -50.0) else 0.3
        sst = -1.5 if lat_f < -65.0 else 1.0

        return {
            "sea_ice_concentration": sea_ice_conc,
            "chlorophyll_mg_m3": chlorophyll,
            "sst_celsius": sst,
            "source": "NASA_Simulated_Earthdata",
            "data_state": "SIMULATION",
            "quality": "synthetic_heuristic",
            "reference_utc": str(utc) if utc is not None else datetime.now(timezone.utc).isoformat(),
        }

    def correlate_vessel_with_environment(self, mmsi: str) -> list[dict[str, Any]]:
        data = self.db.execute("""
            SELECT utc, latitude, longitude
            FROM ais_vessels
            WHERE mmsi = ?
            ORDER BY utc ASC
        """, [mmsi]).fetchall()

        correlations: list[dict[str, Any]] = []
        for utc, lat, lon in data:
            if lat is None or lon is None:
                continue
            context = self.get_context(lat, lon, utc)
            correlations.append({
                "utc": str(utc),
                "lat": lat,
                "lon": lon,
                "data_state": "SIMULATION",
                "env": context,
            })
        return correlations

