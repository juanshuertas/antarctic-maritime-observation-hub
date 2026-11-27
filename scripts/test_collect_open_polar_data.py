"""Focused validation for the public orbital snapshot collector."""

import unittest
from datetime import datetime, timedelta, timezone

from collect_open_polar_data import parse_tle, select_eo, tle_epoch, valid_tle


class OrbitCollectorTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 11, 26, 23, tzinfo=timezone.utc)
        self.line1 = "1 42767U 17036C   26330.79407291  .00001991  00000-0  97903-4 0  9998"
        self.line2 = "2 42767  97.4735  28.1235 0004266  93.9157 266.2566 15.19181944522832"

    def test_recent_three_line_element_set(self):
        rows = parse_tle("CARTOSAT 2E\n" + self.line1 + "\n" + self.line2, self.now)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["norad_id"], 42767)
        self.assertEqual(rows[0]["name"], "CARTOSAT 2E")
        self.assertEqual(tle_epoch(self.line1).year, 2026)

    def test_old_or_mismatched_elements_are_rejected(self):
        self.assertIsNone(valid_tle("CARTOSAT 2E", self.line1, self.line2, self.now + timedelta(days=15)))
        self.assertIsNone(valid_tle("CARTOSAT 2E", self.line1, self.line2.replace("2 42767", "2 42768"), self.now))

    def test_selects_named_earth_observation_missions(self):
        row = valid_tle("NISAR", self.line1, self.line2, self.now)
        assert row is not None
        self.assertEqual(select_eo([row])[0]["name"], "NISAR")


if __name__ == "__main__":
    unittest.main()
