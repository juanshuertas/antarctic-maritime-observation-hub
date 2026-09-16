"""Configuración del backend. Usa solo la librería estándar."""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path


def _repo_root() -> Path:
    """Raíz del monorepo (backend/app/config.py → parents[2])."""
    return Path(__file__).resolve().parents[2]


class Settings:
    """Configuración del edge node. Lee desde variables de entorno."""

    def __init__(self):
        # Identidad
        self.environment = os.getenv("ENVIRONMENT", "edge")
        self.project_name = os.getenv("PROJECT_NAME", "antarctic-maritime-observation-hub")
        self.version = os.getenv("VERSION", "0.1.0")
        self.expedition_id = os.getenv("EXPEDITION_ID", "NGRS-ANTA-2027")

        # Rutas
        self.data_dir = os.getenv("DATA_DIR") or str(_repo_root() / "data")
        self.duckdb_path = os.getenv("DUCKDB_PATH") or str(
            Path(self.data_dir) / "antarctic.duckdb"
        )
        self.media_dir = os.getenv("MEDIA_DIR") or str(
            Path(self.data_dir) / "media"
        )
        self.credentials_dir = str(_repo_root() / "credentials")
        self.models_dir = str(_repo_root() / "models")

        # Seguridad
        self.jwt_secret = os.getenv("JWT_SECRET", "change-me")
        self.anon_salt = os.getenv("ANON_SALT", "change-me")
        self.token_ttl_hours = int(os.getenv("TOKEN_TTL_HOURS", "12"))

        # Google Cloud
        self.gcs_bucket = os.getenv("GCS_BUCKET")
        self.gcs_prefix = os.getenv("GCS_PREFIX", "voyages/default")
        self.gee_project = os.getenv("GEE_PROJECT")
        self.gee_enabled = os.getenv("GEE_ENABLED", "false").lower() == "true"

        # AIS
        self.aisstream_api_key = os.getenv("AISSTREAM_API_KEY")
        self.aisstream_wss_url = os.getenv(
            "AISSTREAM_WSS_URL", "wss://stream.aisstream.io/v0/stream"
        )

        # Starlink
        self.starlink_router_ip = os.getenv("STARLINK_ROUTER_IP", "192.168.100.1")
        self.starlink_grpc_port = int(os.getenv("STARLINK_GRPC_PORT", "9200"))

        # Sensores
        self.ais_rtlsdr_enabled = os.getenv("AIS_RTLSDR_ENABLED", "false").lower() == "true"
        self.hydrophone_enabled = os.getenv("HYDROPHONE_ENABLED", "false").lower() == "true"
        self.camera_enabled = os.getenv("CAMERA_ENABLED", "false").lower() == "true"

        # Matching
        self.match_time_window_min = int(os.getenv("MATCH_TIME_WINDOW_MIN", "60"))
        self.match_space_window_km = float(os.getenv("MATCH_SPACE_WINDOW_KM", "10.0"))

        # Privacidad
        self.privacy_grid_size_m = float(os.getenv("PRIVACY_GRID_SIZE_M", "500"))
        self.privacy_k_anonymity = int(os.getenv("PRIVACY_K_ANONYMITY", "5"))
        self.media_retention_days = int(os.getenv("MEDIA_RETENTION_DAYS", "90"))


@lru_cache
def get_settings() -> Settings:
    """Devuelve la configuración cacheada."""
    return Settings()


def ensure_dir(base: str | Path, name: str) -> Path:
    """Crea y devuelve un subdirectorio dentro de `base`."""
    p = Path(base) / name
    p.mkdir(parents=True, exist_ok=True)
    return p