"""Cliente WebSocket para AISStream.io.

Recibe datos AIS de barcos en tiempo real y los persiste en DuckDB.

REGLA CRÍTICA: AIS ausente != ausencia de buque.
"""
from __future__ import annotations

import json
import importlib
import logging
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any

import duckdb

from ..config import get_settings
from ..database import get_db


logger = logging.getLogger(__name__)


def persist_ais_position(
    db: duckdb.DuckDBPyConnection, position: Mapping[str, Any], expedition_id: str
) -> str:
    """Inserta una posición AIS si no existe; devuelve accepted o duplicate."""
    duplicate = db.execute(
        """
        SELECT 1 FROM ais_vessels
        WHERE mmsi = ? AND utc = ? AND latitude = ? AND longitude = ?
        LIMIT 1
        """,
        [position["mmsi"], position["utc"], position["latitude"], position["longitude"]],
    ).fetchone()
    if duplicate:
        return "duplicate"

    db.execute(
        """
        INSERT INTO ais_vessels (
            expedition_id, mmsi, name, latitude, longitude, speed, course,
            heading, navstat, utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            expedition_id,
            position["mmsi"],
            position.get("name", ""),
            position["latitude"],
            position["longitude"],
            position.get("speed"),
            position.get("course"),
            position.get("heading"),
            position.get("navstat"),
            position["utc"],
        ],
    )
    return "accepted"


async def subscribe_ais(
    bbox: Mapping[str, float], max_messages: int = 100
) -> dict[str, Any]:
    """Suscribe a AISStream.io y persiste mensajes en DuckDB.

    Args:
        bbox: {"min_lat": float, "max_lat": float, "min_lon": float, "max_lon": float}
        max_messages: Límite de mensajes a recibir antes de retornar.

    Returns:
        Dict con status y número de mensajes recibidos.
    """
    s = get_settings()

    if not s.aisstream_api_key:
        return {"status": "disabled", "reason": "no_api_key"}

    try:
        websockets = importlib.import_module("websockets")
    except ImportError:
        return {"status": "unavailable", "reason": "websockets_missing"}

    msg: dict[str, Any] = {
        "APIKey": s.aisstream_api_key,
        "BoundingBoxes": [[
            [bbox["min_lat"], bbox["min_lon"]],
            [bbox["max_lat"], bbox["max_lon"]],
        ]],
        "FilterMessageTypes": ["PositionReport"],
    }

    count = 0
    db = get_db()

    try:
        async with websockets.connect(s.aisstream_wss_url) as ws:
            await ws.send(json.dumps(msg))
            logger.info(f"[AISStream] Suscrito a bbox: {bbox}")

            async for message in ws:
                data = json.loads(message)
                if _persist_message(db, data, s.expedition_id):
                    count += 1
                if count >= max_messages:
                    break
    except Exception as e:
        logger.error(f"[AISStream] Error: {e}")
        return {"status": "error", "error": str(e), "received": count}

    return {"status": "ok", "received": count}


def _persist_message(
    db: duckdb.DuckDBPyConnection, data: Mapping[str, Any], expedition_id: str
) -> bool:
    """Persiste un mensaje AIS en DuckDB. Retorna True si fue exitoso."""
    try:
        meta = data.get("MetaData", {})
        pos = data.get("Message", {}).get("PositionReport", {})

        if not pos:
            return False

        db.execute("""
            INSERT INTO ais_vessels
            (expedition_id, mmsi, name, latitude, longitude,
             speed, course, heading, navstat, utc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            expedition_id,
            str(meta.get("MMSI", "")),
            meta.get("ShipName", "").strip(),
            pos.get("Latitude"),
            pos.get("Longitude"),
            pos.get("Sog"),
            pos.get("Cog"),
            pos.get("TrueHeading"),
            pos.get("NavigationalStatus"),
            datetime.now(timezone.utc),
        ])
        return True
    except Exception as e:
        logger.debug(f"[AISStream] Error persistiendo: {e}")
        return False