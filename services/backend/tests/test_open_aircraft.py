"""Source time, filtering, coverage and provider outage for the ADS-B adapter."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.open_aircraft import _observations, collect_open_aircraft


class AircraftFeedTests(unittest.TestCase):
    def test_observed_time_and_invalid_positions(self):
        epoch = datetime(2026, 11, 26, 12, tzinfo=timezone.utc).timestamp()
        features = _observations({"now": epoch, "ac": [
            {"hex": "a1", "flight": "POLAR1 ", "lat": -63, "lon": -60, "seen_pos": 20},
            {"hex": "a2", "lat": -63, "lon": -60, "seen_pos": 400},
            {"hex": "a3", "lat": 5, "lon": -60, "seen_pos": 2},
            {"hex": "a4", "lat": -63, "lon": -60, "seen_pos": 2, "alt_baro": "ground"},
        ]})
        self.assertEqual(len(features), 1)
        self.assertEqual(features[0]["properties"]["callsign"], "POLAR1")
        self.assertEqual(features[0]["properties"]["observed_at"], "2026-11-26T11:59:40+00:00")

    def test_all_sectors_unavailable_is_not_empty_sky(self):
        with patch("app.open_aircraft.urllib.request.urlopen", side_effect=OSError("offline")):
            with self.assertRaises(RuntimeError):
                collect_open_aircraft()


if __name__ == "__main__":
    unittest.main()
