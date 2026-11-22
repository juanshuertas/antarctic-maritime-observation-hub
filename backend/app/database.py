"""DuckDB con extensión spatial, índices y esquema científico completo."""
from __future__ import annotations

import logging
from pathlib import Path
import threading
import duckdb

from .config import get_settings

logger = logging.getLogger("amoh.database")

_conn: duckdb.DuckDBPyConnection | None = None
_conn_path: str | None = None
_lock = threading.Lock()
_spatial_available: bool = False


def is_spatial_available() -> bool:
    """Indica si la extensión spatial de DuckDB se cargó exitosamente."""
    return _spatial_available


def _load_spatial_extension(conn: duckdb.DuckDBPyConnection, offline_mode: bool) -> bool:
    """Intenta cargar la extensión spatial sin descargar en modo offline."""
    try:
        conn.execute("LOAD spatial;")
        return True
    except duckdb.Error:
        if offline_mode:
            logger.warning(
                "DuckDB spatial extension not pre-installed and AMOH_OFFLINE_MODE=true; continuing without spatial."
            )
            return False
        try:
            conn.execute("INSTALL spatial; LOAD spatial;")
            return True
        except duckdb.Error as exc:
            logger.warning("DuckDB spatial extension unavailable (%s); continuing with standard SQL.", exc)
            return False


def get_db() -> duckdb.DuckDBPyConnection:
    """Devuelve un cursor seguro sobre la conexión singleton a DuckDB."""
    global _conn, _conn_path, _spatial_available
    s = get_settings()
    with _lock:
        if _conn is None or _conn_path != s.duckdb_path:
            if _conn is not None:
                try:
                    _conn.close()
                except duckdb.Error:
                    pass
            Path(s.data_dir).mkdir(parents=True, exist_ok=True)
            _conn = duckdb.connect(s.duckdb_path)
            _conn_path = s.duckdb_path
            _spatial_available = _load_spatial_extension(_conn, s.offline_mode)
            _init_schema(_conn)
        return _conn.cursor()


def reset_db_connection() -> None:
    """Cierra y reinicia la conexión singleton (útil para tests)."""
    global _conn, _conn_path, _spatial_available
    with _lock:
        if _conn is not None:
            try:
                _conn.close()
            except duckdb.Error:
                pass
        _conn = None
        _conn_path = None
        _spatial_available = False


def init_db() -> None:
    """Inicializa el schema (usado por preflight y tests)."""
    get_db()


def _init_schema(conn: duckdb.DuckDBPyConnection) -> None:
    """Crea las tablas base e índices si no existen."""
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
            qa_qc_status VARCHAR DEFAULT 'UNREVIEWED',
            review_state VARCHAR DEFAULT 'UNREVIEWED',
            data_state VARCHAR DEFAULT 'LOCAL',
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

    conn.execute("""
        CREATE TABLE IF NOT EXISTS expeditions (
            expedition_id VARCHAR PRIMARY KEY,
            title VARCHAR NOT NULL,
            program VARCHAR NOT NULL,
            lifecycle_state VARCHAR DEFAULT 'PROPOSAL',
            region VARCHAR DEFAULT 'Antarctic Peninsula & Southern Ocean',
            method_version VARCHAR DEFAULT 'v1.0',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS forecast_rings (
            ring_id VARCHAR PRIMARY KEY,
            horizon_code VARCHAR NOT NULL,
            confidence_score DOUBLE NOT NULL,
            prophecy_text VARCHAR NOT NULL,
            center_lat DOUBLE NOT NULL,
            center_lon DOUBLE NOT NULL,
            radius_meters DOUBLE NOT NULL,
            model_name VARCHAR DEFAULT 'Pythia-Swarm-v1',
            data_state VARCHAR DEFAULT 'SIMULATION',
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS passport_claims (
            claim_id VARCHAR PRIMARY KEY,
            nullifier_hash VARCHAR,
            investigator_did VARCHAR NOT NULL,
            observation_id VARCHAR,
            observation_type VARCHAR NOT NULL,
            utc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            latitude DOUBLE,
            longitude DOUBLE,
            review_state VARCHAR DEFAULT 'UNREVIEWED',
            reward_state VARCHAR DEFAULT 'NOT_ELIGIBLE',
            reward_wld_amount DOUBLE DEFAULT 0.0
        );
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS scientific_matchups (
            matchup_id VARCHAR PRIMARY KEY,
            observation_id VARCHAR NOT NULL,
            matched_mmsi VARCHAR,
            outcome VARCHAR NOT NULL,
            distance_km DOUBLE,
            time_diff_min DOUBLE,
            env_data_state VARCHAR DEFAULT 'SIMULATION',
            review_state VARCHAR DEFAULT 'UNREVIEWED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.execute("CREATE INDEX IF NOT EXISTS idx_ais_vessels_mmsi_utc ON ais_vessels (mmsi, utc);")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_observations_expedition_utc ON observations (expedition_id, utc);")

    # Semilla por defecto de expediciones documentadas (estado explícito PROPOSAL)
    existing_exp = conn.execute("SELECT count(*) FROM expeditions").fetchone()[0]
    if existing_exp == 0:
        conn.execute(
            """
            INSERT INTO expeditions (expedition_id, title, program, lifecycle_state, region, method_version)
            VALUES
                ('NGRS-ANTA-2027', 'NGS-Lindblad Visiting Scientist Concept', 'NGS-Lindblad 2027-2028', 'PROPOSAL', 'Antarctic Peninsula', 'v1.0'),
                ('PAC-COL-ANTA', 'Programa Antártico Colombiano Continuity Workspace', 'PAC Colombia', 'PLANNING', 'Southern Ocean & Antarctic Peninsula', 'v1.1')
            """
        )