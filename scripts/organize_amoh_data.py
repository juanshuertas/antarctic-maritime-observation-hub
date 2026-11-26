r"""Inventory local OLEA data without silently deleting scientific evidence.

Examples (PowerShell):
  python scripts/organize_amoh_data.py --data-root C:\AMOH\data
  python scripts/organize_amoh_data.py --data-root C:\AMOH\data --fetch-gp
  python scripts/organize_amoh_data.py --data-root C:\AMOH\data --archive-backups

Backup files are moved to the archive only when --archive-backups is passed.
Other duplicates are reported for curator review; moving raw observations
would destroy provenance.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile
from urllib.request import Request, urlopen


MSPGLOBAL = {
    "title": "MSPglobal Data Toolbox, Volume 1: Marine Spatial Data Infrastructure",
    "publisher": "UNESCO-IOC",
    "url": "https://toolbox.mspglobal2030.org/spatial-data-infrastructure/index.html",
    "cover_url": "https://toolbox.mspglobal2030.org/spatial-data-infrastructure/cover.html",
    "kind": "methodology_reference",
    "note": "A methodology publication, not a downloadable geospatial layer. Layer licenses must be checked individually.",
}
CELESTRAK_WEATHER = "https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=json"
SKIP_DIRS = {"_archive_backups", ".git", "credentials", ".private", "__pycache__"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def iter_files(root: Path):
    for base, dirs, files in os.walk(root):
        dirs[:] = sorted(name for name in dirs if name not in SKIP_DIRS and not (Path(base) / name).is_symlink())
        for name in sorted(files):
            path = Path(base) / name
            if path.is_symlink() or name == "data_manifest.json":
                continue
            yield path


def is_backup(path: Path) -> bool:
    name = path.name.lower()
    return ".bak" in name or name.endswith((".backup", ".old"))


def archive_backup(path: Path, root: Path, archive: Path) -> str:
    relative = path.relative_to(root)
    target = archive / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        if sha256(target) == sha256(path):
            path.unlink()
            return target.relative_to(root).as_posix()
        target = target.with_name(target.name + "." + sha256(path)[:12])
    shutil.move(str(path), str(target))
    return target.relative_to(root).as_posix()


def fetch_weather_gp(destination: Path) -> dict:
    request = Request(CELESTRAK_WEATHER, headers={"User-Agent": "OLEA-data-inventory/1.0"})
    with urlopen(request, timeout=25) as response:
        payload = response.read(5 * 1024 * 1024 + 1)
    if len(payload) > 5 * 1024 * 1024:
        raise ValueError("CelesTrak response exceeds 5 MB")
    rows = json.loads(payload)
    if not isinstance(rows, list) or not rows or not all("NORAD_CAT_ID" in row for row in rows):
        raise ValueError("Unexpected CelesTrak GP JSON format")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=destination.parent, delete=False) as temp:
        json.dump(rows, temp, ensure_ascii=False, indent=2)
        temp_path = Path(temp.name)
    temp_path.replace(destination)
    return {"url": CELESTRAK_WEATHER, "downloaded_at_utc": utc_now(), "format": "CelesTrak GP JSON", "records": len(rows)}


def inventory(root: Path, archive_backups: bool = False, fetch_gp: bool = False) -> dict:
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Data root must be a directory")
    archive = root / "_archive_backups"
    files = []
    seen: dict[tuple[int, str], str] = {}
    duplicates = []
    archived = []
    errors = []
    gp = None
    if fetch_gp:
        try:
            gp = fetch_weather_gp(root / "satellites" / "celestrak_weather_gp.json")
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            errors.append({"source": CELESTRAK_WEATHER, "error": str(exc)})
    for path in iter_files(root):
        relative = path.relative_to(root).as_posix()
        try:
            size = path.stat().st_size
            digest = sha256(path)
            key = (size, digest)
            record = {"path": relative, "size_bytes": size, "sha256": digest}
            first = seen.get(key)
            if first is not None:
                record["exact_duplicate_of"] = first
                duplicates.append({"path": relative, "duplicate_of": first})
            else:
                seen[key] = relative
            if archive_backups and is_backup(path):
                record["archived_to"] = archive_backup(path, root, archive)
                archived.append(record["archived_to"])
            files.append(record)
        except OSError as exc:
            errors.append({"path": relative, "error": str(exc)})
    result = {
        "schema_version": 1,
        "generated_at_utc": utc_now(),
        "root": str(root),
        "file_count": len(files),
        "exact_duplicate_count": len(duplicates),
        "files": files,
        "exact_duplicates": duplicates,
        "archived_backups": archived,
        "references": {"mspglobal": MSPGLOBAL, "celestrak_weather_gp": gp},
        "errors": errors,
        "publication_note": "Local paths and hashes are for inventory only. Review privacy and redistribution licenses before publishing any file.",
    }
    output = root / "data_manifest.json"
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=root, delete=False) as temp:
        json.dump(result, temp, ensure_ascii=False, indent=2)
        temp.write("\n")
        temp_path = Path(temp.name)
    temp_path.replace(output)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-root", type=Path, default=Path("data"))
    parser.add_argument("--archive-backups", action="store_true", help="Move backup files to data/_archive_backups, retaining their contents")
    parser.add_argument("--fetch-gp", action="store_true", help="Download public CelesTrak weather satellite GP JSON (OMM, not legacy TLE)")
    args = parser.parse_args()
    result = inventory(args.data_root, args.archive_backups, args.fetch_gp)
    print(json.dumps({key: result[key] for key in ("file_count", "exact_duplicate_count", "archived_backups", "errors")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
