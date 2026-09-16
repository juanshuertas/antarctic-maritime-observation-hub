
import duckdb
from typing import List, Dict, Any
from datetime import timedelta

class BehavioralAnalysisService:
    def __init__(self, db_conn: duckdb.DuckDBPyConnection):
        self.db = db_conn

    def analyze_behavior(self, mmsi: str) -> Dict[str, Any]:
        # Obtener datos ordenados
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
        is_suspicious = False

        for i in range(1, len(data)):
            prev_utc, prev_lat, prev_lon, prev_speed = data[i-1]
            curr_utc, curr_lat, curr_lon, curr_speed = data[i]

            # 1. ShadowBroker Logic: Detección de Gaps (Tramos oscuros)
            time_diff = curr_utc - prev_utc
            if time_diff > timedelta(hours=4): # Gap mayor a 4 horas es sospechoso en Antártida
                shadow_gaps.append({
                    "start": str(prev_utc),
                    "end": str(curr_utc),
                    "duration_hours": time_diff.total_seconds() / 3600,
                    "location": [prev_lat, prev_lon]
                })

            # 2. MiroFish Logic: Detección de Patrones de Pesca
            # Patrón: Velocidad muy baja (< 2 kn) + Cambio de rumbo frecuente (implícito en la densidad de puntos)
            # Si el barco se mueve muy lento pero sigue enviando señales en un área pequeña
            if curr_speed is not None and curr_speed < 2.0:
                # Calculamos la distancia entre puntos para ver si está "merodeando"
                # Usamos una aproximación simple de distancia
                dist = ((curr_lat - prev_lat)**2 + (curr_lon - prev_lon)**2)**0.5
                if dist < 0.01: # Se mueve muy poco pero sigue activo
                    fishing_indicators += 1

        # Umbral de sospecha: Muchos puntos de pesca o al menos un gap oscuro
        if len(shadow_gaps) > 0 or fishing_indicators > 5:
            is_suspicious = True

        return {
            "mmsi": mmsi,
            "is_suspicious": is_suspicious,
            "behavioral_score": {
                "shadow_gaps_count": len(shadow_gaps),
                "fishing_pattern_score": fishing_indicators,
                "risk_level": "HIGH" if (len(shadow_gaps) > 0 and fishing_indicators > 5) else "MEDIUM" if is_suspicious else "LOW"
            },
            "shadow_gaps": shadow_gaps,
            "analysis": "Possible IUU Fishing activity detected" if is_suspicious else "Normal navigation pattern"
        }
