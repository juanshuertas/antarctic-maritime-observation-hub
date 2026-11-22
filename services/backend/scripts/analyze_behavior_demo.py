"""Demostración de análisis conductual marítimo (AMOH)."""
from __future__ import annotations

from pathlib import Path
import sys
import duckdb

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.behavioral_analysis import BehavioralAnalysisService  # noqa: E402


def run_demo() -> None:
    duckdb_path = ROOT / "data" / "antarctic.duckdb"
    conn = duckdb.connect(str(duckdb_path))
    try:
        service = BehavioralAnalysisService(conn)
        vessels = conn.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()

        print("=== AMOH BEHAVIORAL ANALYSIS DEMO ===\n")

        for mmsi, name in vessels:
            analysis = service.analyze_behavior(mmsi)
            if analysis.get("status") in {"insufficient_data", "not_found"}:
                continue

            status_icon = "[!]" if analysis["is_suspicious"] else "[OK]"
            print(f"{status_icon} {name} ({mmsi})")
            print(f"   - Risk Level: {analysis['behavioral_score']['risk_level']}")
            print(f"   - Review State: {analysis.get('review_state')}")
            print(f"   - Shadow Gaps: {analysis['behavioral_score']['shadow_gaps_count']}")
            print(f"   - Low-Speed Indicators: {analysis['behavioral_score']['fishing_pattern_score']}")
            print(f"   - Assessment: {analysis['analysis']}")
            print("-" * 50)
    finally:
        conn.close()


if __name__ == "__main__":
    run_demo()

