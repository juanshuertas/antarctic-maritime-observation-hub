"""Collect small, timestamped public model and orbit snapshots for OLEA Pages.

This script intentionally does not convert model output into observations or
publish a value when its upstream source fails validation.
"""

import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast?"
    "latitude=-67.57,-77.85,-62.238&longitude=-68.13,166.67,-58.667&"
    "current=temperature_2m,wind_speed_10m&wind_speed_unit=kn&timezone=UTC"
)
TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle"
ACTIVE_TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
SATNOGS_URL = "https://db.satnogs.org/api/tle/?format=json"
STATIONS = ("Rothera", "McMurdo", "Carlini")
EO_NAMES = (
    "NISAR", "LANDSAT 8", "LANDSAT 9", "ALOS 2", "ALOS-4",
    "CRYOSAT 2", "ICESAT-2", "RADARSAT 2", "TERRA", "AQUA",
    "METOP-C", "NOAA 20", "NOAA 21", "RESOURCESAT 2A",
    "CARTOSAT 3", "PLEIADES 1B", "KOMPSAT 5",
)
MAX_TLE_AGE = timedelta(days=14)


def get(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "OLEA-open-data/1.0"})
    with urlopen(request, timeout=20) as response:
        return response.read()


def tle_epoch(line: str) -> datetime:
    if not line.startswith("1 ") or len(line) < 32:
        raise ValueError("Invalid TLE line 1")
    year = int(line[18:20])
    year += 2000 if year < 57 else 1900
    return datetime(year, 1, 1, tzinfo=timezone.utc) + timedelta(days=float(line[20:32]) - 1)


def valid_tle(name: str, line1: str, line2: str, now: datetime) -> dict | None:
    if not (line1.startswith("1 ") and line2.startswith("2 ")
            and len(line1) >= 69 and len(line2) >= 69
            and line1[2:7] == line2[2:7]):
        return None
    try:
        epoch = tle_epoch(line1)
        norad_id = int(line1[2:7])
    except ValueError:
        return None
    if not -timedelta(days=1) <= now - epoch <= MAX_TLE_AGE:
        return None
    return {"name": name.removeprefix("0 ").strip(), "norad_id": norad_id,
            "epoch": epoch.isoformat().replace("+00:00", "Z"),
            "tle1": line1, "tle2": line2}


def parse_tle(text: str, now: datetime) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    rows = []
    index = 0
    while index < len(lines):
        if lines[index].startswith("1 "):
            name = f"NORAD {lines[index][2:7]}"
            pair = lines[index:index + 2]
            index += 2
        else:
            name = lines[index]
            pair = lines[index + 1:index + 3]
            index += 3
        if len(pair) == 2:
            row = valid_tle(name, pair[0], pair[1], now)
            if row:
                rows.append(row)
    return rows


def select_eo(rows: list[dict]) -> list[dict]:
    # Named missions first, then polar SAR spacecraft. No guessed satellite IDs.
    by_name = {row["name"].upper(): row for row in rows}
    selected = [by_name[name] for name in EO_NAMES if name in by_name]
    selected.extend(row for name, row in sorted(by_name.items())
                    if name.startswith("ICEYE-X") and row not in selected)
    return selected[:25]


def collect_satellites(now: datetime) -> tuple[list[dict], str]:
    errors = []
    for url in (TLE_URL, ACTIVE_TLE_URL, SATNOGS_URL):
        try:
            if url == SATNOGS_URL:
                raw = json.loads(get(url))
                if not isinstance(raw, list):
                    raise ValueError("Unexpected SatNOGS response")
                rows = [row for item in raw if isinstance(item, dict)
                        if (row := valid_tle(str(item.get("tle0", "")),
                                             str(item.get("tle1", "")),
                                             str(item.get("tle2", "")), now))]
                for row in rows:
                    row["upstream_source"] = next(
                        (str(item.get("tle_source")) for item in raw
                         if item.get("norad_cat_id") == row["norad_id"]), "SatNOGS")
            else:
                rows = parse_tle(get(url).decode("ascii"), now)
            selected = select_eo(rows)
            if len(selected) < 10:
                raise ValueError(f"Only {len(selected)} recent named Earth-observation TLEs")
            return selected, url
        except (OSError, UnicodeError, ValueError, TypeError) as error:
            errors.append(f"{url}: {type(error).__name__}")
    raise ValueError("; ".join(errors))


def main(output: Path) -> None:
    output.mkdir(parents=True, exist_ok=True)
    fetched_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    status = {}

    try:
        rows = json.loads(get(WEATHER_URL))
        if not isinstance(rows, list) or len(rows) != len(STATIONS):
            raise ValueError("Unexpected Open-Meteo row count")
        points = []
        for station, row in zip(STATIONS, rows):
            current = row["current"]
            valid_at = datetime.fromisoformat(current["time"] + "+00:00")
            if abs((datetime.now(timezone.utc) - valid_at).total_seconds()) > 3 * 3600:
                raise ValueError("Open-Meteo model time is not current")
            points.append({
                "station": station,
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "temperatureC": current.get("temperature_2m"),
                "windKts": current.get("wind_speed_10m"),
                "validAt": valid_at.isoformat().replace("+00:00", "Z"),
            })
        (output / "weather.json").write_text(json.dumps({
            "type": "weather_model", "source": WEATHER_URL,
            "fetched_at": fetched_at, "points": points,
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        status["weather"] = "ok"
    except (OSError, ValueError, KeyError, TypeError) as error:
        status["weather"] = f"unavailable: {type(error).__name__}"
        print(f"Weather unavailable: {error}", file=sys.stderr)

    try:
        satellites, source = collect_satellites(datetime.now(timezone.utc))
        (output / "satellites_tle.json").write_text(json.dumps({
            "type": "orbital_elements", "source": source, "fetched_at": fetched_at,
            "propagation": "SGP4; calculated positions, not direct observations",
            "satellites": satellites,
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        (output / "earth-resources.tle").write_text("\n".join(
            f"{row['name']}\n{row['tle1']}\n{row['tle2']}" for row in satellites
        ) + "\n", encoding="ascii")
        status["earth_resources_tle"] = f"ok: {len(satellites)} via {source}"
    except (OSError, UnicodeError, ValueError, TypeError) as error:
        status["earth_resources_tle"] = f"unavailable: {type(error).__name__}"
        print(f"TLE unavailable: {error}", file=sys.stderr)

    (output / "manifest.json").write_text(json.dumps({
        "fetched_at": fetched_at,
        "sources": {"weather": WEATHER_URL, "earth_resources_tle": [TLE_URL, ACTIVE_TLE_URL, SATNOGS_URL]},
        "status": status,
        "refresh_status": "ok" if any(value.startswith("ok") for value in status.values()) else "unavailable",
    }, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
