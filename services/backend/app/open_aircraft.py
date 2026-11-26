"""Observed Antarctic ADS-B positions from the public adsb.lol API.

No aircraft is synthesized or extrapolated. A failed provider response is not
silently converted into an empty sky.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import json
import math
import urllib.request

SECTORS = ((-56, -67), (-63, -60), (-77, 167))
SOURCE_URL = "https://www.adsb.lol/docs/open-data/api"


def _observations(payload: dict) -> list[dict]:
    epoch = payload.get("now")
    if not isinstance(epoch, (int, float)) or not math.isfinite(epoch):
        raise ValueError("ADS-B provider time missing")
    reported_at = datetime.fromtimestamp(epoch / 1000 if epoch > 1e11 else epoch, timezone.utc)
    features: list[dict] = []
    for row in payload.get("ac", []):
        lat, lon, age = row.get("lat"), row.get("lon"), row.get("seen_pos")
        if not all(isinstance(value, (int, float)) and math.isfinite(value) for value in (lat, lon, age)):
            continue
        if not (-90 <= lat <= -50 and -180 <= lon <= 180 and 0 <= age <= 300):
            continue
        if row.get("alt_baro") == "ground" or not row.get("hex"):
            continue
        observed_at = (reported_at - timedelta(seconds=age)).isoformat()
        features.append({
            "type": "Feature", "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": {
                "icao24": row["hex"], "callsign": (row.get("flight") or row["hex"]).strip(),
                "observed_at": observed_at, "timestamp": observed_at,
                "altitude_ft": row.get("alt_baro"), "speed_kts": row.get("gs"),
                "heading": row.get("track"), "source": "adsb.lol · ODbL 1.0",
                "source_url": SOURCE_URL, "freshness": "DELAYED",
            },
        })
    return features


def collect_open_aircraft() -> dict:
    """Query three public sectors; report partial coverage in the response."""
    unique: dict[str, dict] = {}
    available = 0
    for lat, lon in SECTORS:
        url = f"https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/250"
        request = urllib.request.Request(url, headers={"User-Agent": "OLEA-observatory/1.0"})
        try:
            with urllib.request.urlopen(request, timeout=12) as response:
                observations = _observations(json.load(response))
        except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError):
            continue
        available += 1
        for feature in observations:
            key = feature["properties"]["icao24"]
            if key not in unique or feature["properties"]["observed_at"] > unique[key]["properties"]["observed_at"]:
                unique[key] = feature
    if not available:
        raise RuntimeError("ADS-B provider unavailable in all sectors")
    return {
        "type": "FeatureCollection", "features": list(unique.values()),
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "sectors_available": available, "sectors_total": len(SECTORS),
            "provider": "adsb.lol", "source_url": SOURCE_URL,
            "license": "ODbL-1.0", "mode": "observed_api_poll",
        },
    }
