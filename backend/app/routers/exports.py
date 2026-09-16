"""Exportaciones y copias locales verificables."""
from __future__ import annotations

import csv
import hashlib
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from ..config import get_settings
from ..database import get_db


router = APIRouter(prefix="/exports", tags=["exports"])


def _observations() -> tuple[list[str], list[tuple[Any, ...]]]:
    db = get_db()
    rows = db.execute("SELECT * FROM observations ORDER BY utc DESC").fetchall()
    return [str(column[0]) for column in db.description], rows


@router.get("/observations.csv")
async def export_observations_csv() -> StreamingResponse:
    columns, rows = _observations()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(columns)
    writer.writerows(rows)
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8")]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=observations.csv"},
    )


@router.get("/observations.geojson")
async def export_observations_geojson() -> dict[str, Any]:
    columns, rows = _observations()
    features = []
    for row in rows:
        item = dict(zip(columns, row))
        latitude = item.pop("latitude")
        longitude = item.pop("longitude")
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [longitude, latitude]},
            "properties": item,
        })
    return {"type": "FeatureCollection", "features": features}


@router.post("/backup")
async def create_backup() -> dict[str, Any]:
    """Crea una copia local de la base y un manifiesto con SHA-256."""
    settings = get_settings()
    backup_dir = Path(settings.data_dir) / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    destination = backup_dir / f"antarctic-{stamp}"
    destination.mkdir(parents=True, exist_ok=True)
    get_db().execute(f"EXPORT DATABASE '{destination.as_posix()}' (FORMAT PARQUET)")
    files = []
    for path in sorted(destination.rglob("*")):
        if path.is_file():
            files.append({
                "path": path.relative_to(destination).as_posix(),
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "size": path.stat().st_size,
            })
    manifest = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expedition_id": settings.expedition_id,
        "format": "duckdb-export-parquet",
        "directory": destination.name,
        "files": files,
        "note": "Local snapshot only; use an independent external medium for backup resilience.",
    }
    manifest_path = destination / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return {"status": "created", "manifest": manifest}