"""Cache scientific source documents locally and publish a small integrity index."""
import argparse
import hashlib
import json
import os
import tempfile
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
ATLAS = "https://www.arcgis.com/sharing/rest/content/items/0cd1cdee853c413a84bfe4b9a6931f0d"
MSP = "https://toolbox.mspglobal2030.org/spatial-data-infrastructure/"
SOURCES = {
    "natgeo_atlas/config.json": ATLAS + "/data?f=json",
    "natgeo_atlas/item.json": ATLAS + "?f=json",
    "mspglobal_2030/index.html": MSP + "index.html",
    "mspglobal_2030/cover.html": MSP + "cover.html",
    "repos/telemanom.zip": "https://codeload.github.com/khundman/telemanom/zip/HEAD",
    "repos/wildflow.zip": "https://codeload.github.com/wildflowai/platform/zip/HEAD",
    "biodiversity/obis.json": "https://api.obis.org/v3/occurrence?geometry=POLYGON%28%28-65%20-66,-60%20-66,-60%20-64,-65%20-64,-65%20-66%29%29&size=100",
    "biodiversity/gbif.json": "https://api.gbif.org/v1/occurrence/search?decimalLatitude=-90,-60&hasCoordinate=true&limit=300",
}
for chapter in [*(f"ch{i}" for i in range(1, 8)), "references", "annexes"]:
    SOURCES[f"mspglobal_2030/{chapter}.html"] = MSP + chapter + ".html"
for region in ("east-pacific", "south-atlantic", "west-indian", "west-australia", "southwest-pacific"):
    SOURCES[f"mapped_earth/{region}.html"] = "https://mapped.earth/migrations/humpback-whale-" + region
for projection in ("3031", "3857"):
    SOURCES[f"gibs/epsg{projection}.xml"] = f"https://gibs.earthdata.nasa.gov/wmts/epsg{projection}/best/1.0.0/WMTSCapabilities.xml"


def write_json(path, document):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False, mode="w", encoding="utf8") as out:
        json.dump(document, out, ensure_ascii=False, indent=2)
        out.write("\n")
    os.replace(out.name, path)


def acquire(root, name, url, refresh):
    target = root / name
    target.parent.mkdir(parents=True, exist_ok=True)
    meta = target.with_suffix(target.suffix + ".source.json")
    if not refresh and target.exists() and meta.exists():
        record = json.loads(meta.read_text(encoding="utf8"))
        with target.open("rb") as stream:
            if record["url"] == url and hashlib.file_digest(stream, "sha256").hexdigest() == record["sha256"]:
                return record
    for attempt in range(3):
        part = None
        try:
            request = Request(url, headers={"User-Agent": "OLEA-Observatory/1.0"})
            with urlopen(request, timeout=35) as response, tempfile.NamedTemporaryFile(dir=target.parent, delete=False) as out:
                part = Path(out.name)
                digest = hashlib.sha256()
                while chunk := response.read(1024 * 1024):
                    digest.update(chunk)
                    out.write(chunk)
            if name.endswith(".json"):
                payload = json.loads(part.read_bytes())
                if "error" in payload:
                    raise ValueError("Provider returned an API error")
            elif name.endswith(".zip") and not zipfile.is_zipfile(part):
                raise ValueError("Expected ZIP")
            elif name.endswith(".xml"):
                import xml.etree.ElementTree as ET
                if not ET.parse(part).getroot().tag.endswith("Capabilities"):
                    raise ValueError("Expected WMTS capabilities")
            elif name.endswith(".html") and b"<html" not in part.read_bytes()[:4096].lower():
                raise ValueError("Expected HTML")
            record = dict(file=name, url=url, sha256=digest.hexdigest(), bytes=part.stat().st_size,
                          retrieved_utc=datetime.now(timezone.utc).isoformat(),
                          license="Consult source terms; raw content stored locally")
            os.replace(part, target)
            write_json(meta, record)
            return record
        except Exception as exc:
            if part:
                part.unlink(missing_ok=True)
            if attempt == 2:
                return dict(file=name, url=url, error=str(exc))
            time.sleep(2 ** attempt)


def atlas_catalog(cache, refresh, rows):
    config = cache / "natgeo_atlas/config.json"
    if not config.is_file():
        return
    group = json.loads(config.read_bytes())["values"]["group"]
    services = []
    seen = set()
    start = 1
    while start > 0 and start not in seen:
        seen.add(start)
        url = f"https://www.arcgis.com/sharing/rest/search?q=group%3A{group}&sortField=title&num=100&start={start}&f=json"
        name = f"natgeo_atlas/group_{start}.json"
        record = acquire(cache, name, url, refresh)
        rows.append(record)
        if "error" in record:
            return
        page = json.loads((cache / name).read_bytes())
        for item in page["results"]:
            if (item.get("url") or "").startswith("https://"):
                services.append({"title": item["title"], "type": item["type"], "url": item["url"],
                                 "item": "https://www.arcgis.com/home/item.html?id=" + item["id"]})
        start = page["nextStart"]
    write_json(ROOT / "apps/web/public/data/science/natgeo_atlas_layers.json", services)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, default=Path(r"C:\AMOH\data\external_sources"))
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    with ThreadPoolExecutor(max_workers=5) as pool:
        rows = list(pool.map(lambda item: acquire(args.cache, *item, args.refresh), SOURCES.items()))
    atlas_catalog(args.cache, args.refresh, rows)
    write_json(args.cache / "manifest.json", rows)
    write_json(ROOT / "apps/web/public/data/science/external_source_index.json", rows)
    import xml.etree.ElementTree as ET
    sensors = {}
    for epsg in ("3031", "3857"):
        path = args.cache / f"gibs/epsg{epsg}.xml"
        if not path.exists():
            continue
        layers = []
        for layer in ET.parse(path).findall(".//{*}Contents/{*}Layer"):
            key = layer.findtext("{*}Identifier", "")
            if key.endswith(("CorrectedReflectance_TrueColor", "CorrectedReflectance_Bands721")) or key == "BlueMarble_NextGeneration" or key.startswith(("GHRSST_", "AMSR2_Sea_Ice", "GCOM-C")):
                layers.append(dict(id=key, title=layer.findtext("{*}Title", key),
                                   date=layer.findtext("{*}Dimension/{*}Default")))
        sensors[epsg] = layers
    if all(sensors.get(p) for p in ("3031", "3857")):
        write_json(ROOT / "apps/web/public/data/science/gibs_sensors.json", sensors)
    for row in rows:
        print(row["file"], row.get("error", row.get("bytes")))


if __name__ == "__main__":
    main()
