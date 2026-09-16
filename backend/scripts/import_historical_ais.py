
import os
import duckdb
from pathlib import Path

def import_ais_csv(file_path: str):
    print(f"--- Iniciando importación de: {file_path} ---")

    root = Path(__file__).resolve().parents[2]
    data_dir = root / "data"
    duckdb_path = data_dir / "antarctic.duckdb"
    expedition_id = "NGRS-ANTA-2027"

    data_dir.mkdir(parents=True, exist_ok=True)

    print(f"Conectando a: {duckdb_path}")
    conn = duckdb.connect(str(duckdb_path))

    try:
        conn.execute("INSTALL spatial; LOAD spatial;")
    except:
        pass

    conn.execute("""
        CREATE TABLE IF NOT EXISTS ais_vessels (
            id INTEGER PRIMARY KEY,
            expedition_id VARCHAR NOT NULL,
            mmsi VARCHAR,
            name VARCHAR,
            latitude DOUBLE,
            longitude DOUBLE,
            speed DOUBLE,
            course DOUBLE,
            heading DOUBLE,
            navstat INTEGER,
            utc TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Usamos row_number() para generar IDs únicos basándonos en el orden del CSV
    query = f"""
        INSERT INTO ais_vessels (id, expedition_id, mmsi, name, latitude, longitude, speed, course, heading, navstat, utc)
        SELECT
            row_number() OVER () + (SELECT coalesce(max(id), 0) FROM ais_vessels),
            '{expedition_id}',
            MMSI,
            NAME,
            LATITUDE,
            LONGITUDE,
            SPEED,
            COURSE,
            HEADING,
            NAVSTAT,
            CAST("DATE TIME (UTC)" AS TIMESTAMP)
        FROM read_csv_auto('{file_path}');
    """

    try:
        conn.execute(query)
        print("Importacion completada exitosamente.")
    except Exception as e:
        print(f"Error durante la importacion: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    historical_file = os.path.expanduser("~/Downloads/ais_antarctica_nov.csv")

    if os.path.exists(historical_file):
        import_ais_csv(historical_file)
    else:
        print(f"Error: No se encontro el archivo en {historical_file}")
