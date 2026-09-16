from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..services.cruise_integration import (
    build_scenario_seed,
    get_public_route_geojson,
    get_public_route_summary,
)

router = APIRouter(prefix="/api/public-routes", tags=["public-routes"])


@router.get("/summary/{route_id}")
async def public_route_summary(route_id: str):
    try:
        return get_public_route_summary(route_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/geojson/{route_id}")
async def public_route_geojson(route_id: str):
    try:
        return get_public_route_geojson(route_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/scenario/{route_id}")
async def public_route_scenario(route_id: str):
    try:
        return {"route_id": route_id, "scenario_seed": build_scenario_seed(route_id)}
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
