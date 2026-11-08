"""Demostración de integración completa AMOH (Encuentros AIS + Contexto Ambiental + Conducta)."""
from __future__ import annotations

from pathlib import Path
import sys
import duckdb

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.ais_service import AISService  # noqa: E402
from app.behavioral_analysis import BehavioralAnalysisService  # noqa: E402
from app.environmental_service import EnvironmentalService  # noqa: E402


def run_full_integration_demo() -> None:
    duckdb_path = ROOT / "data" / "antarctic.duckdb"
    conn = duckdb.connect(str(duckdb_path))
    try:
        ais_service = AISService(conn)
        env_service = EnvironmentalService(conn)
        beh_service = BehavioralAnalysisService(conn, env_service)

        vessels = conn.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()

        print("=== ANTARCTIC MARITIME HUB: FULL INTEGRATION DEMO ===\n")

        print("Checking for Vessel Encounters...")
        encounters = ais_service.get_encounters()
        if encounters:
            for enc in encounters:
                print(
                    f"  Signal ({enc.get('review_state', 'UNREVIEWED')}): "
                    f"{enc['vessel_a']} <-> {enc['vessel_b']} at {enc['utc']} "
                    f"(Duration: {enc.get('duration_hours', 0.0)}h, Dist: {enc['distance_m']}m)"
                )
        else:
            print("  No sustained vessel encounters detected.")

        print("\n" + "=" * 60 + "\n")

        print("Analyzing Vessel Behavior with Simulated Environmental Context...\n")
        for mmsi, name in vessels:
            analysis = beh_service.analyze_behavior(mmsi)
            if analysis.get("status") in {"insufficient_data", "not_found"}:
                continue

            env_data = env_service.correlate_vessel_with_environment(mmsi)
            if not env_data:
                continue
            avg_ice = sum(p["env"]["sea_ice_concentration"] for p in env_data) / len(env_data)
            avg_chl = sum(p["env"]["chlorophyll_mg_m3"] for p in env_data) / len(env_data)

            status_icon = "[!]" if analysis["is_suspicious"] else "[OK]"
            print(f"{status_icon} {name} ({mmsi})")
            print(f"   - Risk Level: {analysis['behavioral_score']['risk_level']}")
            print(f"   - Env Context (SIMULATION): Ice {avg_ice:.2f} | Chl {avg_chl:.2f}")
            print(f"   - Assessment: {analysis['analysis']}")
            print("-" * 30)
    finally:
        conn.close()


if __name__ == "__main__":
    run_full_integration_demo()

