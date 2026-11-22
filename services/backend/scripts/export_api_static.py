"""Export frozen GET /api/* JSON snapshots for GitHub Pages static mode.

Writes responses from the FastAPI app (via TestClient) into
``apps/web/public/api-static/<endpoint>.json`` so ``vite.pages.config.ts``
can serve offline/static API responses without a running backend.
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parents[1]
DEFAULT_OUT_DIR = REPO_ROOT / "apps" / "web" / "public" / "api-static"

API_ROUTES = [
    "/api/health",
    "/api/system/status",
    "/api/network-info",
    "/api/vessels",
    "/api/observations",
    "/api/expeditions",
    "/api/forecast-rings",
    "/api/passport/me",
    "/api/rewards",
]


def export_snapshots(out_dir: Path = DEFAULT_OUT_DIR) -> list[Path]:
    """Run FastAPI TestClient against an isolated temp DB and write JSON snapshots."""
    if str(BACKEND_ROOT) not in sys.path:
        sys.path.insert(0, str(BACKEND_ROOT))

    written: list[Path] = []
    with tempfile.TemporaryDirectory(prefix="amoh-api-static-") as tmp_dir:
        os.environ["DATA_DIR"] = tmp_dir
        os.environ.setdefault("OFFLINE_MODE", "true")

        from fastapi.testclient import TestClient
        from app.main import app

        with TestClient(app) as client:
            for route in API_ROUTES:
                rel = route.removeprefix("/api/").strip("/")
                target = out_dir / f"{rel}.json"
                target.parent.mkdir(parents=True, exist_ok=True)
                resp = client.get(route)
                if resp.status_code == 200:
                    target.write_text(
                        json.dumps(resp.json(), indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8",
                    )
                    written.append(target)
                else:
                    print(f"[warn] {route} returned HTTP {resp.status_code}", file=sys.stderr)
    return written


if __name__ == "__main__":
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT_DIR
    files = export_snapshots(out)
    print(f"Exported {len(files)} static API snapshot(s) to {out}")
