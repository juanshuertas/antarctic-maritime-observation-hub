"""Resumen rápido de datos históricos AIS en DuckDB."""
from __future__ import annotations

from pathlib import Path
import duckdb


def analyze_ais_data() -> None:
    root = Path(__file__).resolve().parents[2]
    duckdb_path = root / "data" / "antarctic.duckdb"

    conn = duckdb.connect(str(duckdb_path))
    try:
        print("--- RESUMEN DE DATOS HISTÓRICOS AIS ---")

        total = conn.execute("SELECT count(*) FROM ais_vessels").fetchone()[0]
        print(f"\nTotal de posiciones cargadas: {total}")

        vessels = conn.execute("SELECT count(DISTINCT mmsi) FROM ais_vessels").fetchone()[0]
        print(f"Número de barcos únicos: {vessels}")

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

        time_range = conn.execute("SELECT min(utc), max(utc) FROM ais_vessels").fetchone()
        if time_range:
            print(f"\nPeriodo de datos: {time_range[0]} hasta {time_range[1]}")
    finally:
        conn.close()


if __name__ == "__main__":
    analyze_ais_data()

