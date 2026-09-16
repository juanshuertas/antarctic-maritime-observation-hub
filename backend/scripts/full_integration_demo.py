
import os
import sys
import duckdb
from pathlib import Path

# Fix path for imports
root = Path(__file__).resolve().parents[2]
app_path = root / "backend" / "app"
sys.path.append(str(app_path))

from ais_service import AISService
from environmental_service import EnvironmentalService
from behavioral_analysis import BehavioralAnalysisService

def run_full_integration_demo():
    duckdb_path = root / "data" / "antarctic.duckdb"
    conn = duckdb.connect(str(duckdb_path))

    ais_service = AISService(conn)
    env_service = EnvironmentalService(conn)
    beh_service = BehavioralAnalysisService(conn, env_service)

    vessels = conn.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()

    print("=== ANTARCTIC MARITIME HUB: FULL INTEGRATION DEMO ===\n")

    # 1. Test Encounters (Transshipments)
    print("Checking for Vessel Encounters...")
    encounters = ais_service.get_encounters()
    if encounters:
        for enc in encounters:
            print(f"  Warning: Potential Transshipment: {enc['vessel_a']} <-> {enc['vessel_b']} at {enc['utc']} (Dist: {enc['distance_m']}m)")
    else:
        print("  No suspicious encounters detected.")

    print("\n" + "="*60 + "\n")

    # 2. Detailed Behavioral & Environmental Analysis
    print("Analyzing Vessel Behavior with NASA Context...\n")
    for mmsi, name in vessels:
        analysis = beh_service.analyze_behavior(mmsi)
        if analysis.get("status") == "insufficient_data":
            continue

        env_data = env_service.correlate_vessel_with_environment(mmsi)
        avg_ice = sum([p['env']['sea_ice_concentration'] for p in env_data]) / len(env_data)
        avg_chl = sum([p['env']['chlorophyll_mg_m3'] for p in env_data]) / len(env_data)

        status_icon = "[!]" if analysis["is_suspicious"] else "[OK]"
        print(f"{status_icon} {name} ({mmsi})")
        print(f"   - Risk Level: {analysis['behavioral_score']['risk_level']}")
        print(f"   - Environmental Context: Ice {avg_ice:.2f} | Chl {avg_chl:.2f}")
        print(f"   - Verdict: {analysis['analysis']}")
        print("-" * 30)

    conn.close()

if __name__ == "__main__":
    run_full_integration_demo()
