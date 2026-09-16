from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _integration_root() -> Path:
    search_roots: list[Path] = []
    anchors = [
        Path(__file__).resolve().parents[3],
        Path.cwd(),
        Path("c:/AMOH"),
        Path("c:/Users/ing_s/Downloads/AMOH_Cruise_Data_Osiris_MiroFish"),
    ]
    for anchor in anchors:
        if anchor.exists():
            search_roots.append(anchor)
        for parent in anchor.parents:
            if parent.exists():
                search_roots.append(parent)

    seen: set[str] = set()
    for root in search_roots:
        key = str(root.resolve())
        if key in seen:
            continue
        seen.add(key)

        candidate = root / "AMOH_Data_Integration"
        if (candidate / "data" / "routes.json").exists():
            return candidate
        if (root / "data" / "routes.json").exists():
            return root

        match = next(root.glob("**/AMOH_Data_Integration/data/routes.json"), None)
        if match is not None:
            return match.parent.parent

    raise FileNotFoundError(
        "No se encontró la carpeta AMOH_Data_Integration con los datasets públicos del proyecto."
    )


def _load_json(name: str) -> list[dict[str, Any]]:
    path = _integration_root() / "data" / name
    if not path.exists():
        raise FileNotFoundError(f"Missing public data file: {path}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def get_public_route_summary(route_id: str) -> dict[str, Any]:
    routes = _load_json("routes.json")
    stops = _load_json("stops.json")
    route = next((item for item in routes if item.get("route_id") == route_id), None)
    if route is None:
        raise ValueError(f"Route '{route_id}' not found in public cruise integration dataset")

    selected = [item for item in stops if item.get("route_id") == route_id]
    return {
        "route_id": route_id,
        "operator": route.get("operator", "Unknown"),
        "title": route.get("title", "Unknown route"),
        "stage_count": len(selected),
        "coordinates_ready": sum(1 for item in selected if item.get("latitude") is not None and item.get("longitude") is not None),
        "source_id": route.get("source_id"),
        "evidence_type": route.get("evidence_type", "published_plan"),
    }


def get_public_route_geojson(route_id: str) -> dict[str, Any]:
    routes = _load_json("routes.json")
    stops = _load_json("stops.json")
    route = next((item for item in routes if item.get("route_id") == route_id), None)
    if route is None:
        raise ValueError(f"Route '{route_id}' not found in public cruise integration dataset")

    features: list[dict[str, Any]] = []
    for stop in stops:
        if stop.get("route_id") != route_id:
            continue
        latitude = stop.get("latitude")
        longitude = stop.get("longitude")
        if latitude is None or longitude is None:
            continue
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(longitude), float(latitude)],
            },
            "properties": {
                "stop_id": stop.get("stop_id"),
                "route_id": route_id,
                "sequence": stop.get("sequence"),
                "label": stop.get("label"),
                "country_or_territory_code": stop.get("country_or_territory_code"),
                "evidence_type": stop.get("evidence_type", "published_plan"),
                "source_id": stop.get("source_id"),
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "route_id": route_id,
            "operator": route.get("operator", "Unknown"),
            "title": route.get("title", "Unknown route"),
            "feature_count": len(features),
            "source": "AMOH_Data_Integration/public_dataset",
        },
    }


def build_scenario_seed(route_id: str) -> str:
    routes = _load_json("routes.json")
    stops = _load_json("stops.json")
    route = next((item for item in routes if item.get("route_id") == route_id), None)
    if route is None:
        raise ValueError(f"Route '{route_id}' not found in public cruise integration dataset")

    stages = [item for item in stops if item.get("route_id") == route_id]
    text = [
        "AMOH EXPERIMENTAL SCENARIO INPUT — NOT OBSERVED AIS",
        "Research question: How could a hypothetical schedule disruption change opportunities for field observation and selective synchronization?",
        "Scenario assumption: one planned call is delayed 24 hours. This is an assumption, not a forecast or an observed event.",
        "Do not infer environmental impact, vessel presence, precise landing locations, probabilities or regulatory violations.",
        "Keep source facts, assumptions and generated outcomes separate. Cite source_id and stop_id for every factual input.",
        "MiroFish social simulation outputs require domain adaptation; do not treat them as navigation or ocean/ice models.",
        json.dumps({"route": route, "stages": stages}, ensure_ascii=False, indent=2),
    ]
    return "\n".join(text)
