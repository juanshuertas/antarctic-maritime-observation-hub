"""Importador seguro de datos históricos AIS desde CSV hacia DuckDB."""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import duckdb


def import_ais_csv(file_path: str | Path, expedition_id: str = "NGRS-ANTA-2027") -> int:
    resolved_csv = Path(file_path).expanduser().resolve()
    if not resolved_csv.is_file() or resolved_csv.suffix.lower() != ".csv":
        raise ValueError(f"Invalid or missing CSV file: {resolved_csv}")

    print(f"--- Iniciando importación de: {resolved_csv} ---")

    root = Path(__file__).resolve().parents[2]
    data_dir = root / "data"
    duckdb_path = data_dir / "antarctic.duckdb"

    data_dir.mkdir(parents=True, exist_ok=True)

    print(f"Conectando a: {duckdb_path}")
    conn = duckdb.connect(str(duckdb_path))

    try:
        conn.execute("LOAD spatial;")
    except duckdb.Error:
        pass

    conn.execute("""
        CREATE TABLE IF NOT EXISTS ais_vessels (
            id INTEGER PRIMARY KEY,
            expedition_id VARCHAR NOT NULL,
            mmsi VARCHAR,
            name VARCHAR,
            vessel_type VARCHAR DEFAULT 'Unknown',
            latitude DOUBLE,
            longitude DOUBLE,
            speed DOUBLE,
            course DOUBLE,
            heading DOUBLE,
            navstat INTEGER,
            source VARCHAR DEFAULT 'AIS',
            quality VARCHAR DEFAULT 'standard',
            utc TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    query = """
        INSERT INTO ais_vessels (id, expedition_id, mmsi, name, latitude, longitude, speed, course, heading, navstat, utc)
        SELECT
            row_number() OVER () + (SELECT coalesce(max(id), 0) FROM ais_vessels),
            ?,
            CAST(MMSI AS VARCHAR),
            CAST(NAME AS VARCHAR),
            CAST(LATITUDE AS DOUBLE),
            CAST(LONGITUDE AS DOUBLE),
            CAST(SPEED AS DOUBLE),
            CAST(COURSE AS DOUBLE),
            CAST(HEADING AS DOUBLE),
            CAST(NAVSTAT AS INTEGER),
            CAST("DATE TIME (UTC)" AS TIMESTAMP)
        FROM read_csv_auto(?);
    """

    try:
        before = conn.execute("SELECT count(*) FROM ais_vessels").fetchone()[0]
        conn.execute(query, [expedition_id, str(resolved_csv)])
        after = conn.execute("SELECT count(*) FROM ais_vessels").fetchone()[0]
        inserted = after - before
        print(f"Importación completada exitosamente ({inserted} registros añadidos).")
        return inserted
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import historical AIS CSV into DuckDB.")
    parser.add_argument(
        "--file",
        default=os.path.expanduser("~/Downloads/ais_antarctica_nov.csv"),
        help="Path to the historical AIS CSV file",
    )
    parser.add_argument(
        "--expedition-id",
        default="NGRS-ANTA-2027",
        help="Expedition identifier",
    )
    args = parser.parse_args()

    if os.path.exists(args.file):
        import_ais_csv(args.file, expedition_id=args.expedition_id)
    else:
        print(f"Error: No se encontró el archivo en {args.file}")

