"""Unit tests for polar geodesy and coordinate validation."""
from __future__ import annotations

import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.geodesy import haversine_meters, haversine_nm, validate_coordinates  # noqa: E402


class GeodesyTests(unittest.TestCase):
    def test_zero_distance_at_identical_antarctic_coordinates(self) -> None:
        self.assertAlmostEqual(0.0, haversine_nm(-64.77, -64.05, -64.77, -64.05), places=6)
        self.assertAlmostEqual(0.0, haversine_meters(-64.77, -64.05, -64.77, -64.05), places=6)

    def test_one_degree_latitude_is_approx_60_nautical_miles(self) -> None:
        dist_nm = haversine_nm(-64.0, -60.0, -65.0, -60.0)
        self.assertAlmostEqual(60.0, dist_nm, delta=0.15)

    def test_polar_longitude_convergence_at_60_south(self) -> None:
        # At 60°S, cos(60°) = 0.5, so 1° of longitude is ~30 NM (~half of 1° latitude)
        dist_lon_nm = haversine_nm(-60.0, -60.0, -60.0, -61.0)
        self.assertAlmostEqual(30.0, dist_lon_nm, delta=0.15)

    def test_validate_coordinates_rejects_invalid_inputs(self) -> None:
        with self.assertRaises(ValueError):
            validate_coordinates(None, -60.0)
        with self.assertRaises(ValueError):
            validate_coordinates(-95.0, -60.0)
        with self.assertRaises(ValueError):
            validate_coordinates(-65.0, -185.0)
        with self.assertRaises(ValueError):
            validate_coordinates(math.nan, -60.0)
        with self.assertRaises(ValueError):
            validate_coordinates(-65.0, math.inf)


if __name__ == "__main__":
    unittest.main()
