
import os
import duckdb
import json
import math
from pathlib import Path
from datetime import datetime

def haversine(lat1, lon1, lat2, lon2):
    """Calcula la distancia entre dos puntos en millas náuticas."""
    R = 3440.065  # Radio de la Tierra en millas náuticas
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def comprehensive_analysis():
    root = Path(__file__).resolve().parents[2]
    duckdb_path = root / "data" / "antarctic.duckdb"
    output_geojson = root / "data" / "vessel_routes.geojson"

    conn = duckdb.connect(str(duckdb_path))

    # Obtener lista de barcos únicos
    vessels = conn.execute("SELECT DISTINCT mmsi, name FROM ais_vessels").fetchall()

    geojson_features = []

    print("=== ANÁLISIS INTEGRAL DE RUTAS MARÍTIMAS ===\n")

    for mmsi, name in vessels:
        print(f"Procesando: {name} ({mmsi})")

        # 1. Trazar Ruta (Obtener posiciones ordenadas por tiempo)
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

        for i in range(len(data)):
            utc, lat, lon, speed = data[i]
            coords.append([lon, lat])

            # Análisis de Velocidad: Puntos lentos (< 1 nudo)
            if speed is not None and speed < 1.0:
                slow_points.append(utc)

            # Cálculo de Distancia
            if i > 0:
                prev_lat, prev_lon = data[i-1][1], data[i-1][2]
                total_distance += haversine(prev_lat, prev_lon, lat, lon)

        # Imprimir Resultados
        print(f"  - Distancia total: {total_distance:.2f} nm")
        print(f"  - Puntos de baja velocidad: {len(slow_points)}")
        if slow_points:
            print(f"    Momentos criticos: {', '.join([str(p) for p in slow_points[:3]])}...")

        # 4. Preparar GeoJSON (LineString para la ruta)
        if len(coords) > 1:
            feature = {
                "type": "Feature",
                "properties": {
                    "mmsi": mmsi,
                    "name": name,
                    "total_distance_nm": round(total_distance, 2),
                    "slow_points_count": len(slow_points)
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": coords
                }
            }
            geojson_features.append(feature)

        print("-" * 40)

    # Exportar a GeoJSON
    geojson_output = {
        "type": "FeatureCollection",
        "features": geojson_features
    }

    with open(output_geojson, "w") as f:
        json.dump(geojson_output, f, indent=2)

    print(f"\nAnalisis completado.")
    print(f"Archivo de rutas exportado a: {output_geojson}")
    conn.close()

if __name__ == "__main__":
    comprehensive_analysis()
