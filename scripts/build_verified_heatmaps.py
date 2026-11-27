"""Build public environmental layers from the local catalog (requires pyproj and pyshp)."""
import argparse
import csv
import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path

import shapefile
from pyproj import CRS, Transformer

PUBLIC = Path(__file__).resolve().parents[1] / "apps/web/public/data"


def feature(lon, lat, **properties):
    if not (-180 <= lon <= 180 and -90 <= lat <= 90):
        raise ValueError((lon, lat))
    return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lon, lat]},
            "properties": properties}


def publish(name, features, source, reference):
    if not features:
        raise ValueError(name)
    path = PUBLIC / "heatmaps" / (name + ".json")
    path.parent.mkdir(exist_ok=True)
    data = {"type": "FeatureCollection", "source": source, "reference": reference, "features": features}
    payload = json.dumps(data, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode()
    if len(payload) >= 5_000_000:
        raise ValueError(f"{name} exceeds publication budget")
    path.write_bytes(payload)
    return {"cells": len(features), "source": source, "bytes": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=Path("C:/AMOH/data"))
    data = parser.parse_args().data
    biology = data / "quantarctica/v4/raw/Quantarctica4/Biology"
    index = {}
    krill = defaultdict(list)
    with (biology / "Krill/Atkinson_KRILLBASE_data.csv").open(encoding="latin1", newline="") as stream:
        for row in csv.DictReader(stream):
            if row["RECORD_TYPE"].lower() != "haul":
                continue
            try:
                density = float(row["STANDARDISED_KRILL_UNDER_1M2"])
            except ValueError:
                continue
            if math.isfinite(density) and density >= 0:
                krill[math.floor(float(row["LONGITUDE"])), math.floor(float(row["LATITUDE"]))].append(density)
    index["krill_density_heatmap"] = publish("krill_density_heatmap", [
        feature(x+.5, y+.5, density=round(sum(v)/len(v), 4), hauls=len(v), unit="ind/m²", source="KRILLBASE")
        for (x,y),v in sorted(krill.items())], "KRILLBASE", "https://doi.org/10.5285/8b00a915-94e3-4a04-a903-dd4956346439")

    path = biology / "MarineMammals/Ropert-Coudert_RAATD_HumpbackWhaleTrackDaily.shp"
    transform = Transformer.from_crs(CRS.from_wkt(path.with_suffix(".prj").read_text()), 4326, always_xy=True)
    seasonal = defaultdict(int)
    with shapefile.Reader(str(path)) as reader:
        for rec in reader.iterShapeRecords():
            x, y = transform.transform(*rec.shape.points[0])
            seasonal[math.floor(x), math.floor(y), rec.record["date"].month] += 1
    totals = defaultdict(int)
    for (x,y,month), count in seasonal.items():
        totals[x,y] += count
    for name, entries in [
        ("cetaceans_heatmap", [feature(x+.5,y+.5,count=n,source="RAATD") for (x,y),n in sorted(totals.items())]),
        ("species_migration_heatmap", [feature(x+.5,y+.5,month=m,count=n,source="RAATD",
             species_group="Megaptera novaeangliae") for (x,y,m),n in sorted(seasonal.items())])]:
        index[name] = publish(name, entries, "RAATD · posiciones diarias", "https://zenodo.org/records/3722948")

    source = json.loads((data / "antarctica/seismic/antarctic-2020-now.geojson").read_text(encoding="utf8"))
    events = [feature(*f["geometry"]["coordinates"][:2], id=f["id"], mag=f["properties"]["mag"],
                      time=f["properties"]["time"], source="USGS") for f in source["features"]
              if f["properties"].get("type") == "earthquake"]
    index["seismic_concentration_heatmap"] = publish("seismic_concentration_heatmap", events, "USGS", source["metadata"]["url"])
    penguins = json.loads((PUBLIC / "web/geojson/emperor_penguin_colonies.geojson").read_text(encoding="utf8"))
    index["penguin_colonies_heatmap"] = publish("penguin_colonies_heatmap", penguins["features"],
        "Quantarctica · pingüino emperador", "../quantarctica/quantarctica_catalog.json")
    (PUBLIC / "heatmaps/index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf8")


if __name__ == "__main__":
    main()
