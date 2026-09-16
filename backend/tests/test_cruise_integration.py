import unittest

from app.services.cruise_integration import build_scenario_seed, get_public_route_summary


class CruiseIntegrationTests(unittest.TestCase):
    def test_summary_includes_known_route(self):
        summary = get_public_route_summary("PB-128")
        self.assertEqual(summary["route_id"], "PB-128")
        self.assertGreater(summary["stage_count"], 0)
        self.assertIn("Peace Boat", summary["operator"])

    def test_scenario_seed_has_factual_context(self):
        seed = build_scenario_seed("PB-128")
        self.assertIn("AMOH EXPERIMENTAL SCENARIO INPUT", seed)
        self.assertIn("PB-128", seed)
        self.assertIn("not a forecast", seed.lower())


if __name__ == "__main__":
    unittest.main()
