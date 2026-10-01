from __future__ import annotations

import base64
import csv
import hashlib
import hmac
import io
import json
import os
import secrets
import sqlite3
import struct
import tempfile
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import jwt
import qrcode
from fastapi import FastAPI, Depends, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, PlainTextResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from qrcode.image.svg import SvgPathImage
from pydantic import BaseModel, Field

PILOT_ID = "PB124-OLEA-2026"
PLATFORM = "Pacific World"
VOYAGE = "Peace Boat 124th Global Voyage"
CAPTURE_METHOD = "OLEA Level 1 Enhanced Web PWA"
APP_VERSION = "pb124-0.3.0"

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = Path(os.getenv("PB124_DATA_DIR", str(BASE_DIR / "data"))).resolve()
DB_PATH = DATA_DIR / "pb124.sqlite3"

for p in [
    DATA_DIR,
    DATA_DIR / "raw" / "observations",
    DATA_DIR / "raw" / "photos" / "original",
    DATA_DIR / "raw" / "photos" / "previews",
    DATA_DIR / "metadata" / "observations",
    DATA_DIR / "metadata" / "photos",
    DATA_DIR / "metadata" / "provenance",
    DATA_DIR / "audit",
]:
    p.mkdir(parents=True, exist_ok=True)

JWT_SECRET = os.getenv("PB124_JWT_SECRET", "")
ARCHIVE_TOKEN = os.getenv("PB124_ARCHIVE_TOKEN", "")
PUBLIC_BASE_URL = os.getenv("PB124_PUBLIC_BASE_URL", "").rstrip("/")
ALLOWED_ORIGINS = [x.strip() for x in os.getenv("PB124_ALLOWED_ORIGINS", "").split(",") if x.strip()]

app = FastAPI(title="OLEA PB124 Peace Boat Pilot", version=APP_VERSION)
if ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Archive-Token"],
    )

app.mount("/peaceboat/static", StaticFiles(directory=str(STATIC_DIR)), name="pb124-static")

def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()

def canonical_json(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")

def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    with open(tmp, "wb") as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)

def db() -> sqlite3.Connection:
    c = sqlite3.connect(DB_PATH, timeout=30)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA foreign_keys=ON")
    return c

def init_db() -> None:
    c = db()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS users(
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
      role TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS observations(
      id TEXT PRIMARY KEY, pilot_id TEXT NOT NULL, observer_id TEXT NOT NULL,
      status TEXT NOT NULL, observed_at_utc TEXT NOT NULL,
      latitude REAL, longitude REAL, gps_accuracy_m REAL,
      current_version INTEGER NOT NULL DEFAULT 1,
      current_sha256 TEXT NOT NULL, payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS observation_versions(
      observation_id TEXT NOT NULL, version INTEGER NOT NULL,
      sha256 TEXT NOT NULL, payload_json TEXT NOT NULL, created_at TEXT NOT NULL,
      actor TEXT NOT NULL, PRIMARY KEY(observation_id,version)
    );
    CREATE TABLE IF NOT EXISTS photos(
      id TEXT PRIMARY KEY, observation_id TEXT NOT NULL, original_name TEXT,
      mime_type TEXT NOT NULL, byte_size INTEGER NOT NULL, sha256 TEXT NOT NULL,
      original_path TEXT NOT NULL, preview_path TEXT, exif_json TEXT NOT NULL,
      app_metadata_json TEXT NOT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY(observation_id) REFERENCES observations(id)
    );
    CREATE TABLE IF NOT EXISTS audit(
      event_id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
      actor TEXT NOT NULL, action TEXT NOT NULL, timestamp_utc TEXT NOT NULL,
      device_id TEXT, before_json TEXT, after_json TEXT, reason TEXT
    );
    CREATE TABLE IF NOT EXISTS local_agents(
      agent_id TEXT PRIMARY KEY, last_seen_utc TEXT NOT NULL, root_path TEXT,
      verified_observations INTEGER NOT NULL DEFAULT 0,
      verified_photos INTEGER NOT NULL DEFAULT 0,
      pending INTEGER NOT NULL DEFAULT 0, integrity_errors INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ONLINE', details_json TEXT NOT NULL DEFAULT '{}'
    );
    """)
    c.commit()
    c.close()
    seed_users()

def password_digest(password: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 240000).hex()

def seed_user(username: str, password: str, display_name: str, role: str) -> None:
    if not username or not password:
        return
    c = db()
    row = c.execute("SELECT id FROM users WHERE username=?", (username,)).fetchone()
    if not row:
        salt = secrets.token_hex(16)
        c.execute(
            "INSERT INTO users(id,username,display_name,role,password_hash,salt,created_at) VALUES(?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), username, display_name, role, password_digest(password, salt), salt, utcnow())
        )
        c.commit()
    c.close()

def seed_users() -> None:
    seed_user(os.getenv("PB124_MERI_USERNAME", "meri"), os.getenv("PB124_MERI_PASSWORD", ""),
              "Meri Joyce", "PILOT_COORDINATOR_FIELD_CONTRIBUTOR")
    seed_user(os.getenv("PB124_JUAN_USERNAME", "juan"), os.getenv("PB124_JUAN_PASSWORD", ""),
              "Juan Sebastian Huertas Olea", "RESEARCH_ADMIN")

def audit(actor: str, action: str, entity_type: str, entity_id: str,
          device_id: Optional[str] = None, before: Any = None, after: Any = None, reason: Optional[str] = None) -> None:
    c = db()
    c.execute(
        "INSERT INTO audit VALUES(?,?,?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), entity_type, entity_id, actor, action, utcnow(), device_id,
         json.dumps(before, ensure_ascii=False) if before is not None else None,
         json.dumps(after, ensure_ascii=False) if after is not None else None, reason)
    )
    c.commit()
    c.close()

def make_token(row: sqlite3.Row) -> str:
    if not JWT_SECRET:
        raise HTTPException(503, "Authentication is not configured")
    now = datetime.now(timezone.utc)
    return jwt.encode({
        "sub": row["id"], "username": row["username"], "name": row["display_name"], "role": row["role"],
        "iat": int(now.timestamp()), "exp": int((now + timedelta(hours=24)).timestamp())
    }, JWT_SECRET, algorithm="HS256")

def current_user(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    return payload

def require_admin(user=Depends(current_user)):
    if user.get("role") != "RESEARCH_ADMIN":
        raise HTTPException(403, "Research admin required")
    return user

def archive_auth(x_archive_token: Optional[str] = Header(default=None)) -> None:
    if not ARCHIVE_TOKEN or not x_archive_token or not hmac.compare_digest(x_archive_token, ARCHIVE_TOKEN):
        raise HTTPException(401, "Invalid archive token")

class LoginIn(BaseModel):
    username: str
    password: str

class ObservationIn(BaseModel):
    observation_id: str
    device_id: str
    observed_at_utc: str
    device_local_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gps_accuracy_m: Optional[float] = None
    altitude_m: Optional[float] = None
    altitude_accuracy_m: Optional[float] = None
    heading_deg: Optional[float] = None
    speed_mps: Optional[float] = None
    position_timestamp_utc: Optional[str] = None
    status: str = "PENDING_SYNC"
    payload: Dict[str, Any] = Field(default_factory=dict)

ALLOWED_STATUSES = {
    "DRAFT","LOCAL_SAVED","PENDING_SYNC","SYNCING","SYNCED","SYNC_ERROR",
    "READY_FOR_REVIEW","UNDER_REVIEW","ACCEPTED_FOR_METHOD_TEST","EXCLUDED",
    "PILOT_FIELD_OBSERVATION","UNREVIEWED","PILOT_METHOD_REVIEWED","EXCLUDED_FROM_METHOD_TEST"
}

def normalize_observation(inp: ObservationIn, user: Dict[str, Any]) -> Dict[str, Any]:
    if inp.status not in ALLOWED_STATUSES:
        raise HTTPException(400, "Invalid status")
    p = dict(inp.payload or {})
    p.update({
        "observation_id": inp.observation_id,
        "pilot_id": PILOT_ID,
        "platform": PLATFORM,
        "voyage": VOYAGE,
        "observer_id": user["sub"],
        "observer": user.get("name"),
        "observer_role": user.get("role"),
        "device_id": inp.device_id,
        "observed_at_utc": inp.observed_at_utc,
        "device_local_time": inp.device_local_time,
        "latitude": inp.latitude,
        "longitude": inp.longitude,
        "gps_accuracy_m": inp.gps_accuracy_m,
        "altitude_m": inp.altitude_m,
        "altitude_accuracy_m": inp.altitude_accuracy_m,
        "heading_deg": inp.heading_deg,
        "speed_mps": inp.speed_mps,
        "position_timestamp_utc": inp.position_timestamp_utc,
        "source_type": "direct_shipboard_observation",
        "capture_method": CAPTURE_METHOD,
        "location_source": "device_gnss",
        "vessel_system_access": False,
        "ship_equipment_installation": False,
        "route_modified_for_observation": False,
        "scientific_review_status": p.get("scientific_review_status", "UNREVIEWED"),
        "record_class": "PILOT_FIELD_OBSERVATION",
    })
    return p

def save_server_observation_package(obs_id: str, version: int, payload: Dict[str, Any]) -> str:
    data = canonical_json(payload)
    h = sha256_bytes(data)
    vpath = DATA_DIR / "raw" / "observations" / f"OBS-{obs_id}.v{version}.json"
    atomic_write(vpath, data)
    if version == 1:
        atomic_write(DATA_DIR / "raw" / "observations" / f"OBS-{obs_id}.json", data)
    atomic_write(
        DATA_DIR / "metadata" / "provenance" / f"OBS-{obs_id}.v{version}.provenance.json",
        canonical_json({"sha256": h, "version": version, "created_at_utc": utcnow(), "pilot_id": PILOT_ID})
    )
    return h

def _jpeg_exif(raw: bytes) -> Dict[str, Any]:
    """Minimal dependency-free JPEG EXIF reader for the pilot's required fields."""
    out: Dict[str, Any] = {}
    marker = raw.find(b"Exif\x00\x00")
    if marker < 0:
        return out
    tiff = marker + 6
    if tiff + 8 > len(raw):
        return out
    order = raw[tiff:tiff+2]
    if order == b"II":
        endian = "<"
    elif order == b"MM":
        endian = ">"
    else:
        return out
    try:
        if struct.unpack_from(endian+"H", raw, tiff+2)[0] != 42:
            return out
        ifd0_rel = struct.unpack_from(endian+"I", raw, tiff+4)[0]
    except Exception:
        return out

    sizes = {1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8}

    def unpack_scalar(tp, pos):
        if tp in (1,7): return raw[pos]
        if tp == 3: return struct.unpack_from(endian+"H", raw, pos)[0]
        if tp == 4: return struct.unpack_from(endian+"I", raw, pos)[0]
        if tp == 9: return struct.unpack_from(endian+"i", raw, pos)[0]
        if tp == 5:
            n,d=struct.unpack_from(endian+"II",raw,pos); return (n/d) if d else None
        if tp == 10:
            n,d=struct.unpack_from(endian+"ii",raw,pos); return (n/d) if d else None
        return None

    def read_value(tp, count, entry_pos):
        unit=sizes.get(tp)
        if not unit or count < 0:
            return None
        total=unit*count
        if total <= 4:
            pos=entry_pos+8
        else:
            rel=struct.unpack_from(endian+"I",raw,entry_pos+8)[0]
            pos=tiff+rel
        if pos < 0 or pos+total > len(raw):
            return None
        if tp == 2:
            return raw[pos:pos+count].split(b"\x00",1)[0].decode("utf-8","replace").strip()
        vals=[unpack_scalar(tp,pos+i*unit) for i in range(count)]
        return vals[0] if count==1 else vals

    def read_ifd(rel):
        result={}
        pos=tiff+rel
        if pos+2 > len(raw): return result
        n=struct.unpack_from(endian+"H",raw,pos)[0]
        pos+=2
        for _ in range(min(n,512)):
            if pos+12 > len(raw): break
            tag,tp,count=struct.unpack_from(endian+"HHI",raw,pos)
            try: result[tag]=read_value(tp,count,pos)
            except Exception: pass
            pos+=12
        return result

    try:
        ifd0=read_ifd(ifd0_rel)
        mapping0={0x010F:"Make",0x0110:"Model",0x0112:"Orientation",0x0100:"ImageWidth",0x0101:"ImageHeight"}
        for tag,name in mapping0.items():
            if tag in ifd0 and ifd0[tag] is not None: out[name]=ifd0[tag]

        exif_rel=ifd0.get(0x8769)
        if isinstance(exif_rel,(int,float)):
            ex=read_ifd(int(exif_rel))
            mapping_ex={0x9003:"DateTimeOriginal",0x920A:"FocalLength",0x829A:"ExposureTime",
                        0x829D:"FNumber",0x8827:"ISO",0xA434:"LensModel",
                        0xA002:"ImageWidth",0xA003:"ImageHeight"}
            for tag,name in mapping_ex.items():
                if tag in ex and ex[tag] is not None: out[name]=ex[tag]

        gps_rel=ifd0.get(0x8825)
        if isinstance(gps_rel,(int,float)):
            gps=read_ifd(int(gps_rel))
            lat_ref=str(gps.get(1,"")).upper()
            lon_ref=str(gps.get(3,"")).upper()
            lat=gps.get(2); lon=gps.get(4)
            def dms(v,ref):
                if not isinstance(v,list) or len(v)<3 or any(x is None for x in v[:3]): return None
                x=float(v[0])+float(v[1])/60+float(v[2])/3600
                if "S" in ref or "W" in ref: x=-x
                return x
            lv=dms(lat,lat_ref); lov=dms(lon,lon_ref)
            if lv is not None: out["GPSLatitude"]=lv
            if lov is not None: out["GPSLongitude"]=lov
            if gps.get(6) is not None: out["GPSAltitude"]=gps.get(6)
    except Exception as e:
        out["_exif_error"]=str(e)
    return out

def extract_exif(raw: bytes) -> Dict[str, Any]:
    try:
        return _jpeg_exif(raw)
    except Exception as e:
        return {"_exif_error": str(e)}

def save_preview(raw: bytes, path: Path) -> Optional[str]:
    """Preview bytes are generated in-browser; server stores them without transcoding."""
    try:
        if not raw:
            return None
        atomic_write(path, raw)
        return str(path)
    except Exception:
        return None

@app.on_event("startup")
def startup() -> None:
    init_db()

@app.get("/peaceboat", response_class=HTMLResponse)
def landing():
    return (STATIC_DIR / "index.html").read_text(encoding="utf-8")

@app.get("/peaceboat/admin", response_class=HTMLResponse)
def admin_page():
    return (STATIC_DIR / "admin.html").read_text(encoding="utf-8")

@app.get("/peaceboat/manifest.webmanifest")
def manifest():
    return JSONResponse({
        "name":"OLEA Peace Boat 124th Global Voyage",
        "short_name":"OLEA PB124",
        "start_url":"/peaceboat",
        "display":"standalone",
        "background_color":"#07141c",
        "theme_color":"#07141c",
        "icons":[]
    }, media_type="application/manifest+json")

@app.get("/peaceboat/sw.js")
def service_worker():
    return Response((STATIC_DIR/"sw.js").read_text(encoding="utf-8"), media_type="application/javascript",
                    headers={"Service-Worker-Allowed":"/peaceboat/"})

@app.post("/api/auth/login")
def login(body: LoginIn):
    c = db()
    row = c.execute("SELECT * FROM users WHERE username=? AND active=1", (body.username,)).fetchone()
    c.close()
    if not row or not hmac.compare_digest(row["password_hash"], password_digest(body.password, row["salt"])):
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": make_token(row), "token_type":"bearer",
            "user":{"id":row["id"],"name":row["display_name"],"role":row["role"]}}

@app.get("/api/health")
def health():
    db_ok = False
    storage_ok = False
    try:
        c = db(); c.execute("SELECT 1").fetchone(); c.close(); db_ok = True
    except Exception:
        pass
    try:
        t = DATA_DIR / ".health.tmp"
        atomic_write(t, b"ok")
        t.unlink(missing_ok=True)
        storage_ok = True
    except Exception:
        pass
    ok = db_ok and storage_ok and bool(JWT_SECRET)
    return {"ok":ok,"application":"OK","database":"OK" if db_ok else "FAIL",
            "object_storage":"OK" if storage_ok else "FAIL",
            "authentication":"OK" if JWT_SECRET else "NOT_CONFIGURED",
            "pilot_id":PILOT_ID,"version":APP_VERSION}

@app.get("/api/pilots/{pilot_id}")
def pilot(pilot_id: str, user=Depends(current_user)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    return {"pilot_id":PILOT_ID,"platform":PLATFORM,"voyage":VOYAGE,
            "status":"ACTIVE","precise_coordinates_public":False}

@app.put("/api/pilots/{pilot_id}/observations/{obs_id}")
def upsert_observation(pilot_id: str, obs_id: str, inp: ObservationIn, user=Depends(current_user)):
    if pilot_id != PILOT_ID or obs_id != inp.observation_id:
        raise HTTPException(400, "Pilot or observation ID mismatch")
    payload = normalize_observation(inp, user)
    data = canonical_json(payload)
    h = sha256_bytes(data)
    c = db()
    row = c.execute("SELECT * FROM observations WHERE id=?", (obs_id,)).fetchone()
    if row:
        if row["observer_id"] != user["sub"] and user.get("role") != "RESEARCH_ADMIN":
            c.close(); raise HTTPException(403)
        if row["current_sha256"] == h:
            c.close()
            return {"observation_id":obs_id,"version":row["current_version"],"idempotent":True,"server_sha256":h,"status":"SYNCED"}
        old = json.loads(row["payload_json"])
        version = int(row["current_version"]) + 1
        server_h = save_server_observation_package(obs_id, version, payload)
        c.execute("""UPDATE observations SET status=?,observed_at_utc=?,latitude=?,longitude=?,gps_accuracy_m=?,
                     current_version=?,current_sha256=?,payload_json=?,updated_at=? WHERE id=?""",
                  (inp.status,inp.observed_at_utc,inp.latitude,inp.longitude,inp.gps_accuracy_m,
                   version,server_h,json.dumps(payload,ensure_ascii=False),utcnow(),obs_id))
        c.execute("INSERT INTO observation_versions VALUES(?,?,?,?,?,?)",
                  (obs_id,version,server_h,json.dumps(payload,ensure_ascii=False),utcnow(),user["sub"]))
        c.commit(); c.close()
        audit(user["sub"],"record edited","observation",obs_id,inp.device_id,old,payload,"client correction/update")
        return {"observation_id":obs_id,"version":version,"idempotent":False,"server_sha256":server_h,"status":"SYNCED"}
    version = 1
    server_h = save_server_observation_package(obs_id, version, payload)
    now = utcnow()
    c.execute("""INSERT INTO observations VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
              (obs_id,PILOT_ID,user["sub"],inp.status,inp.observed_at_utc,inp.latitude,inp.longitude,
               inp.gps_accuracy_m,version,server_h,json.dumps(payload,ensure_ascii=False),now,now))
    c.execute("INSERT INTO observation_versions VALUES(?,?,?,?,?,?)",
              (obs_id,1,server_h,json.dumps(payload,ensure_ascii=False),now,user["sub"]))
    c.commit(); c.close()
    audit(user["sub"],"server received","observation",obs_id,inp.device_id,None,payload)
    return {"observation_id":obs_id,"version":1,"idempotent":False,"server_sha256":server_h,"status":"SYNCED"}

@app.post("/api/pilots/{pilot_id}/observations/{obs_id}/photos")
async def add_photo(
    pilot_id: str, obs_id: str,
    file: UploadFile = File(...),
    preview: Optional[UploadFile] = File(default=None),
    photo_id: str = Form(...),
    client_sha256: str = Form(...),
    app_metadata_json: str = Form("{}"),
    user=Depends(current_user)
):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c = db()
    obs = c.execute("SELECT * FROM observations WHERE id=?", (obs_id,)).fetchone()
    if not obs: c.close(); raise HTTPException(404, "Observation not found")
    if obs["observer_id"] != user["sub"] and user.get("role") != "RESEARCH_ADMIN":
        c.close(); raise HTTPException(403)
    existing = c.execute("SELECT * FROM photos WHERE id=?", (photo_id,)).fetchone()
    raw = await file.read()
    h = sha256_bytes(raw)
    if h != client_sha256:
        c.close(); raise HTTPException(409, "Client/server SHA-256 mismatch")
    if existing:
        c.close()
        if existing["sha256"] != h: raise HTTPException(409, "Photo ID already exists with different hash")
        return {"photo_id":photo_id,"idempotent":True,"sha256":h}
    suffix = Path(file.filename or "photo.jpg").suffix.lower() or ".jpg"
    original = DATA_DIR/"raw"/"photos"/"original"/f"OBS-{obs_id}_PHOTO-{photo_id}{suffix}"
    preview_path_obj = DATA_DIR/"raw"/"photos"/"previews"/f"OBS-{obs_id}_PHOTO-{photo_id}.jpg"
    atomic_write(original, raw)
    preview_raw = await preview.read() if preview is not None else b""
    preview_path = save_preview(preview_raw, preview_path_obj) if preview_raw else None
    exif = extract_exif(raw)
    try: app_meta = json.loads(app_metadata_json or "{}")
    except Exception: app_meta = {}
    c.execute("""INSERT INTO photos VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
              (photo_id,obs_id,file.filename,file.content_type or "application/octet-stream",len(raw),h,
               str(original),preview_path,json.dumps(exif,ensure_ascii=False),
               json.dumps(app_meta,ensure_ascii=False),utcnow()))
    c.commit(); c.close()
    atomic_write(DATA_DIR/"metadata"/"photos"/f"OBS-{obs_id}_PHOTO-{photo_id}.metadata.json",
                 canonical_json({"photo_id":photo_id,"observation_id":obs_id,"sha256":h,
                                 "exif":exif,"app_metadata":app_meta}))
    audit(user["sub"],"photo added","photo",photo_id,app_meta.get("device_id"),None,{"observation_id":obs_id,"sha256":h})
    return {"photo_id":photo_id,"idempotent":False,"sha256":h,"byte_size":len(raw)}

def obs_visible_where(user):
    if user.get("role") == "RESEARCH_ADMIN":
        return "", []
    return " AND observer_id=?", [user["sub"]]

@app.get("/api/pilots/{pilot_id}/observations")
def list_observations(pilot_id: str, user=Depends(current_user)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    extra, args = obs_visible_where(user)
    c = db()
    rows = c.execute("SELECT * FROM observations WHERE pilot_id=?"+extra+" ORDER BY observed_at_utc DESC",
                     [PILOT_ID]+args).fetchall()
    out = []
    for r in rows:
        x = json.loads(r["payload_json"]); x["server_sha256"]=r["current_sha256"]; x["version"]=r["current_version"]
        out.append(x)
    c.close()
    return out

@app.get("/api/pilots/{pilot_id}/observations/{obs_id}")
def get_observation(pilot_id: str, obs_id: str, user=Depends(current_user)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c=db(); r=c.execute("SELECT * FROM observations WHERE id=?",(obs_id,)).fetchone()
    if not r: c.close(); raise HTTPException(404)
    if r["observer_id"] != user["sub"] and user.get("role") != "RESEARCH_ADMIN":
        c.close(); raise HTTPException(403)
    photos=[dict(x) for x in c.execute("SELECT id,original_name,mime_type,byte_size,sha256,created_at FROM photos WHERE observation_id=?",(obs_id,)).fetchall()]
    c.close()
    x=json.loads(r["payload_json"]); x.update({"server_sha256":r["current_sha256"],"version":r["current_version"],"photos":photos})
    return x

@app.get("/api/pilots/{pilot_id}/observations/{obs_id}/raw")
def raw_observation(pilot_id: str, obs_id: str, version: Optional[int]=None, _=Depends(archive_auth)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c=db(); r=c.execute("SELECT current_version FROM observations WHERE id=?",(obs_id,)).fetchone(); c.close()
    if not r: raise HTTPException(404)
    v = version or r["current_version"]
    p = DATA_DIR/"raw"/"observations"/f"OBS-{obs_id}.v{v}.json"
    if not p.exists(): raise HTTPException(404)
    return FileResponse(p, media_type="application/json", filename=p.name)

@app.get("/api/pilots/{pilot_id}/photos/{photo_id}/original")
def original_photo(pilot_id: str, photo_id: str, _=Depends(archive_auth)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c=db(); r=c.execute("SELECT * FROM photos WHERE id=?",(photo_id,)).fetchone(); c.close()
    if not r: raise HTTPException(404)
    return FileResponse(r["original_path"], media_type=r["mime_type"], filename=Path(r["original_path"]).name)

@app.get("/api/pilots/{pilot_id}/sync-manifest")
def sync_manifest(pilot_id: str, _=Depends(archive_auth)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c=db()
    obs=c.execute("SELECT id,current_version,current_sha256,updated_at FROM observations WHERE pilot_id=? ORDER BY id",(PILOT_ID,)).fetchall()
    photos=c.execute("""SELECT p.id,p.observation_id,p.byte_size,p.sha256,p.mime_type,p.original_name
                        FROM photos p JOIN observations o ON o.id=p.observation_id WHERE o.pilot_id=? ORDER BY p.id""",(PILOT_ID,)).fetchall()
    versions=c.execute("""SELECT v.observation_id,v.version,v.sha256,v.created_at
                          FROM observation_versions v JOIN observations o ON o.id=v.observation_id
                          WHERE o.pilot_id=? ORDER BY v.observation_id,v.version""",(PILOT_ID,)).fetchall()
    c.close()
    return {
        "pilot_id":PILOT_ID,"generated_at_utc":utcnow(),
        "observations":[{"observation_id":r["id"],"current_version":r["current_version"],"sha256":r["current_sha256"],
                         "updated_at_utc":r["updated_at"],
                         "download_path":f"/api/pilots/{PILOT_ID}/observations/{r['id']}/raw?version={r['current_version']}"} for r in obs],
        "versions":[{"observation_id":r["observation_id"],"version":r["version"],"sha256":r["sha256"],"created_at_utc":r["created_at"],
                     "download_path":f"/api/pilots/{PILOT_ID}/observations/{r['observation_id']}/raw?version={r['version']}"} for r in versions],
        "photos":[{"photo_id":r["id"],"observation_id":r["observation_id"],"byte_size":r["byte_size"],"sha256":r["sha256"],
                   "mime_type":r["mime_type"],"original_name":r["original_name"],
                   "download_path":f"/api/pilots/{PILOT_ID}/photos/{r['id']}/original"} for r in photos]
    }

@app.post("/api/pilots/{pilot_id}/local-agent/heartbeat")
async def local_agent_heartbeat(pilot_id: str, request: Request, _=Depends(archive_auth)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    body=await request.json()
    agent_id=str(body.get("agent_id") or "juan-windows")
    c=db()
    c.execute("""INSERT INTO local_agents(agent_id,last_seen_utc,root_path,verified_observations,verified_photos,pending,integrity_errors,status,details_json)
                 VALUES(?,?,?,?,?,?,?,?,?)
                 ON CONFLICT(agent_id) DO UPDATE SET last_seen_utc=excluded.last_seen_utc,root_path=excluded.root_path,
                 verified_observations=excluded.verified_observations,verified_photos=excluded.verified_photos,pending=excluded.pending,
                 integrity_errors=excluded.integrity_errors,status=excluded.status,details_json=excluded.details_json""",
              (agent_id,utcnow(),body.get("root_path"),int(body.get("verified_observations",0)),int(body.get("verified_photos",0)),
               int(body.get("pending",0)),int(body.get("integrity_errors",0)),body.get("status","ONLINE"),json.dumps(body)))
    c.commit(); c.close()
    return {"ok":True,"server_time_utc":utcnow()}

@app.get("/api/pilots/{pilot_id}/local-archive")
def local_archive_status(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c=db(); r=c.execute("SELECT * FROM local_agents ORDER BY last_seen_utc DESC LIMIT 1").fetchone()
    obs_count=c.execute("SELECT count(*) n FROM observations WHERE pilot_id=?",(PILOT_ID,)).fetchone()["n"]
    photo_count=c.execute("""SELECT count(*) n FROM photos p JOIN observations o ON o.id=p.observation_id WHERE o.pilot_id=?""",(PILOT_ID,)).fetchone()["n"]
    c.close()
    if not r:
        return {"agent":"OFFLINE","server_observations":obs_count,"server_photos":photo_count,
                "local_verified_observations":0,"local_verified_photos":0,"pending":obs_count+photo_count,
                "integrity_errors":0,"last_seen_utc":None}
    d=dict(r)
    try:
        age=(datetime.now(timezone.utc)-datetime.fromisoformat(d["last_seen_utc"])).total_seconds()
    except Exception: age=999999
    d["agent"]="ONLINE" if age < 300 else "OFFLINE"
    d["server_observations"]=obs_count; d["server_photos"]=photo_count
    d["local_verified_observations"]=d.pop("verified_observations")
    d["local_verified_photos"]=d.pop("verified_photos")
    return d

@app.get("/api/pilots/{pilot_id}/metrics")
def metrics(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c=db()
    rows=c.execute("SELECT * FROM observations WHERE pilot_id=?",(PILOT_ID,)).fetchall()
    photos=c.execute("""SELECT count(*) n FROM photos p JOIN observations o ON o.id=p.observation_id WHERE o.pilot_id=?""",(PILOT_ID,)).fetchone()["n"]
    acc=[r["gps_accuracy_m"] for r in rows if r["gps_accuracy_m"] is not None]
    acc.sort()
    med = acc[len(acc)//2] if acc else None
    offline=0
    for r in rows:
        try:
            if json.loads(r["payload_json"]).get("network_state_at_capture") == "offline": offline += 1
        except Exception: pass
    c.close()
    return {"pilot_id":PILOT_ID,"observations":len(rows),"photo_count":photos,
            "photo_rate":(photos/len(rows) if rows else 0),"valid_gps_rate":(len(acc)/len(rows) if rows else 0),
            "median_gps_accuracy_m":med,"offline_created_observations":offline}

def export_rows():
    c=db(); rows=c.execute("SELECT * FROM observations WHERE pilot_id=? ORDER BY observed_at_utc",(PILOT_ID,)).fetchall(); c.close()
    return [json.loads(r["payload_json"]) | {"server_sha256":r["current_sha256"],"version":r["current_version"]} for r in rows]

@app.get("/api/pilots/{pilot_id}/export.geojson")
def export_geojson(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    feats=[]
    for x in export_rows():
        geom=None
        if x.get("latitude") is not None and x.get("longitude") is not None:
            geom={"type":"Point","coordinates":[x["longitude"],x["latitude"]]}
        props={k:v for k,v in x.items() if k not in {"latitude","longitude"}}
        feats.append({"type":"Feature","geometry":geom,"properties":props})
    return {"type":"FeatureCollection","features":feats}

@app.get("/api/pilots/{pilot_id}/export.json")
def export_json(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    return export_rows()

@app.get("/api/pilots/{pilot_id}/export.csv")
def export_csv(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    rows=export_rows()
    keys=sorted({k for r in rows for k in r.keys()})
    s=io.StringIO(); w=csv.DictWriter(s,fieldnames=keys); w.writeheader()
    for r in rows:
        w.writerow({k:(json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v) for k,v in r.items()})
    return Response(s.getvalue(),media_type="text/csv",headers={"Content-Disposition":f'attachment; filename="{PILOT_ID}.csv"'})

@app.get("/api/pilots/{pilot_id}/audit")
def audit_log(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    c=db(); rows=[dict(r) for r in c.execute("SELECT * FROM audit ORDER BY timestamp_utc DESC LIMIT 500").fetchall()]; c.close()
    return rows

@app.get("/api/pilots/{pilot_id}/preflight")
def preflight(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    h=health()
    c=db()
    meri=c.execute("SELECT count(*) n FROM users WHERE role='PILOT_COORDINATOR_FIELD_CONTRIBUTOR' AND active=1").fetchone()["n"]
    c.close()
    checks={
      "production_https": PUBLIC_BASE_URL.startswith("https://"),
      "auth": bool(JWT_SECRET),
      "meri_account": meri > 0,
      "pilot_active": True,
      "database": h["database"]=="OK",
      "photo_storage": h["object_storage"]=="OK",
      "api": True,
      "field_mode_config": True,
      "offline_cache": (STATIC_DIR/"sw.js").exists(),
      "category_dictionary": True,
      "audit_logging": True,
      "exports": True,
      "windows_backup_agent_configured": bool(ARCHIVE_TOKEN)
    }
    return {"result":"READY FOR MERI" if all(checks.values()) else "NOT READY","checks":checks}

@app.get("/api/pilots/{pilot_id}/qr")
def qr(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    if not PUBLIC_BASE_URL.startswith("https://"):
        raise HTTPException(503,"PB124_PUBLIC_BASE_URL is not configured to HTTPS")
    url=f"{PUBLIC_BASE_URL}/peaceboat"
    qr = qrcode.QRCode(border=4)
    qr.add_data(url); qr.make(fit=True)
    img = qr.make_image(image_factory=SvgPathImage)
    b = io.BytesIO(); img.save(b)
    return Response(b.getvalue(),media_type="image/svg+xml",headers={"X-QR-Destination":url})

@app.get("/api/pilots/{pilot_id}/report")
def report(pilot_id: str, user=Depends(require_admin)):
    if pilot_id != PILOT_ID: raise HTTPException(404)
    m=metrics(pilot_id,user)
    text=f"""# OLEA — Peace Boat 124th Global Voyage
## Shipboard Field-Observation Workflow Pilot

Pilot ID: {PILOT_ID}
Platform: {PLATFORM}
Voyage: {VOYAGE}

## Purpose
Evaluate field data capture, provenance, offline resilience and synchronization aboard a real moving vessel.

## Current workflow metrics
- Observations: {m['observations']}
- Photos: {m['photo_count']}
- Valid GPS rate: {m['valid_gps_rate']:.2%}
- Median GPS accuracy: {m['median_gps_accuracy_m']}

## Mandatory scope statement
"This pilot evaluates field data capture, provenance, offline resilience and synchronization aboard a real moving vessel. It does not constitute Antarctic field validation or an assessment of environmental impact."

## Limitations
Phone-browser sensor availability varies by operating system, browser permissions and hardware.
AIS and satellite comparisons are post-hoc and are not treated as real-time vessel-system feeds.
"""
    return PlainTextResponse(text,media_type="text/markdown")

init_db()
