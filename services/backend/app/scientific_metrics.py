"""Métricas científicas documentadas en AMOH: GSD aéreo (DJI), Brier Score (Pythia) y Matchups."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import math
from typing import Any
import uuid
import duckdb

from .config import get_settings
from .environmental_service import EnvironmentalService
from .geodesy import haversine_meters, validate_coordinates


def calculate_gsd_cm_per_px(
    sensor_width_mm: float | None,
    altitude_m: float | None,
    focal_length_mm: float | None,
    image_width_px: int | float | None,
) -> dict[str, Any]:
    """Calcula Ground Sample Distance (GSD) en cm/píxel según la fórmula del README:

        GSD = (Sw * H * 100) / (Fr * ImW)

    Regla crítica AMOH: Nunca inventar el ancho físico del sensor (Sw). Si falta o no es
    válido cualquiera de los parámetros, devuelve explícitamente `GSD = "UNAVAILABLE"`.
    """
    params = (sensor_width_mm, altitude_m, focal_length_mm, image_width_px)
    if any(p is None or isinstance(p, bool) for p in params):
        return {
            "gsd_cm_per_px": "UNAVAILABLE",
            "status": "UNAVAILABLE",
            "reason": "Missing physical sensor or flight parameter (AMOH never invents sensor width).",
        }

    try:
        sw = float(sensor_width_mm)  # type: ignore[arg-type]
        h = float(altitude_m)  # type: ignore[arg-type]
        fr = float(focal_length_mm)  # type: ignore[arg-type]
        imw = float(image_width_px)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return {
            "gsd_cm_per_px": "UNAVAILABLE",
            "status": "UNAVAILABLE",
            "reason": "Non-numeric sensor or flight parameter.",
        }

    if not all(math.isfinite(x) and x > 0.0 for x in (sw, h, fr, imw)):
        return {
            "gsd_cm_per_px": "UNAVAILABLE",
            "status": "UNAVAILABLE",
            "reason": "Parameters must be finite positive numbers.",
        }

    gsd = (sw * h * 100.0) / (fr * imw)
    return {
        "gsd_cm_per_px": round(gsd, 4),
        "unit": "cm/pixel",
        "status": "COMPUTED",
        "inputs": {
            "sensor_width_mm": sw,
            "altitude_m": h,
            "focal_length_mm": fr,
            "image_width_px": int(imw),
        },
    }


def compute_brier_score(
    forecasts: list[float | None],
    outcomes: list[int | float | None],
) -> float | None:
    """Calcula el Brier Score de un agente sobre pares válidos (f_{i,t}, o_t):

        BS_i = (1 / N) * sum((f_{i,t} - o_t)^2)

    Ignora entradas con datos faltantes (`None`). Si no hay pares válidos, devuelve `None`.
    """
    if len(forecasts) != len(outcomes):
        raise ValueError("Forecasts and outcomes must have the same length")

    squared_errors: list[float] = []
    for f, o in zip(forecasts, outcomes):
        if f is None or o is None:
            continue
        f_val = float(f)
        o_val = float(o)
        if not (0.0 <= f_val <= 1.0):
            raise ValueError(f"Forecast probability {f_val} must be in [0.0, 1.0]")
        if o_val not in (0.0, 1.0):
            raise ValueError(f"Outcome {o_val} must be binary (0 or 1)")
        squared_errors.append((f_val - o_val) ** 2)

    if not squared_errors:
        return None

    return sum(squared_errors) / len(squared_errors)


def compute_brier_weights(
    agent_forecasts: dict[str, list[float | None]],
    outcomes: list[int | float | None],
) -> dict[str, Any]:
    """Calcula el Brier Score y el peso normalizado W_i para el Swarm Council de Pythia:

        BS_i = (1/N) * sum((f_{i,t} - o_t)^2)
        W_i  = (1 - BS_i)^2 / sum_j((1 - BS_j)^2)

    Cubre los 5 escenarios documentados en README:
    - predicción perfecta (BS = 0.0)
    - predicción pobre (BS = 1.0)
    - agentes iguales
    - datos faltantes (None)
    - agente único
    """
    if not agent_forecasts:
        return {"agents": {}, "data_state": "AI ANALYSIS"}

    scores: dict[str, float | None] = {}
    raw_weights: dict[str, float] = {}

    for agent_id, forecasts in agent_forecasts.items():
        bs = compute_brier_score(forecasts, outcomes)
        scores[agent_id] = round(bs, 6) if bs is not None else None
        if bs is None:
            raw_weights[agent_id] = 0.0
        else:
            raw_weights[agent_id] = (1.0 - bs) ** 2

    total_raw = sum(raw_weights.values())
    active_agents = [a for a, bs in scores.items() if bs is not None]

    normalized_weights: dict[str, float] = {}
    if total_raw > 0.0:
        for agent_id, rw in raw_weights.items():
            normalized_weights[agent_id] = round(rw / total_raw, 6)
    elif active_agents:
        # Si todos los agentes activos tuvieron BS == 1.0 (peor predicción posible),
        # distribuir peso uniforme entre los agentes con datos válidos.
        uniform = round(1.0 / len(active_agents), 6)
        for agent_id in agent_forecasts:
            normalized_weights[agent_id] = uniform if agent_id in active_agents else 0.0
    else:
        for agent_id in agent_forecasts:
            normalized_weights[agent_id] = 0.0

    return {
        "data_state": "AI ANALYSIS",
        "agents": {
            agent_id: {
                "brier_score": scores[agent_id],
                "weight": normalized_weights[agent_id],
            }
            for agent_id in agent_forecasts
        },
    }


class MatchupService:
    """Reconcilia observaciones de campo con AIS y contexto ambiental (README Scientific Matchups)."""

    def __init__(self, db_conn: duckdb.DuckDBPyConnection, env_service: EnvironmentalService) -> None:
        self.db = db_conn
        self.env_service = env_service

    def evaluate_observation(
        self,
        observation_id: str,
        latitude: float,
        longitude: float,
        utc: datetime,
        expected_mmsi: str | None = None,
    ) -> dict[str, Any]:
        """Reconcilia una observación contra AIS dentro de la ventana espacio-temporal configurada.

        Resultados posibles: MATCH, PARTIAL_MATCH, NO_MATCH, DATA_GAP, CONFLICT.
        """
        lat_f, lon_f = validate_coordinates(latitude, longitude)
        s = get_settings()
        time_window = timedelta(minutes=s.match_time_window_min)
        space_window_m = s.match_space_window_km * 1000.0

        total_ais = self.db.execute("SELECT count(*) FROM ais_vessels").fetchone()[0]
        if total_ais == 0:
            outcome = "DATA_GAP"
            matched_mmsi = None
            best_dist_km = None
            best_time_min = None
        else:
            start_t = utc - time_window
            end_t = utc + time_window
            rows = self.db.execute(
                """
                SELECT mmsi, name, utc, latitude, longitude
                FROM ais_vessels
                WHERE utc >= ? AND utc <= ?
                  AND latitude IS NOT NULL AND longitude IS NOT NULL
                """,
                [start_t, end_t],
            ).fetchall()

            if not rows:
                outcome = "DATA_GAP"
                matched_mmsi = None
                best_dist_km = None
                best_time_min = None
            else:
                candidates: list[tuple[float, float, str]] = []
                for mmsi, _name, v_utc, v_lat, v_lon in rows:
                    dist_m = haversine_meters(lat_f, lon_f, v_lat, v_lon)
                    t_min = abs((v_utc - utc).total_seconds()) / 60.0
                    candidates.append((dist_m, t_min, str(mmsi)))

                candidates.sort(key=lambda item: (item[0], item[1]))
                if expected_mmsi:
                    # Prefer the expected vessel when it is inside the space window, so another
                    # vessel at a similar position does not turn a valid match into a conflict.
                    expected = [c for c in candidates if c[2] == expected_mmsi and c[0] <= space_window_m]
                    if expected:
                        candidates = expected + [c for c in candidates if c not in expected]
                nearest_dist_m, nearest_t_min, nearest_mmsi = candidates[0]
                best_dist_km = round(nearest_dist_m / 1000.0, 3)
                best_time_min = round(nearest_t_min, 2)

                if nearest_dist_m <= space_window_m:
                    if expected_mmsi and expected_mmsi != nearest_mmsi:
                        outcome = "CONFLICT"
                        matched_mmsi = nearest_mmsi
                    elif nearest_t_min <= (s.match_time_window_min / 2.0):
                        outcome = "MATCH"
                        matched_mmsi = nearest_mmsi
                    else:
                        outcome = "PARTIAL_MATCH"
                        matched_mmsi = nearest_mmsi
                elif nearest_dist_m <= (space_window_m * 2.5):
                    outcome = "PARTIAL_MATCH"
                    matched_mmsi = nearest_mmsi
                else:
                    outcome = "NO_MATCH"
                    matched_mmsi = None

        env_context = self.env_service.get_context(lat_f, lon_f, utc)
        matchup_id = str(uuid.uuid4())

        self.db.execute(
            """
            INSERT INTO scientific_matchups (
                matchup_id, observation_id, matched_mmsi, outcome,
                distance_km, time_diff_min, env_data_state, review_state
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'UNREVIEWED')
            """,
            [
                matchup_id,
                observation_id,
                matched_mmsi,
                outcome,
                best_dist_km,
                best_time_min,
                env_context["data_state"],
            ],
        )

        return {
            "matchup_id": matchup_id,
            "observation_id": observation_id,
            "outcome": outcome,
            "matched_mmsi": matched_mmsi,
            "distance_km": best_dist_km,
            "time_diff_min": best_time_min,
            "review_state": "UNREVIEWED",
            "environmental_context": env_context,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
