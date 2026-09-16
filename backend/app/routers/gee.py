"""Google Earth Engine endpoints.

GEE is an optional remote connector. Local capture and analysis do not depend
on this module being configured or on the Earth Engine Python package being
installed.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from ..config import get_settings


router = APIRouter(prefix="/api/gee", tags=["gee"])


def _load_ee() -> Any:
    try:
        import ee
    except ImportError as error:
        raise HTTPException(
            status_code=503,
            detail="Google Earth Engine is not installed in this environment",
        ) from error
    return ee


def _initialize_ee(ee: Any) -> None:
    settings = get_settings()
    if not settings.gee_enabled:
        raise HTTPException(
            status_code=503,
            detail="Google Earth Engine connector is disabled",
        )
    try:
        if settings.gee_project:
            ee.Initialize(project=settings.gee_project)
        else:
            ee.Initialize()
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "Google Earth Engine is not authenticated. Run earthengine "
                "authenticate or configure a service account outside the repository."
            ),
        ) from error


@router.get("/sar-tile")
async def sar_tile(
    start_date: str = Query("2024-01-01", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str = Query("2024-04-01", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    min_lat: float = Query(-66.0, ge=-90, le=90),
    min_lon: float = Query(-65.0, ge=-180, le=180),
    max_lat: float = Query(-63.5, ge=-90, le=90),
    max_lon: float = Query(-60.0, ge=-180, le=180),
) -> dict[str, Any]:
    """Return a rendered Sentinel-1 HH median tile URL for the AOI."""
    if start_date >= end_date:
        raise HTTPException(status_code=400, detail="start_date must precede end_date")
    if min_lat >= max_lat or min_lon >= max_lon:
        raise HTTPException(status_code=400, detail="Invalid bounding box")

    if not get_settings().gee_enabled:
        raise HTTPException(status_code=503, detail="Google Earth Engine connector is disabled")

    ee = _load_ee()
    _initialize_ee(ee)
    try:
        geometry = ee.Geometry.Rectangle([min_lon, min_lat, max_lon, max_lat])
        collection = (
            ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(geometry)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "HH"))
            .select("HH")
        )
        image = collection.median().clip(geometry)
        map_id = image.getMapId(
            {"min": -25, "max": 5, "palette": ["071c2c", "14566a", "83d8d0", "f2c500"]}
        )
        count = collection.size().getInfo()
        return {
            "tile_url": map_id["tile_fetcher"].url_format,
            "collection": "COPERNICUS/S1_GRD",
            "polarization": "HH",
            "instrument_mode": "IW",
            "start_date": start_date,
            "end_date": end_date,
            "image_count": count,
            "bbox": [min_lon, min_lat, max_lon, max_lat],
            "disclaimer": "Rendered remote imagery; not a continuous real-time observation.",
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Earth Engine request failed: {error}") from error