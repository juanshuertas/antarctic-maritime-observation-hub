
import duckdb
from typing import List, Dict, Any
from datetime import timedelta

class BehavioralAnalysisService:
    def __init__(self, db_conn: duckdb.DuckDBPyConnection, env_service=None):
        self.db = db_conn
        self.env_service = env_service

    def analyze_behavior(self, mmsi: str) -> Dict[str, Any]:
        data = self.db.execute("""
            SELECT utc, latitude, longitude, speed
            FROM ais_vessels
            WHERE mmsi = ?
            ORDER BY utc ASC
        """, [mmsi]).fetchall()

        if len(data) < 2:
            return {"status": "insufficient_data"}

        shadow_gaps = []
        fishing_indicators = 0
        environmental_risk_points = 0
        is_suspicious = False

        for i in range(1, len(data)):
            prev_utc, prev_lat, prev_lon, prev_speed = data[i-1]
            curr_utc, curr_lat, curr_lon, curr_speed = data[i]

            # 1. ShadowBroker Logic: Gaps
            time_diff = curr_utc - prev_utc
            if time_diff > timedelta(hours=4):
                shadow_gaps.append({
                    "start": str(prev_utc),
                    "end": str(curr_utc),
                    "duration_hours": time_diff.total_seconds() / 3600,
                    "location": [prev_lat, prev_lon]
                })

            # 2. MiroFish Logic: Patrones de Pesca
            if curr_speed is not None and curr_speed < 2.0:
                dist = ((curr_lat - prev_lat)**2 + (curr_lon - prev_lon)**2)**0.5
                if dist < 0.01:
                    fishing_indicators += 1

            # 3. NASA Integration: Correlación Ambiental
            if self.env_service:
                ctx = self.env_service.get_context(curr_lat, curr_lon, curr_utc)
                # Riesgo: Baja velocidad + Alta Clorofila = Pesca Probable
                if curr_speed is not None and curr_speed < 2.0 and ctx["chlorophyll_mg_m3"] > 1.0:
                    environmental_risk_points += 1

        if len(shadow_gaps) > 0 or fishing_indicators > 5 or environmental_risk_points > 2:
            is_suspicious = True

        return {
            "mmsi": mmsi,
            "is_suspicious": is_suspicious,
            "behavioral_score": {
                "shadow_gaps_count": len(shadow_gaps),
                "fishing_pattern_score": fishing_indicators,
                "environmental_risk_score": environmental_risk_points,
                "risk_level": "HIGH" if (len(shadow_gaps) > 0 and environmental_risk_points > 2) else "MEDIUM" if is_suspicious else "LOW"
            },
            "shadow_gaps": shadow_gaps,
            "analysis": "High probability of IUU Fishing based on behavioral and environmental markers" if is_suspicious else "Normal navigation pattern"
        }
