"""Unit tests for Brier Score agent weighting (all 5 README scenarios) and DJI Aerial GSD."""
from __future__ import annotations

from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.scientific_metrics import (  # noqa: E402
    calculate_gsd_cm_per_px,
    compute_brier_score,
    compute_brier_weights,
)


class ScientificMetricsTests(unittest.TestCase):
    # ------------------------------------------------------------------
    # Brier Score & Agent Weighting (5 Mandatory README Scenarios)
    # ------------------------------------------------------------------

    def test_brier_perfect_prediction(self) -> None:
        result = compute_brier_weights(
            agent_forecasts={
                "ice_navigator": [1.0, 0.0, 1.0],
                "skeptic": [0.5, 0.5, 0.5],
            },
            outcomes=[1, 0, 1],
        )
        self.assertEqual(0.0, result["agents"]["ice_navigator"]["brier_score"])
        self.assertGreater(
            result["agents"]["ice_navigator"]["weight"],
            result["agents"]["skeptic"]["weight"],
        )
        self.assertAlmostEqual(
            1.0,
            sum(a["weight"] for a in result["agents"].values()),
            places=5,
        )

    def test_brier_poor_prediction(self) -> None:
        result = compute_brier_weights(
            agent_forecasts={
                "poor_agent": [0.0, 1.0, 0.0],
                "good_agent": [0.9, 0.1, 0.8],
            },
            outcomes=[1, 0, 1],
        )
        self.assertEqual(1.0, result["agents"]["poor_agent"]["brier_score"])
        self.assertEqual(0.0, result["agents"]["poor_agent"]["weight"])
        self.assertEqual(1.0, result["agents"]["good_agent"]["weight"])

    def test_brier_equal_agents(self) -> None:
        result = compute_brier_weights(
            agent_forecasts={
                "ice_navigator": [0.8, 0.2],
                "marine_biologist": [0.8, 0.2],
                "naval_strategist": [0.8, 0.2],
                "skeptic": [0.8, 0.2],
            },
            outcomes=[1, 0],
        )
        for agent in result["agents"].values():
            self.assertAlmostEqual(0.25, agent["weight"], places=5)

    def test_brier_missing_data(self) -> None:
        result = compute_brier_weights(
            agent_forecasts={
                "partial_agent": [1.0, None, 0.0],
                "empty_agent": [None, None, None],
            },
            outcomes=[1, 1, 0],
        )
        self.assertEqual(0.0, result["agents"]["partial_agent"]["brier_score"])
        self.assertEqual(1.0, result["agents"]["partial_agent"]["weight"])
        self.assertIsNone(result["agents"]["empty_agent"]["brier_score"])
        self.assertEqual(0.0, result["agents"]["empty_agent"]["weight"])

    def test_brier_single_agent(self) -> None:
        result = compute_brier_weights(
            agent_forecasts={"solo_agent": [0.7, 0.3]},
            outcomes=[1, 0],
        )
        self.assertAlmostEqual(0.09, result["agents"]["solo_agent"]["brier_score"], places=5)
        self.assertEqual(1.0, result["agents"]["solo_agent"]["weight"])

    def test_brier_rejects_out_of_range_probabilities(self) -> None:
        with self.assertRaises(ValueError):
            compute_brier_score([1.5], [1])

    # ------------------------------------------------------------------
    # DJI Ground Sample Distance (GSD) Calculator
    # ------------------------------------------------------------------

    def test_dji_gsd_valid_calculation(self) -> None:
        # Sw=13.2mm, H=100m, Fr=8.8mm, ImW=5472px -> (13.2 * 100 * 100) / (8.8 * 5472) = 2.7412 cm/px
        res = calculate_gsd_cm_per_px(
            sensor_width_mm=13.2,
            altitude_m=100.0,
            focal_length_mm=8.8,
            image_width_px=5472,
        )
        self.assertEqual("COMPUTED", res["status"])
        self.assertAlmostEqual(2.7412, res["gsd_cm_per_px"], places=4)

    def test_dji_gsd_returns_unavailable_when_sensor_width_missing(self) -> None:
        res = calculate_gsd_cm_per_px(
            sensor_width_mm=None,
            altitude_m=100.0,
            focal_length_mm=8.8,
            image_width_px=5472,
        )
        self.assertEqual("UNAVAILABLE", res["gsd_cm_per_px"])
        self.assertEqual("UNAVAILABLE", res["status"])

    def test_dji_gsd_returns_unavailable_for_non_positive_values(self) -> None:
        res = calculate_gsd_cm_per_px(
            sensor_width_mm=13.2,
            altitude_m=-10.0,
            focal_length_mm=8.8,
            image_width_px=5472,
        )
        self.assertEqual("UNAVAILABLE", res["gsd_cm_per_px"])


if __name__ == "__main__":
    unittest.main()
