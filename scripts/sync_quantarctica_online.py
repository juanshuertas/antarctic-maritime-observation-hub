"""Audit existing Quantarctica web derivatives and publish a truthful catalog.

The original QGIS projects and rasters stay in the local archive. Only GeoJSON
that matches the conversion manifest is marked available on GitHub Pages.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "apps/web/public/data"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_catalog(manifest_path: Path, public_dir: Path) -> dict:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    layers = []
    for entry in manifest["layers"]:
        name = entry["layer_key"]
        candidate = public_dir / "web/geojson" / f"{name}.geojson"
        expected_hash = entry.get("sha256_hash")
        verified = (
            entry.get("status") == "CONVERTED_READY"
            and candidate.is_file()
            and bool(expected_hash)
            and sha256(candidate) == expected_hash
        )
        layers.append({
            "name": name,
            "title": entry.get("title", name),
            "theme": entry.get("theme", "Unclassified"),
            "available": verified,
            "url": f"data/web/geojson/{name}.geojson" if verified else None,
            "source_path": None,
            "source": "Quantarctica local converted manifest; original provider must be checked per layer",
            "source_crs": entry.get("source_crs"),
            "target_crs": entry.get("target_crs"),
            "feature_count": entry.get("feature_count") if verified else 0,
            "bytes": candidate.stat().st_size if verified else 0,
            "sha256": expected_hash if verified else None,
            "license": "Unverified for this derivative; consult original dataset metadata before reuse",
            "kind": "derived_vector" if verified else "unavailable",
            "reason": None if verified else "No hash-verified web derivative in the conversion manifest",
        })
    return {
        "schema_version": 1,
        "generated_utc": datetime.now(timezone.utc).isoformat(),
        "catalog_source": "data/quantarctica/converted/manifest.json",
        "layers": layers,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=Path(r"C:\AMOH\data\quantarctica\converted\manifest.json"))
    parser.add_argument("--public", type=Path, default=PUBLIC)
    parser.add_argument("--check", action="store_true", help="Verify the committed catalog against imported Pages assets")
    args = parser.parse_args()
    target = args.public / "quantarctica/quantarctica_catalog.json"
    if args.check:
        catalog = json.loads(target.read_text(encoding="utf-8"))
        published = [layer for layer in catalog["layers"] if layer["available"]]
        for layer in published:
            source = args.public / Path(layer["url"]).relative_to("data")
            if not source.is_file() or sha256(source) != layer["sha256"]:
                raise SystemExit(f"Missing or changed Pages asset: {layer['name']}")
        print(f"Verified {len(published)} published Quantarctica assets")
        return
    catalog = build_catalog(args.manifest, args.public)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ready = sum(layer["available"] for layer in catalog["layers"])
    print(f"{ready}/{len(catalog['layers'])} hash-verified layers; {target}")


if __name__ == "__main__":
    main()
