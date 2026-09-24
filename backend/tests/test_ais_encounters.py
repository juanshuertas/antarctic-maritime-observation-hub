import sys
import types
import unittest
from datetime import datetime, timedelta
from pathlib import Path

sys.modules.setdefault("duckdb", types.SimpleNamespace(DuckDBPyConnection=object))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ais_service import AISService


class _Cursor:
    def __init__(self, rows):
        self._rows = rows

    def fetchall(self):
        return self._rows


class _FakeDB:
    def __init__(self, vessels, positions):
        self.vessels = vessels
        self.positions = positions

    def execute(self, query, params=None):
        if "SELECT DISTINCT mmsi, name FROM ais_vessels" in query:
            return _Cursor(self.vessels)
        if "SELECT utc, latitude, longitude FROM ais_vessels WHERE mmsi = ?" in query:
            return _Cursor(self.positions[params[0]])
        raise AssertionError(f"Unexpected query: {query}")


class EncounterDurationTests(unittest.TestCase):
    def setUp(self):
        base = datetime(2026, 1, 1, 0, 0, 0)
        self.vessels = [("111", "Vessel A"), ("222", "Vessel B")]
        self.positions = {
            "111": [(base + timedelta(hours=i), -60.0, -50.0) for i in range(3)],
            "222": [(base + timedelta(hours=i), -60.0, -50.0) for i in range(3)],
        }

    def test_includes_encounter_when_duration_meets_threshold(self):
        service = AISService(_FakeDB(self.vessels, self.positions))
        encounters = service.get_encounters(min_duration_hours=2.0, max_dist_m=500.0)
        self.assertEqual(1, len(encounters))
        self.assertEqual(2.0, encounters[0]["duration_hours"])

    def test_excludes_encounter_when_duration_below_threshold(self):
        service = AISService(_FakeDB(self.vessels, self.positions))
        encounters = service.get_encounters(min_duration_hours=3.0, max_dist_m=500.0)
        self.assertEqual([], encounters)


if __name__ == "__main__":
    unittest.main()
