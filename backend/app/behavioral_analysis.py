"""Servicio de análisis conductual marítimo bajo el principio 'Observación != Causalidad'."""
from __future__ import annotations

from datetime import timedelta
from typing import Any
import duckdb

from .geodesy import haversine_nm


class BehavioralAnalysisService:
    """Evalúa brechas de transmisión AIS y patrones de baja velocidad para priorizar monitoreo.

    Reglas científicas AMOH (README):
    - Ausencia de AIS != ausencia de embarcación ni desactivación deliberada.
    - Actividad aparente de pesca o brechas AIS != pesca ilegal (IUU).
    """

    def __init__(self, db_conn: duckdb.DuckDBPyConnection, env_service: Any = None) -> None:
        self.db = db_conn
        self.env_service = env_service

    def analyze_behavior(self, mmsi: str) -> dict[str, Any]:
        data = self.db.execute("""
            SELECT utc, latitude, longitude, speed
            FROM ais_vessels
            WHERE mmsi = ?
            ORDER BY utc ASC
        """, [mmsi]).fetchall()

        valid_rows = [
            (utc, lat, lon, speed)
            for utc, lat, lon, speed in data
            if utc is not None and lat is not None and lon is not None
        ]

        if len(data) == 0:
            return {"status": "not_found", "mmsi": mmsi}
        if len(valid_rows) < 2:
            return {"status": "insufficient_data", "mmsi": mmsi}

        shadow_gaps: list[dict[str, Any]] = []
        fishing_indicators = 0
        environmental_risk_points = 0
        is_suspicious = False

        for i in range(1, len(valid_rows)):
            prev_utc, prev_lat, prev_lon, _ = valid_rows[i - 1]
            curr_utc, curr_lat, curr_lon, curr_speed = valid_rows[i]

            # 1. Brechas de recepción AIS (> 4 horas)
            time_diff = curr_utc - prev_utc
            if time_diff > timedelta(hours=4):
                shadow_gaps.append({
                    "start": str(prev_utc),
                    "end": str(curr_utc),
                    "duration_hours": round(time_diff.total_seconds() / 3600.0, 2),
                    "location": [prev_lat, prev_lon],
                    "note": "AIS reception gap (AIS absence != vessel absence)",
                })

            # 2. Patrón de baja velocidad / permanencia usando distancia geodésica real (< 0.5 NM)
            if curr_speed is not None and curr_speed < 2.0:
                dist_nm = haversine_nm(prev_lat, prev_lon, curr_lat, curr_lon)
                if dist_nm < 0.5:
                    fishing_indicators += 1

            # 3. Coincidencia con contexto ambiental (etiquetado si proviene de SIMULATION)
            if self.env_service is not None:
                ctx = self.env_service.get_context(curr_lat, curr_lon, curr_utc)
                if curr_speed is not None and curr_speed < 2.0 and ctx.get("chlorophyll_mg_m3", 0.0) > 1.0:
                    environmental_risk_points += 1

        if len(shadow_gaps) > 0 or fishing_indicators > 5 or environmental_risk_points > 2:
            is_suspicious = True

        risk_level = (
            "HIGH"
            if (len(shadow_gaps) > 0 and environmental_risk_points > 2)
            else "MEDIUM"
            if is_suspicious
            else "LOW"
        )

        return {
            "mmsi": mmsi,
            "is_suspicious": is_suspicious,
            "review_state": "UNREVIEWED",
            "environment_data_state": "SIMULATION" if self.env_service is not None else "NOT_CONFIGURED",
            "behavioral_score": {
                "shadow_gaps_count": len(shadow_gaps),
                "fishing_pattern_score": fishing_indicators,
                "environmental_risk_score": environmental_risk_points,
                "risk_level": risk_level,
            },
            "shadow_gaps": shadow_gaps,
            "disclaimer": (
                "Observation != Causation. AIS gaps or low-speed patterns are unreviewed signals "
                "for monitoring prioritization and do not prove illegal (IUU) fishing."
            ),
            "analysis": (
                "Monitoring priority elevated (UNREVIEWED): AIS signal gaps or low-speed patterns "
                "detected; requires human scientific review"
                if is_suspicious
                else "Normal navigation pattern"
            ),
        }

