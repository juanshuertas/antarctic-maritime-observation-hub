"""DuckDB con extensión spatial."""
from __future__ import annotations

from pathlib import Path
import duckdb

from .config import get_settings


_conn: duckdb.DuckDBPyConnection | None = None


def get_db() -> duckdb.DuckDBPyConnection:
    """Devuelve conexión singleton a DuckDB."""
    global _conn
    if _conn is None:
        s = get_settings()
        Path(s.data_dir).mkdir(parents=True, exist_ok=True)
        _conn = duckdb.connect(s.duckdb_path)
        try:
            _conn.execute("INSTALL spatial; LOAD spatial;")
        except Exception:
            pass
        _init_schema(_conn)
    return _conn


def init_db() -> None:
    """Inicializa el schema (usado por preflight y tests)."""
    get_db()


def _init_schema(conn: duckdb.DuckDBPyConnection) -> None:
    """Crea las tablas base si no existen."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS observations (
            observation_id VARCHAR PRIMARY KEY,
            expedition_id VARCHAR NOT NULL,
            utc TIMESTAMP NOT NULL,
            latitude DOUBLE NOT NULL,
            longitude DOUBLE NOT NULL,
            position_source VARCHAR DEFAULT 'phone_gps',
            accuracy_m DOUBLE,
            observer_type VARCHAR NOT NULL,
            observation_type VARCHAR NOT NULL,
            quality_level INTEGER DEFAULT 1,
            qa_qc_status VARCHAR DEFAULT 'raw',
            uncertainty_mixed VARCHAR,
            data_owner VARCHAR,
            sharing_permission VARCHAR DEFAULT 'private',
            media_path VARCHAR,
            notes VARCHAR,
            ai_classification VARCHAR,
            ai_confidence DOUBLE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

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

    conn.execute("""
        CREATE TABLE IF NOT EXISTS consents (
            consent_id VARCHAR PRIMARY KEY,
            user_pseudonym VARCHAR NOT NULL,
            science BOOLEAN DEFAULT FALSE,
            media BOOLEAN DEFAULT FALSE,
            anonymize BOOLEAN DEFAULT TRUE,
            granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            revoked_at TIMESTAMP
        );
    """)