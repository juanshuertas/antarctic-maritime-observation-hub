"""Análisis integral de rutas marítimas AIS y exportación a GeoJSON."""
from __future__ import annotations

import json
from pathlib import Path
import sys
import duckdb

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.geodesy import haversine_nm as haversine  # noqa: E402


def comprehensive_analysis() -> None:
    duckdb_path = ROOT / "data" / "antarctic.duckdb"
    output_geojson = ROOT / "data" / "vessel_routes.geojson"
    output_geojson.parent.mkdir(parents=True, exist_ok=True)

    conn = duckdb.connect(str(duckdb_path))
    try:
        vessels = conn.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()
        geojson_features = []

        print("=== ANÁLISIS INTEGRAL DE RUTAS MARÍTIMAS ===\n")

        for mmsi, name in vessels:
            print(f"Procesando: {name} ({mmsi})")
            data = conn.execute("""
                SELECT utc, latitude, longitude, speed
                FROM ais_vessels
                WHERE mmsi = ?
                ORDER BY utc ASC
            """, [mmsi]).fetchall()

            if not data:
                continue

            total_distance = 0.0
            slow_points = []
            coords = []
            prev_valid: tuple[float, float] | None = None

            for utc, lat, lon, speed in data:
                if lat is None or lon is None:
                    continue
                coords.append([lon, lat])

                if speed is not None and speed < 1.0:
                    slow_points.append(utc)

                if prev_valid is not None:
                    total_distance += haversine(prev_valid[0], prev_valid[1], lat, lon)
                prev_valid = (lat, lon)

            print(f"  - Distancia total: {total_distance:.2f} nm")
            print(f"  - Puntos de baja velocidad: {len(slow_points)}")
            if slow_points:
                print(f"    Momentos críticos: {', '.join([str(p) for p in slow_points[:3]])}...")

            if len(coords) > 1:
                geojson_features.append({
                    "type": "Feature",
                    "properties": {
                        "mmsi": mmsi,
                        "name": name,
                        "total_distance_nm": round(total_distance, 2),
                        "slow_points_count": len(slow_points),
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coords,
                    },
                })

            print("-" * 40)

        geojson_output = {
            "type": "FeatureCollection",
            "features": geojson_features,
        }

        with open(output_geojson, "w", encoding="utf-8") as f:
            json.dump(geojson_output, f, indent=2)

        print("\nAnálisis completado.")
        print(f"Archivo de rutas exportado a: {output_geojson}")
    finally:
        conn.close()


if __name__ == "__main__":
    comprehensive_analysis()

