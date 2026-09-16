
import duckdb
from typing import List, Dict, Any
from pathlib import Path
import json
import math

def haversine(lat1, lon1, lat2, lon2):
    """Calcula la distancia entre dos puntos en millas náuticas."""
    R = 3440.065
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

class AISService:
    def __init__(self, db_conn: duckdb.DuckDBPyConnection):
        self.db = db_conn

    def get_summary(self) -> Dict[str, Any]:
        total = self.db.execute("SELECT count(*) FROM ais_vessels").fetchone()[0]
        vessels = self.db.execute("SELECT count(DISTINCT mmsi) FROM ais_vessels").fetchone()[0]

        top_vessels = self.db.execute("""
            SELECT name, count(*) as reports
            FROM ais_vessels
            GROUP BY name
            ORDER BY reports DESC
            LIMIT 5
        """).fetchall()

        time_range = self.db.execute("SELECT min(utc), max(utc) FROM ais_vessels").fetchone()

        return {
            "total_positions": total,
            "unique_vessels": vessels,
            "top_vessels": [{"name": n, "reports": r} for n, r in top_vessels],
            "period": {
                "start": str(time_range[0]),
                "end": str(time_range[1])
            }
        }

    def get_vessel_route(self, mmsi: str) -> Dict[str, Any]:
        data = self.db.execute("""
            SELECT utc, latitude, longitude, speed, name
            FROM ais_vessels
            WHERE mmsi = ?
            ORDER BY utc ASC
        """, [mmsi]).fetchall()

        if not data:
            return None

        name = data[0][4]
        coords = []
        total_distance = 0.0
        slow_points = 0

        for i in range(len(data)):
            utc, lat, lon, speed, _ = data[i]
            coords.append({"utc": str(utc), "lat": lat, "lon": lon, "speed": speed})

            if speed is not None and speed < 1.0:
                slow_points += 1

            if i > 0:
                prev_lat, prev_lon = data[i-1][1], data[i-1][2]
                total_distance += haversine(prev_lat, prev_lon, lat, lon)

        return {
            "name": name,
            "mmsi": mmsi,
            "total_distance_nm": round(total_distance, 2),
            "slow_points_count": slow_points,
            "trajectory": coords
        }

    def get_all_routes_geojson(self) -> Dict[str, Any]:
        vessels = self.db.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()
        features = []

        for mmsi, name in vessels:
            data = self.db.execute("""
                SELECT latitude, longitude
                FROM ais_vessels
                WHERE mmsi = ?
                ORDER BY utc ASC
            """, [mmsi]).fetchall()

            if len(data) > 1:
                coords = [[lon, lat] for lat, lon in data]
                features.append({
                    "type": "Feature",
                    "properties": {"mmsi": mmsi, "name": name},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coords
                    }
                })

        return {
            "type": "FeatureCollection",
            "features": features
        }
