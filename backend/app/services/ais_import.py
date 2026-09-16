"""Importación local y validación de posiciones AIS."""
from __future__ import annotations

import csv
import io
from datetime import datetime, timezone
from typing import Any

from ..config import get_settings
from ..database import get_db
from .ais_stream import persist_ais_position


ALIASES = {
    "mmsi": ("mmsi", "MMSI", "UserID"),
    "name": ("name", "ship_name", "ShipName"),
    "latitude": ("latitude", "lat", "Latitude"),
    "longitude": ("longitude", "lon", "lng", "Longitude"),
    "utc": ("utc", "timestamp", "time", "Timestamp"),
    "speed": ("speed", "sog", "Sog"),
    "course": ("course", "cog", "Cog"),
    "heading": ("heading", "TrueHeading"),
    "navstat": ("navstat", "NavigationalStatus"),
}


def _value(row: dict[str, str], field: str) -> str | None:
    for alias in ALIASES[field]:
        if row.get(alias) not in (None, ""):
            return row[alias]
    return None


def _number(value: str | None, field: str) -> float | int | None:
    if value in (None, ""):
        return None
    number = float(value)
    if field == "navstat":
        return int(number)
    return number


def _utc(value: str | None) -> datetime:
    if not value:
        raise ValueError("missing utc")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).replace(tzinfo=None)


def import_csv(content: bytes) -> dict[str, Any]:
    """Importa CSV AIS y devuelve un informe reproducible de validación."""
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV has no header")

    db = get_db()
    accepted = 0
    duplicates = 0
    rejected: list[dict[str, Any]] = []
    for row_number, row in enumerate(reader, start=2):
        try:
            mmsi = _value(row, "mmsi")
            latitude = _number(_value(row, "latitude"), "latitude")
            longitude = _number(_value(row, "longitude"), "longitude")
            if not mmsi or latitude is None or longitude is None:
                raise ValueError("missing mmsi, latitude or longitude")
            if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
                raise ValueError("coordinates outside valid range")
            position = {
                "mmsi": str(mmsi),
                "name": _value(row, "name") or "",
                "latitude": latitude,
                "longitude": longitude,
                "utc": _utc(_value(row, "utc")),
                "speed": _number(_value(row, "speed"), "speed"),
                "course": _number(_value(row, "course"), "course"),
                "heading": _number(_value(row, "heading"), "heading"),
                "navstat": _number(_value(row, "navstat"), "navstat"),
            }
            result = persist_ais_position(db, position, get_settings().expedition_id)
            if result == "duplicate":
                duplicates += 1
            else:
                accepted += 1
        except (TypeError, ValueError, OverflowError) as error:
            rejected.append({"row": row_number, "reason": str(error)})

    return {
        "status": "ok",
        "format": "csv",
        "accepted": accepted,
        "duplicates": duplicates,
        "rejected": rejected,
        "total_rows": accepted + duplicates + len(rejected),
        "is_demo": False,
    }