from __future__ import annotations
import csv, hashlib, json, os, shutil, sys, time, uuid
from datetime import datetime, timezone
from pathlib import Path
import requests

PILOT="PB124-OLEA-2026"
API=os.environ.get("OLEA_API_BASE","").rstrip("/")
TOKEN=os.environ.get("OLEA_ARCHIVE_TOKEN","")
ROOT=Path(os.environ.get("OLEA_ARCHIVE_ROOT",r"C:\AMOH\DATA"))
INTERVAL=int(os.environ.get("OLEA_ARCHIVE_INTERVAL_SECONDS","120"))
AGENT=os.environ.get("OLEA_ARCHIVE_AGENT_ID","juan-windows")

def now(): return datetime.now(timezone.utc).isoformat()
def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()
def atomic_download(url,path,expected):
    path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists():
        got=sha(path)
        if got==expected: return "VERIFIED"
        return "HASH_MISMATCH"
    tmp=path.with_name(path.name+".tmp")
    with requests.get(url,headers={"X-Archive-Token":TOKEN},stream=True,timeout=60) as r:
        r.raise_for_status()
        with open(tmp,"wb") as f:
            for chunk in r.iter_content(1024*1024):
                if chunk: f.write(chunk)
            f.flush(); os.fsync(f.fileno())
    got=sha(tmp)
    if got!=expected:
        tmp.unlink(missing_ok=True); return "HASH_MISMATCH"
    os.replace(tmp,path); return "VERIFIED"
def append_jsonl(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    with open(path,"a",encoding="utf-8") as f: f.write(json.dumps(obj,ensure_ascii=False)+"\n")
def ensure_tree(base):
    dirs=["raw/observations","raw/photos/original","raw/photos/previews","raw/sensors","raw/exif",
          "metadata/observations","metadata/photos","metadata/devices","metadata/provenance","metadata/alerts","metadata/matchups",
          "exports/csv","exports/geojson","exports/json","exports/parquet","sync/queue","sync/completed","sync/failed",
          "audit/integrity_checks","audit/internal_audit_reports","reports/methodological","reports/maps","backups/manifests"]
    for d in dirs:(base/d).mkdir(parents=True,exist_ok=True)
    (base/"README.md").write_text("OLEA PB124 immutable local archive. Raw records are never overwritten.\n",encoding="utf-8")
    (base/"pilot.json").write_text(json.dumps({"pilot_id":PILOT,"platform":"Pacific World","voyage":"Peace Boat 124th Global Voyage"},indent=2),encoding="utf-8")
def get(path):
    r=requests.get(API+path,headers={"X-Archive-Token":TOKEN},timeout=60);r.raise_for_status();return r
def heartbeat(stats):
    try: requests.post(API+f"/api/pilots/{PILOT}/local-agent/heartbeat",headers={"X-Archive-Token":TOKEN},json=stats,timeout=20).raise_for_status()
    except Exception as e: print("Heartbeat error:",e)

def regenerate_exports(base):
    obsdir=base/"raw/observations"
    rows=[]
    for p in sorted(obsdir.glob("OBS-*.json")):
        if ".v" in p.name: continue
        try: rows.append(json.loads(p.read_text(encoding="utf-8")))
        except Exception: pass
    (base/"exports/json/latest_observations.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8")
    keys=sorted({k for r in rows for k in r.keys()})
    with open(base/"exports/csv/latest_observations.csv","w",newline="",encoding="utf-8-sig") as f:
        w=csv.DictWriter(f,fieldnames=keys);w.writeheader()
        for r in rows:w.writerow({k:(json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v) for k,v in r.items()})
    feats=[]
    for r in rows:
        lat,lon=r.get("latitude"),r.get("longitude")
        geom={"type":"Point","coordinates":[lon,lat]} if lat is not None and lon is not None else None
        props={k:v for k,v in r.items() if k not in {"latitude","longitude"}}
        feats.append({"type":"Feature","geometry":geom,"properties":props})
    (base/"exports/geojson/latest_observations.geojson").write_text(json.dumps({"type":"FeatureCollection","features":feats},ensure_ascii=False,indent=2),encoding="utf-8")

def cycle():
    if not API.startswith("https://") and os.environ.get("OLEA_ARCHIVE_ALLOW_INSECURE_LOCAL")!="1": raise RuntimeError("OLEA_API_BASE must be HTTPS in production")
    if not TOKEN: raise RuntimeError("OLEA_ARCHIVE_TOKEN missing")
    base=ROOT/PILOT;ensure_tree(base)
    m=get(f"/api/pilots/{PILOT}/sync-manifest").json()
    manifest_path=base/"backups/manifests/master_manifest.json"
    old={"files":{}}
    if manifest_path.exists():
        try: old=json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception: pass
    files=old.setdefault("files",{})
    verified_obs=set();verified_photos=set();errors=0;pending=0
    current={o["observation_id"]:o for o in m["observations"]}
    for v in m.get("versions",[]):
        oid=v["observation_id"];ver=v["version"]
        if ver==1: rel=Path("raw/observations")/f"OBS-{oid}.json"
        else: rel=Path("metadata/observations")/f"OBS-{oid}.revision-v{ver}.json"
        st=atomic_download(API+v["download_path"],base/rel,v["sha256"])
        files[f"obs:{oid}:v{ver}"]={"file_id":f"obs:{oid}:v{ver}","observation_id":oid,"relative_path":str(rel).replace("\\","/"),
          "byte_size":(base/rel).stat().st_size if (base/rel).exists() else None,"sha256":v["sha256"],"server_sha256":v["sha256"],
          "local_sha256":sha(base/rel) if (base/rel).exists() else None,"downloaded_at_utc":now(),"verification_status":st}
        if st!="VERIFIED":
            errors+=1;append_jsonl(base/"sync/failed/sync_log.jsonl",{"at":now(),"entity":f"obs:{oid}:v{ver}","status":st})
        else:
            append_jsonl(base/"audit/audit_log.jsonl",{"event_id":str(uuid.uuid4()),"entity_type":"observation","entity_id":oid,"actor":AGENT,"action":"local archive downloaded/hash verified","timestamp_utc":now(),"device_id":AGENT,"before":None,"after":{"version":ver,"sha256":v["sha256"]},"reason":None})
            meta=base/"metadata/observations"/f"OBS-{oid}.metadata.json"
            if ver==current.get(oid,{}).get("current_version"):
                meta.write_text(json.dumps({"observation_id":oid,"current_version":ver,"server_sha256":v["sha256"],"verification_status":"VERIFIED","verified_at_utc":now()},indent=2),encoding="utf-8")
                verified_obs.add(oid)
    for p in m["photos"]:
        ext=Path(p.get("original_name") or ".jpg").suffix or ".jpg";rel=Path("raw/photos/original")/f"OBS-{p['observation_id']}_PHOTO-{p['photo_id']}{ext}"
        st=atomic_download(API+p["download_path"],base/rel,p["sha256"])
        files[f"photo:{p['photo_id']}"]={"file_id":f"photo:{p['photo_id']}","observation_id":p["observation_id"],"relative_path":str(rel).replace("\\","/"),
          "byte_size":(base/rel).stat().st_size if (base/rel).exists() else None,"sha256":p["sha256"],"server_sha256":p["sha256"],
          "local_sha256":sha(base/rel) if (base/rel).exists() else None,"downloaded_at_utc":now(),"verification_status":st}
        if st=="VERIFIED":
            verified_photos.add(p["photo_id"])
            (base/"metadata/photos"/f"OBS-{p['observation_id']}_PHOTO-{p['photo_id']}.metadata.json").write_text(json.dumps({"photo_id":p["photo_id"],"observation_id":p["observation_id"],"server_sha256":p["sha256"],"local_sha256":sha(base/rel),"byte_size":p["byte_size"],"verification_status":"VERIFIED","verified_at_utc":now()},indent=2),encoding="utf-8")
            append_jsonl(base/"audit/audit_log.jsonl",{"event_id":str(uuid.uuid4()),"entity_type":"photo","entity_id":p["photo_id"],"actor":AGENT,"action":"local archive downloaded/hash verified","timestamp_utc":now(),"device_id":AGENT,"before":None,"after":{"sha256":p["sha256"]},"reason":None})
        else:
            errors+=1;append_jsonl(base/"sync/failed/sync_log.jsonl",{"at":now(),"entity":f"photo:{p['photo_id']}","status":st})
    old.update({"pilot_id":PILOT,"updated_at_utc":now(),"files":files})
    tmp=manifest_path.with_name(manifest_path.name+".tmp");tmp.write_text(json.dumps(old,indent=2),encoding="utf-8");os.replace(tmp,manifest_path)
    regenerate_exports(base)
    append_jsonl(base/"sync/sync_log.jsonl",{"at":now(),"verified_observations":len(verified_obs),"verified_photos":len(verified_photos),"integrity_errors":errors})
    heartbeat({"agent_id":AGENT,"root_path":str(ROOT),"status":"ONLINE","verified_observations":len(verified_obs),"verified_photos":len(verified_photos),"pending":pending,"integrity_errors":errors})
    return {"verified_observations":len(verified_obs),"verified_photos":len(verified_photos),"integrity_errors":errors}
def main():
    once="--once" in sys.argv
    while True:
        try: print(now(),cycle())
        except Exception as e:
            print(now(),"SYNC_ERROR",repr(e))
            try: append_jsonl(ROOT/PILOT/"sync/failed/sync_log.jsonl",{"at":now(),"error":repr(e)})
            except Exception: pass
        if once: break
        time.sleep(INTERVAL)
if __name__=="__main__":main()
