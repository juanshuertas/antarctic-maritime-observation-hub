"""Unit tests for AIS encounter duration filtering and N+1 query elimination."""
from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
import sys
import types
import unittest

try:
    import duckdb  # noqa: F401
except ImportError:  # pragma: no cover
    sys.modules.setdefault("duckdb", types.SimpleNamespace(DuckDBPyConnection=object, Error=Exception))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ais_service import AISService  # noqa: E402


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


class _SingleQueryFakeDB:
    """Verifies that get_encounters uses a single batch query instead of N+1 queries."""

    def __init__(self, vessels, all_rows):
        self.vessels = vessels
        self.all_rows = all_rows
        self.query_count = 0

    def execute(self, query, params=None):
        self.query_count += 1
        if "SELECT DISTINCT mmsi, name FROM ais_vessels" in query:
            return _Cursor(self.vessels)
        if "SELECT mmsi, utc, latitude, longitude" in query:
            return _Cursor(self.all_rows)
        raise AssertionError(f"Unexpected N+1 query: {query}")


class EncounterDurationTests(unittest.TestCase):
    def setUp(self) -> None:
        base = datetime(2026, 1, 1, 0, 0, 0)
        self.vessels = [("111", "Vessel A"), ("222", "Vessel B")]
        self.positions = {
            "111": [(base + timedelta(hours=i), -60.0, -50.0) for i in range(3)],
            "222": [(base + timedelta(hours=i), -60.0, -50.0) for i in range(3)],
        }

    def test_includes_encounter_when_duration_meets_threshold(self) -> None:
        service = AISService(_FakeDB(self.vessels, self.positions))
        encounters = service.get_encounters(min_duration_hours=2.0, max_dist_m=500.0)
        self.assertEqual(1, len(encounters))
        self.assertEqual(2.0, encounters[0]["duration_hours"])
        self.assertEqual("UNREVIEWED", encounters[0]["review_state"])

    def test_excludes_encounter_when_duration_below_threshold(self) -> None:
        service = AISService(_FakeDB(self.vessels, self.positions))
        encounters = service.get_encounters(min_duration_hours=3.0, max_dist_m=500.0)
        self.assertEqual([], encounters)

    def test_batch_query_avoids_n_plus_one_queries(self) -> None:
        base = datetime(2026, 1, 1, 0, 0, 0)
        all_rows = [
            ("111", base + timedelta(hours=i), -62.0, -58.0) for i in range(4)
        ] + [
            ("222", base + timedelta(hours=i), -62.0, -58.0) for i in range(4)
        ]
        db = _SingleQueryFakeDB(self.vessels, all_rows)
        service = AISService(db)
        encounters = service.get_encounters(min_duration_hours=2.0, max_dist_m=500.0)
        self.assertEqual(1, len(encounters))
        self.assertEqual(3.0, encounters[0]["duration_hours"])
        self.assertEqual(2, db.query_count)


if __name__ == "__main__":
    unittest.main()
