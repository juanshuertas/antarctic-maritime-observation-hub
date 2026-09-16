
import os
import duckdb
from pathlib import Path

def analyze_ais_data():
    root = Path(__file__).resolve().parents[2]
    duckdb_path = root / "data" / "antarctic.duckdb"

    conn = duckdb.connect(str(duckdb_path))

    print("--- RESUMEN DE DATOS HISTÓRICOS AIS ---")

    # 1. Total de registros
    total = conn.execute("SELECT count(*) FROM ais_vessels").fetchone()[0]
    print(f"\nTotal de posiciones cargadas: {total}")

    # 2. Barcos únicos
    vessels = conn.execute("SELECT count(DISTINCT mmsi) FROM ais_vessels").fetchone()[0]
    print(f"Número de barcos únicos: {vessels}")

    # 3. Top 5 barcos con más reportes
    print("\nTop 5 barcos más activos:")
    top_vessels = conn.execute("""
        SELECT name, count(*) as reports
        FROM ais_vessels
        GROUP BY name
        ORDER BY reports DESC
        LIMIT 5
    """).fetchall()
    for name, reports in top_vessels:
        print(f"- {name}: {reports} posiciones")

    # 4. Rango temporal
    time_range = conn.execute("SELECT min(utc), max(utc) FROM ais_vessels").fetchone()
    print(f"\nPeriodo de datos: {time_range[0]} hasta {time_range[1]}")

    conn.close()

if __name__ == "__main__":
    analyze_ais_data()
