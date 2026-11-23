"""Service-level, security config, and FastAPI endpoint tests for AMOH."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import sys
import tempfile
import types
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

try:
    import duckdb as _real_duckdb  # noqa: F401
    from fastapi.testclient import TestClient
    _DEPS_AVAILABLE = True
except ImportError:  # pragma: no cover
    _DEPS_AVAILABLE = False
    sys.modules.setdefault("duckdb", types.SimpleNamespace(DuckDBPyConnection=object, Error=Exception))

from app.ais_service import AISService  # noqa: E402
from app.config import Settings, ensure_dir  # noqa: E402
from app.environmental_service import EnvironmentalService  # noqa: E402
from app.scientific_metrics import MatchupService  # noqa: E402


class _MockResult:
    def __init__(self, rows):
        self._rows = rows

    def fetchone(self):
        return self._rows[0] if self._rows else (0,)

    def fetchall(self):
        return self._rows


class _InMemoryAISAndMatchupDB:
    """Lightweight in-memory DB double for testing AISService and MatchupService."""

    def __init__(self, ais_rows: list[tuple]):
        self.ais_rows = ais_rows
        self.inserted_matchups: list[list] = []

    def execute(self, query: str, params: list | None = None) -> _MockResult:
        q = " ".join(query.split())
        if "SELECT count(*) FROM ais_vessels" in q:
            return _MockResult([(len(self.ais_rows),)])
        if "SELECT count(DISTINCT mmsi) FROM ais_vessels" in q:
            mmsis = {r[0] for r in self.ais_rows}
            return _MockResult([(len(mmsis),)])
        if "SELECT name, count(*) as reports FROM ais_vessels" in q:
            counts: dict[str, int] = {}
            for r in self.ais_rows:
                counts[r[1]] = counts.get(r[1], 0) + 1
            sorted_top = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
            return _MockResult(sorted_top)
        if "SELECT min(utc), max(utc) FROM ais_vessels" in q:
            if not self.ais_rows:
                return _MockResult([(None, None)])
            utcs = [r[2] for r in self.ais_rows]
            return _MockResult([(min(utcs), max(utcs))])
        if "SELECT utc, latitude, longitude, speed, name FROM ais_vessels WHERE mmsi = ?" in q:
            target = params[0] if params else ""
            rows = [(r[2], r[3], r[4], r[5], r[1]) for r in self.ais_rows if r[0] == target]
            return _MockResult(rows)
        if "SELECT DISTINCT mmsi, name FROM ais_vessels" in q:
            seen = []
            for r in self.ais_rows:
                pair = (r[0], r[1])
                if pair not in seen:
                    seen.append(pair)
            return _MockResult(seen)
        if "SELECT mmsi, utc, latitude, longitude FROM ais_vessels" in q:
            rows = [(r[0], r[2], r[3], r[4]) for r in self.ais_rows]
            return _MockResult(rows)
        if "SELECT latitude, longitude FROM ais_vessels WHERE mmsi = ?" in q:
            target = params[0] if params else ""
            rows = [(r[3], r[4]) for r in self.ais_rows if r[0] == target]
            return _MockResult(rows)
        if "SELECT mmsi, name, utc, latitude, longitude FROM ais_vessels WHERE utc >= ? AND utc <= ?" in q:
            start_t, end_t = params[0], params[1]
            rows = [
                (r[0], r[1], r[2], r[3], r[4])
                for r in self.ais_rows
                if start_t <= r[2] <= end_t
            ]
            return _MockResult(rows)
        if "INSERT INTO scientific_matchups" in q:
            self.inserted_matchups.append(params or [])
            return _MockResult([])
        raise AssertionError(f"Unhandled query: {q}")


class CoreServiceAndConfigTests(unittest.TestCase):
    def setUp(self) -> None:
        os.environ["JWT_SECRET"] = "unit-test-configured-jwt-secret-key-32b"
        os.environ["ANON_SALT"] = "unit-test-configured-anon-salt-value-32b"
        from app.config import get_settings
        get_settings.cache_clear()

        self.base_time = datetime(2026, 1, 10, 10, 0, 0, tzinfo=timezone.utc)
        self.sample_rows = [
            ("224000111", "BIO HESPERIDES", self.base_time, -62.97, -60.68, 0.5),
            ("224000111", "BIO HESPERIDES", self.base_time + timedelta(hours=1), -62.98, -60.69, 8.2),
            ("730000222", "ARC SIMON BOLIVAR", self.base_time + timedelta(minutes=10), -64.80, -63.50, 5.0),
        ]
        self.db = _InMemoryAISAndMatchupDB(self.sample_rows)
        self.ais = AISService(self.db)
        self.env = EnvironmentalService(self.db)
        self.matchup = MatchupService(self.db, self.env)

    def test_ais_summary_route_and_geojson(self) -> None:
        summary = self.ais.get_summary()
        self.assertEqual(3, summary["total_positions"])
        self.assertEqual(2, summary["unique_vessels"])
        self.assertEqual("HISTORICAL", summary["data_state"])

        route = self.ais.get_vessel_route("224000111")
        self.assertIsNotNone(route)
        self.assertEqual("BIO HESPERIDES", route["name"])
        self.assertEqual(1, route["slow_points_count"])
        self.assertGreater(route["total_distance_nm"], 0.5)

        self.assertIsNone(self.ais.get_vessel_route("000000000"))

        geojson = self.ais.get_all_routes_geojson()
        self.assertEqual("FeatureCollection", geojson["type"])
        self.assertEqual(1, len(geojson["features"]))

    def test_matchup_outcomes_match_conflict_no_match_and_data_gap(self) -> None:
        # 1. Exact MATCH
        m1 = self.matchup.evaluate_observation(
            observation_id="obs-1",
            latitude=-62.971,
            longitude=-60.681,
            utc=self.base_time + timedelta(minutes=5),
            expected_mmsi="224000111",
        )
        self.assertEqual("MATCH", m1["outcome"])
        self.assertEqual("224000111", m1["matched_mmsi"])
        self.assertEqual("SIMULATION", m1["environmental_context"]["data_state"])

        # 2. CONFLICT (expected a different MMSI than the vessel present)
        m2 = self.matchup.evaluate_observation(
            observation_id="obs-2",
            latitude=-62.971,
            longitude=-60.681,
            utc=self.base_time + timedelta(minutes=5),
            expected_mmsi="730000222",
        )
        self.assertEqual("CONFLICT", m2["outcome"])

        # 3. NO_MATCH (far away from any vessel in the time window)
        m3 = self.matchup.evaluate_observation(
            observation_id="obs-3",
            latitude=-70.0,
            longitude=-10.0,
            utc=self.base_time + timedelta(minutes=5),
        )
        self.assertEqual("NO_MATCH", m3["outcome"])
        self.assertIsNone(m3["matched_mmsi"])

        # 4. DATA_GAP (outside AIS time coverage)
        m4 = self.matchup.evaluate_observation(
            observation_id="obs-4",
            latitude=-62.97,
            longitude=-60.68,
            utc=self.base_time + timedelta(days=10),
        )
        self.assertEqual("DATA_GAP", m4["outcome"])

    def test_config_rejects_insecure_placeholder_secrets_and_path_traversal(self) -> None:
        os.environ["JWT_SECRET"] = "change-me"
        os.environ["ANON_SALT"] = "dev-salt"
        with self.assertLogs("amoh.config", level="WARNING"):
            s = Settings()
        self.assertNotEqual("change-me", s.jwt_secret)
        self.assertNotEqual("dev-salt", s.anon_salt)
        self.assertEqual(64, len(s.jwt_secret))

        with tempfile.TemporaryDirectory() as tmp:
            safe_sub = ensure_dir(tmp, "media")
            self.assertTrue(safe_sub.is_dir())
            with self.assertRaises(ValueError):
                ensure_dir(tmp, "..")



@unittest.skipUnless(_DEPS_AVAILABLE, "Requires duckdb and fastapi/httpx installed")
class FastAPIEndpointsIntegrationTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp_dir = tempfile.TemporaryDirectory()
        os.environ["DATA_DIR"] = self._tmp_dir.name
        os.environ["DUCKDB_PATH"] = str(Path(self._tmp_dir.name) / "test_amoh.duckdb")
        os.environ["AMOH_OFFLINE_MODE"] = "true"

        from app.config import get_settings
        from app.database import get_db, reset_db_connection
        from app.main import app

        get_settings.cache_clear()
        reset_db_connection()

        # Seed sample AIS records
        db = get_db()
        db.execute(
            """
            INSERT INTO ais_vessels (id, expedition_id, mmsi, name, latitude, longitude, speed, course, heading, navstat, utc)
            VALUES
                (1, 'NGRS-ANTA-2027', '224000111', 'BIO HESPERIDES', -62.97, -60.68, 0.8, 120.0, 121.0, 0, '2026-01-10 10:00:00'),
                (2, 'NGRS-ANTA-2027', '224000111', 'BIO HESPERIDES', -62.971, -60.681, 0.5, 125.0, 125.0, 0, '2026-01-10 16:00:00'),
                (3, 'NGRS-ANTA-2027', '730000222', 'ARC SIMON BOLIVAR', -62.97, -60.68, 0.6, 110.0, 110.0, 0, '2026-01-10 10:15:00'),
                (4, 'NGRS-ANTA-2027', '730000222', 'ARC SIMON BOLIVAR', -62.97, -60.68, 0.4, 112.0, 112.0, 0, '2026-01-10 11:00:00'),
                (5, 'NGRS-ANTA-2027', '730000222', 'ARC SIMON BOLIVAR', -62.97, -60.68, 0.5, 115.0, 115.0, 0, '2026-01-10 12:00:00'),
                (6, 'NGRS-ANTA-2027', '224000111', 'BIO HESPERIDES', -62.97, -60.68, 0.7, 118.0, 118.0, 0, '2026-01-10 11:00:00'),
                (7, 'NGRS-ANTA-2027', '224000111', 'BIO HESPERIDES', -62.97, -60.68, 0.6, 119.0, 119.0, 0, '2026-01-10 12:15:00')
            """
        )
        self.client = TestClient(app)

    def tearDown(self) -> None:
        from app.config import get_settings
        from app.database import reset_db_connection

        reset_db_connection()
        get_settings.cache_clear()
        self._tmp_dir.cleanup()

    def test_health_and_security_headers(self) -> None:
        resp = self.client.get("/api/health")
        self.assertEqual(200, resp.status_code)
        self.assertEqual("ok", resp.json()["status"])
        self.assertEqual("nosniff", resp.headers.get("X-Content-Type-Options"))
        self.assertEqual("DENY", resp.headers.get("X-Frame-Options"))
        self.assertIn("default-src 'self'", resp.headers.get("Content-Security-Policy", ""))

    def test_system_status_and_network_info(self) -> None:
        status_resp = self.client.get("/api/system/status")
        self.assertEqual(200, status_resp.status_code)
        body = status_resp.json()
        self.assertEqual("SIMULATION", body["providers"]["environmental_earthdata"])
        self.assertEqual(7, body["counts"]["ais_positions"])

        net_resp = self.client.get("/api/network-info")
        self.assertEqual(200, net_resp.status_code)
        net_body = net_resp.json()
        self.assertNotIn(net_body["lan_ip"], ["localhost", "127.0.0.1", "0.0.0.0"])
        self.assertTrue(net_body["qr_target_url"].startswith("http://"))

    def test_ais_endpoints_and_404_handling(self) -> None:
        summary = self.client.get("/ais/summary").json()
        self.assertEqual(2, summary["unique_vessels"])

        vessels = self.client.get("/api/vessels?search=bolivar").json()
        self.assertEqual(1, vessels["count"])
        self.assertEqual("730000222", vessels["vessels"][0]["mmsi"])

        route = self.client.get("/ais/vessel/224000111")
        self.assertEqual(200, route.status_code)
        self.assertEqual("BIO HESPERIDES", route.json()["name"])

        missing_route = self.client.get("/ais/vessel/999999999")
        self.assertEqual(404, missing_route.status_code)

        missing_beh = self.client.get("/ais/behavior/999999999")
        self.assertEqual(404, missing_beh.status_code)

        missing_env = self.client.get("/ais/environment/999999999")
        self.assertEqual(404, missing_env.status_code)

        beh = self.client.get("/ais/behavior/224000111")
        self.assertEqual(200, beh.status_code)
        self.assertEqual("UNREVIEWED", beh.json()["review_state"])

        encounters = self.client.get("/ais/encounters?min_duration_hours=2.0").json()
        self.assertEqual(1, len(encounters))
        self.assertGreaterEqual(encounters[0]["duration_hours"], 2.0)

    def test_observations_crud_and_scientific_matchup(self) -> None:
        create_resp = self.client.post(
            "/api/observations",
            json={
                "latitude": -62.97,
                "longitude": -60.68,
                "utc": "2026-01-10T10:10:00Z",
                "observer_type": "RESEARCHER",
                "observation_type": "humpback_whale_sighting",
                "notes": "Two individuals near Deception Island",
            },
        )
        self.assertEqual(201, create_resp.status_code)
        obs = create_resp.json()
        self.assertEqual("UNREVIEWED", obs["review_state"])

        list_resp = self.client.get("/api/observations").json()
        self.assertEqual(1, list_resp["count"])

        match_resp = self.client.post(
            "/api/matchups/evaluate",
            json={
                "observation_id": obs["observation_id"],
                "latitude": -62.97,
                "longitude": -60.68,
                "utc": "2026-01-10T10:10:00",
                "expected_mmsi": "224000111",
            },
        )
        self.assertEqual(200, match_resp.status_code)
        match_data = match_resp.json()
        self.assertEqual("MATCH", match_data["outcome"])
        self.assertEqual("224000111", match_data["matched_mmsi"])
        self.assertEqual("SIMULATION", match_data["environmental_context"]["data_state"])

    def test_science_gsd_and_brier_endpoints(self) -> None:
        gsd_missing = self.client.post("/api/science/gsd", json={"altitude_m": 100.0})
        self.assertEqual(200, gsd_missing.status_code)
        self.assertEqual("UNAVAILABLE", gsd_missing.json()["gsd_cm_per_px"])

        brier = self.client.post(
            "/api/pythia/brier-weights",
            json={
                "agent_forecasts": {"ice_navigator": [1.0, 0.0], "skeptic": [0.5, 0.5]},
                "outcomes": [1, 0],
            },
        )
        self.assertEqual(200, brier.status_code)
        self.assertEqual("AI ANALYSIS", brier.json()["data_state"])

    def test_expeditions_passport_and_rewards(self) -> None:
        exps = self.client.get("/api/expeditions").json()
        self.assertGreaterEqual(len(exps["expeditions"]), 2)

        exp_detail = self.client.get("/api/expeditions/NGRS-ANTA-2027")
        self.assertEqual(200, exp_detail.status_code)
        self.assertEqual("PROPOSAL", exp_detail.json()["lifecycle_state"])

        passport = self.client.get("/api/passport/me").json()
        self.assertEqual("PROTOTYPE_SCIENTIFIC_PASSPORT", passport["document_type"])

        rewards = self.client.get("/api/rewards").json()
        self.assertIn("PENDING != PAID", rewards["rule"])


if __name__ == "__main__":
    unittest.main()
