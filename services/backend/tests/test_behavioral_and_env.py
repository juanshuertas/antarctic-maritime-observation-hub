"""Unit tests for BehavioralAnalysisService and EnvironmentalService scientific rules."""
from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.behavioral_analysis import BehavioralAnalysisService  # noqa: E402
from app.environmental_service import EnvironmentalService  # noqa: E402


class _FakeCursor:
    def __init__(self, rows):
        self._rows = rows

    def fetchall(self):
        return self._rows


class _FakeVesselDB:
    def __init__(self, rows):
        self.rows = rows

    def execute(self, _query, _params=None):
        return _FakeCursor(self.rows)


class BehavioralAndEnvironmentalTests(unittest.TestCase):
    def test_environmental_service_explicitly_marks_simulation_state(self) -> None:
        env = EnvironmentalService(_FakeVesselDB([]))
        ctx = env.get_context(-66.0, -64.0, datetime(2026, 1, 15, 12, 0))
        self.assertEqual("SIMULATION", ctx["data_state"])
        self.assertEqual(0.8, ctx["sea_ice_concentration"])
        self.assertEqual(-1.5, ctx["sst_celsius"])

    def test_behavior_returns_not_found_when_no_rows(self) -> None:
        beh = BehavioralAnalysisService(_FakeVesselDB([]))
        result = beh.analyze_behavior("999999999")
        self.assertEqual("not_found", result["status"])

    def test_behavior_returns_insufficient_data_for_single_point(self) -> None:
        rows = [(datetime(2026, 1, 1, 0, 0), -63.0, -60.0, 5.0)]
        beh = BehavioralAnalysisService(_FakeVesselDB(rows))
        result = beh.analyze_behavior("123456789")
        self.assertEqual("insufficient_data", result["status"])

    def test_behavior_preserves_observation_not_causation_principle(self) -> None:
        base = datetime(2026, 1, 1, 0, 0)
        rows = [
            (base, -60.0, -55.0, 1.2),
            (base + timedelta(hours=6), -60.001, -55.001, 1.0),
        ]
        env = EnvironmentalService(_FakeVesselDB([]))
        beh = BehavioralAnalysisService(_FakeVesselDB(rows), env_service=env)
        result = beh.analyze_behavior("123456789")

        self.assertTrue(result["is_suspicious"])
        self.assertEqual("UNREVIEWED", result["review_state"])
        self.assertEqual("SIMULATION", result["environment_data_state"])
        self.assertIn("Observation != Causation", result["disclaimer"])
        self.assertNotIn("High probability of IUU Fishing", result["analysis"])


if __name__ == "__main__":
    unittest.main()
