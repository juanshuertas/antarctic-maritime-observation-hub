import duckdb
from typing import List, Dict, Any
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

    def get_encounters(self, min_duration_hours: float = 2.0, max_dist_m: float = 500.0) -> List[Dict[str, Any]]:
        """
        Detecta encuentros entre barcos (Transshipments).
        Inspirado en Global Fishing Watch.
        """
        vessels = self.db.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()
        encounters = []

        for i in range(len(vessels)):
            for j in range(i + 1, len(vessels)):
                mmsi1, name1 = vessels[i]
                mmsi2, name2 = vessels[j]

                pos1 = self.db.execute("SELECT utc, latitude, longitude FROM ais_vessels WHERE mmsi = ? ORDER BY utc", [mmsi1]).fetchall()
                pos2 = self.db.execute("SELECT utc, latitude, longitude FROM ais_vessels WHERE mmsi = ? ORDER BY utc", [mmsi2]).fetchall()

                if not pos1 or not pos2:
                    continue

                close_points = []
                p1 = 0
                p2 = 0

                while p1 < len(pos1) and p2 < len(pos2):
                    u1, lat1, lon1 = pos1[p1]
                    u2, lat2, lon2 = pos2[p2]
                    time_diff_hours = (u1 - u2).total_seconds() / 3600

                    if abs(time_diff_hours) <= 1.0:
                        dist = self._haversine_meters(lat1, lon1, lat2, lon2)
                        if dist <= max_dist_m:
                            close_points.append((u1 if u1 >= u2 else u2, dist))
                        if u1 <= u2:
                            p1 += 1
                        else:
                            p2 += 1
                    elif time_diff_hours < -1.0:
                        p1 += 1
                    else:
                        p2 += 1

                if not close_points:
                    continue

                window_start = close_points[0][0]
                window_end = close_points[0][0]
                distances = [close_points[0][1]]

                for utc, dist in close_points[1:]:
                    gap_hours = (utc - window_end).total_seconds() / 3600
                    if gap_hours <= 1.0:
                        window_end = utc
                        distances.append(dist)
                    else:
                        duration_hours = (window_end - window_start).total_seconds() / 3600
                        if duration_hours >= min_duration_hours:
                            encounters.append({
                                "vessel_a": name1,
                                "vessel_b": name2,
                                "utc": str(window_start),
                                "start_utc": str(window_start),
                                "end_utc": str(window_end),
                                "duration_hours": round(duration_hours, 2),
                                "distance_m": round(sum(distances) / len(distances), 2),
                                "avg_distance_m": round(sum(distances) / len(distances), 2),
                                "min_distance_m": round(min(distances), 2),
                                "type": "Potential Transshipment"
                            })
                        window_start = utc
                        window_end = utc
                        distances = [dist]

                duration_hours = (window_end - window_start).total_seconds() / 3600
                if duration_hours >= min_duration_hours:
                    encounters.append({
                        "vessel_a": name1,
                        "vessel_b": name2,
                        "utc": str(window_start),
                        "start_utc": str(window_start),
                        "end_utc": str(window_end),
                        "duration_hours": round(duration_hours, 2),
                        "distance_m": round(sum(distances) / len(distances), 2),
                        "avg_distance_m": round(sum(distances) / len(distances), 2),
                        "min_distance_m": round(min(distances), 2),
                        "type": "Potential Transshipment"
                    })
        return encounters

    def _haversine_meters(self, lat1, lon1, lat2, lon2) -> float:
        R = 6371000.0 # Earth radius in meters
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
        return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))
