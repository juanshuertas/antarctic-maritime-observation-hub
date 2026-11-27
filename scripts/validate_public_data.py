"""Validate the environmental heatmaps shipped by GitHub Pages."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "apps/web/public/data/heatmaps"


def validate():
    catalog = json.loads((ROOT / "index.json").read_bytes())
    files = {path.stem for path in ROOT.glob("*_heatmap.json")}
    if not files or files != set(catalog):
        raise ValueError("Heatmap manifest and files differ")
    for name, entry in catalog.items():
        payload = (ROOT / (name + ".json")).read_bytes()
        digest = hashlib.sha256(payload).hexdigest()
        if digest != entry["sha256"] or not 0 < len(payload) == entry["bytes"] < 5_000_000:
            raise ValueError(f"{name}: size or SHA-256 mismatch")
        data = json.loads(payload)
        if data["type"] != "FeatureCollection" or not data["reference"] or not data["source"]:
            raise ValueError(f"{name}: missing collection or provenance")
        if not data["features"] or len(data["features"]) != entry["cells"]:
            raise ValueError(f"{name}: inconsistent record count")
        for feature in data["features"]:
            geometry = feature["geometry"]
            lon, lat = geometry["coordinates"][:2]
            if geometry["type"] != "Point" or not (-180 <= lon <= 180 and -90 <= lat <= 90):
                raise ValueError(f"{name}: invalid geographic point")
        print(name, entry["cells"], digest)


if __name__ == "__main__":
    validate()
