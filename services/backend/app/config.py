"""Configuración del backend con resolución segura de secretos y validación."""
from __future__ import annotations

from functools import lru_cache
import logging
import os
from pathlib import Path
import secrets

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None

logger = logging.getLogger("amoh.config")


def _repo_root() -> Path:
    """Raíz del monorepo (backend/app/config.py → parents[2])."""
    return Path(__file__).resolve().parents[2]


if load_dotenv is not None:
    _env_file = _repo_root() / ".env"
    if _env_file.is_file():
        load_dotenv(_env_file)


def _resolve_secret(env_key: str, file_path: Path) -> str:
    """Multi-tiered secret resolution: Environment -> Local secret file -> Ephemeral RNG.

    Rejects insecure placeholder literals such as 'change-me' or 'dev-secret'.
    """
    insecure_placeholders = {"change-me", "dev-secret", "dev-salt", "default", ""}
    env_val = (os.getenv(env_key) or "").strip()
    if env_val and env_val not in insecure_placeholders:
        return env_val

    if file_path.is_file():
        file_val = file_path.read_text(encoding="utf-8").strip()
        if file_val and file_val not in insecure_placeholders:
            return file_val

    logger.warning(
        "Generating ephemeral secret for %s (instance-isolated; configure via env in production).",
        env_key,
    )
    return secrets.token_hex(32)


def _safe_int(env_key: str, default: int) -> int:
    raw = os.getenv(env_key)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning("Invalid integer for %s=%r; using default %d", env_key, raw, default)
        return default


def _safe_float(env_key: str, default: float) -> float:
    raw = os.getenv(env_key)
    if raw is None or raw.strip() == "":
        return default
    try:
        return float(raw)
    except ValueError:
        logger.warning("Invalid float for %s=%r; using default %s", env_key, raw, default)
        return default


class Settings:
    """Configuración del edge node. Lee desde variables de entorno."""

    def __init__(self) -> None:
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

        # Seguridad (sin literales inseguros hardcodeados)
        creds_path = Path(self.credentials_dir)
        self.jwt_secret = _resolve_secret("JWT_SECRET", creds_path / "jwt_secret.txt")
        self.anon_salt = _resolve_secret("ANON_SALT", creds_path / "anon_salt.txt")
        self.token_ttl_hours = _safe_int("TOKEN_TTL_HOURS", 12)

        # Red y CORS (orígenes explícitos, sin wildcard *)
        raw_origins = os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000",
        )
        self.cors_allowed_origins: list[str] = [
            o.strip() for o in raw_origins.split(",") if o.strip() and o.strip() != "*"
        ]
        self.frontend_port = _safe_int("FRONTEND_PORT", 5174)
        self.offline_mode = os.getenv("AMOH_OFFLINE_MODE", "false").lower() == "true"

        # Google Cloud & Integraciones científicas
        self.gcs_bucket = os.getenv("GCS_BUCKET") or None
        self.gcs_prefix = os.getenv("GCS_PREFIX", "voyages/default")
        self.gee_project = os.getenv("GEE_PROJECT") or os.getenv("EARTH_ENGINE_PROJECT") or None
        self.gfw_api_token = os.getenv("GFW_API_TOKEN") or None
        self.pythia_url = os.getenv("VITE_PYTHIA_URL") or os.getenv("PYTHIA_URL", "http://localhost:8088")
        self.surie_webmap_id = os.getenv(
            "VITE_SURIE_WEBMAP_ID", "de8bb6821bf148649f1e7b9154592a97"
        )
        self.world_app_id = os.getenv("WORLD_APP_ID") or None

        # AIS
        self.aisstream_api_key = os.getenv("AISSTREAM_API_KEY") or os.getenv("AIS_API_KEY") or None
        self.aisstream_wss_url = os.getenv(
            "AISSTREAM_WSS_URL", "wss://stream.aisstream.io/v0/stream"
        )

        # Starlink
        self.starlink_router_ip = os.getenv("STARLINK_ROUTER_IP", "192.168.100.1")
        self.starlink_grpc_port = _safe_int("STARLINK_GRPC_PORT", 9200)

        # Sensores
        self.ais_rtlsdr_enabled = os.getenv("AIS_RTLSDR_ENABLED", "false").lower() == "true"
        self.hydrophone_enabled = os.getenv("HYDROPHONE_ENABLED", "false").lower() == "true"
        self.camera_enabled = os.getenv("CAMERA_ENABLED", "false").lower() == "true"

        # Matching
        self.match_time_window_min = _safe_int("MATCH_TIME_WINDOW_MIN", 60)
        self.match_space_window_km = _safe_float("MATCH_SPACE_WINDOW_KM", 10.0)

        # Privacidad
        self.privacy_grid_size_m = _safe_float("PRIVACY_GRID_SIZE_M", 500.0)
        self.privacy_k_anonymity = _safe_int("PRIVACY_K_ANONYMITY", 5)
        self.media_retention_days = _safe_int("MEDIA_RETENTION_DAYS", 90)


@lru_cache
def get_settings() -> Settings:
    """Devuelve la configuración cacheada."""
    return Settings()


def ensure_dir(base: str | Path, name: str) -> Path:
    """Crea y devuelve un subdirectorio seguro dentro de `base`."""
    base_resolved = Path(base).resolve()
    safe_name = Path(name).name
    if not safe_name or safe_name in {".", ".."}:
        raise ValueError("Invalid directory name")
    target = (base_resolved / safe_name).resolve()
    if not str(target).startswith(str(base_resolved) + os.sep):
        raise ValueError("Directory traversal detected")
    target.mkdir(parents=True, exist_ok=True)
    return target