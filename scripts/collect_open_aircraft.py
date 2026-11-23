"""Publish observed ADS-B positions, never extrapolated tracks. ODbL 1.0."""
import json, math, sys, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
SECTORS = ((-56, -67), (-63, -60), (-77, 167))

def features(payload):
    epoch = payload.get("now")
    if not isinstance(epoch, (int, float)) or not math.isfinite(epoch):
        raise ValueError("Missing provider time")
    report = datetime.fromtimestamp(epoch / 1000 if epoch > 1e11 else epoch, timezone.utc)
    for row in payload["ac"]:
        lat, lon, age = row.get("lat"), row.get("lon"), row.get("seen_pos")
        if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in (lat, lon, age)):
            continue
        if not (-90 <= lat <= -50 and -180 <= lon <= 180 and 0 <= age <= 300) or row.get("alt_baro") == "ground" or not row.get("hex"):
            continue
        yield {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lon, lat]}, "properties": {
            "icao24": row["hex"], "callsign": (row.get("flight") or row["hex"]).strip(),
            "observed_at": (report - timedelta(seconds=age)).isoformat(),
            "timestamp": (report - timedelta(seconds=age)).isoformat(),
            "altitude_ft": row.get("alt_baro"), "speed_kts": row.get("gs"), "heading": row.get("track"),
            "source": "adsb.lol · ODbL 1.0", "source_url": "https://www.adsb.lol/docs/open-data/api",
            "freshness": "DELAYED"}}

def collect():
    unique, available = {}, 0
    for lat, lon in SECTORS:
        try:
            request = urllib.request.Request(f"https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/250", headers={"User-Agent": "OLEA-observatory/1.0"})
            with urllib.request.urlopen(request, timeout=15) as response:
                rows = list(features(json.load(response)))
            available += 1
            for feature in rows:
                key = feature["properties"]["icao24"]
                if key not in unique or feature["properties"]["observed_at"] > unique[key]["properties"]["observed_at"]:
                    unique[key] = feature
        except Exception as error:
            print(f"Sector {lat},{lon} unavailable: {type(error).__name__}", file=sys.stderr)
    if not available:
        raise RuntimeError("No sectors available; preserve last snapshot and let the viewer expire it")
    return {"type": "FeatureCollection", "features": list(unique.values()), "metadata": {
        "generated_at": datetime.now(timezone.utc).isoformat(), "sectors_available": available,
        "sectors": SECTORS, "license": "ODbL-1.0", "provider": "adsb.lol", "mode": "scheduled_snapshot", "interval_minutes": 10}}

if __name__ == "__main__":
    destination = Path(sys.argv[1]); destination.parent.mkdir(parents=True, exist_ok=True)
    result = collect(); destination.write_text(json.dumps(result, ensure_ascii=False, allow_nan=False), encoding="utf8")
    print(f"{len(result['features'])} observed positions; {result['metadata']['sectors_available']}/3 sectors")
