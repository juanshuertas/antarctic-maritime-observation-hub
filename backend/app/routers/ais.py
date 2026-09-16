"""Endpoints AIS."""
from typing import Any

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from ..database import get_db
from ..services.ais_import import import_csv
from ..services.ais_stream import subscribe_ais

router = APIRouter(prefix="/ais", tags=["ais"])


@router.post("/import", status_code=200)
async def import_positions(file: UploadFile = File(...)) -> dict[str, Any]:
    """Importa posiciones AIS desde un CSV local, sin conexión externa."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=415, detail="Only CSV AIS files are supported")
    try:
        return import_csv(await file.read())
    except UnicodeDecodeError as error:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8") from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/vessels")
async def list_vessels(limit: int = Query(100, ge=1, le=1000)) -> dict[str, Any]:
    """Lista buques AIS capturados.

    NOTA: AIS ausente != ausencia de buque.
    """
    db = get_db()
    rows = db.execute("""
        SELECT * FROM ais_vessels
        ORDER BY utc DESC LIMIT ?
    """, [limit]).fetchall()
    cols = [str(column[0]) for column in db.description]
    return {
        "vessels": [dict(zip(cols, r)) for r in rows],
        "count": len(rows),
        "disclaimer": "AIS absence is not vessel absence",
    }


@router.post("/subscribe")
async def subscribe() -> dict[str, Any]:
    """Suscribe temporalmente a AISStream.io (Península Antártica).

    Recibe 20 mensajes de prueba y los guarda en DuckDB.
    """
    bbox = {
        "min_lat": -70.0,
        "max_lat": -60.0,
        "min_lon": -70.0,
        "max_lon": -55.0,
    }
    result = await subscribe_ais(bbox=bbox, max_messages=20)
    return result