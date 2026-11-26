"""Collect small, timestamped public model and orbit snapshots for OLEA Pages.

This script intentionally does not convert model output into observations or
publish a value when its upstream source fails validation.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast?"
    "latitude=-67.57,-77.85,-62.238&longitude=-68.13,166.67,-58.667&"
    "current=temperature_2m,wind_speed_10m&wind_speed_unit=kn&timezone=UTC"
)
TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=earth-resources&FORMAT=tle"
STATIONS = ("Rothera", "McMurdo", "Carlini")


def get(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "OLEA-open-data/1.0"})
    with urlopen(request, timeout=20) as response:
        return response.read()


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
        tle = get(TLE_URL).decode("ascii")
        lines = [line.strip() for line in tle.splitlines() if line.strip()]
        if len(lines) < 3 or len(lines) % 3 or not all(
            lines[index + 1].startswith("1 ") and lines[index + 2].startswith("2 ")
            for index in range(0, len(lines), 3)
        ):
            raise ValueError("Unexpected CelesTrak TLE structure")
        (output / "earth-resources.tle").write_text("\n".join(lines) + "\n", encoding="ascii")
        status["earth_resources_tle"] = "ok"
    except (OSError, UnicodeError, ValueError) as error:
        status["earth_resources_tle"] = f"unavailable: {type(error).__name__}"
        print(f"TLE unavailable: {error}", file=sys.stderr)

    (output / "manifest.json").write_text(json.dumps({
        "fetched_at": fetched_at,
        "sources": {"weather": WEATHER_URL, "earth_resources_tle": TLE_URL},
        "status": status,
        "refresh_status": "ok" if any(value == "ok" for value in status.values()) else "unavailable",
    }, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
