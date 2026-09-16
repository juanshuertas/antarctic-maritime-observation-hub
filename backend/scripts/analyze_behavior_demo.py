
import os
import sys
import duckdb
from pathlib import Path

# Fix path for imports
root = Path(__file__).resolve().parents[2]
app_path = root / "backend" / "app"
sys.path.append(str(app_path))

from behavioral_analysis import BehavioralAnalysisService

def run_demo():
    duckdb_path = root / "data" / "antarctic.duckdb"

    conn = duckdb.connect(str(duckdb_path))
    service = BehavioralAnalysisService(conn)

    vessels = conn.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()

    print("=== SHADOW-FISH BEHAVIORAL ANALYSIS DEMO ===\n")

    for mmsi, name in vessels:
        analysis = service.analyze_behavior(mmsi)
        if analysis.get("status") == "insufficient_data":
            continue

        status_icon = "[!]" if analysis["is_suspicious"] else "[OK]"
        print(f"{status_icon} {name} ({mmsi})")
        print(f"   - Risk Level: {analysis['behavioral_score']['risk_level']}")
        print(f"   - Shadow Gaps: {analysis['behavioral_score']['shadow_gaps_count']}")
        print(f"   - Fishing Indicators: {analysis['behavioral_score']['fishing_pattern_score']}")
        print(f"   - Verdict: {analysis['analysis']}")
        print("-" * 50)

    conn.close()

if __name__ == "__main__":
    run_demo()
