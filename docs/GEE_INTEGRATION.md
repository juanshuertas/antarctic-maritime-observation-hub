# Google Earth Engine integration

GEE is an optional remote connector for AMOH. The offline edge node remains
usable when the connector, credentials, or network are unavailable.

## Install the optional tools

From the repository root:

```powershell
uv pip install --python .venv\Scripts\python.exe -r backend\requirements-gee.txt
```

Authenticate in the local user environment, never in Git:

```powershell
earthengine authenticate
```

Then set `GEE_ENABLED=true` and, for a Cloud project, `GEE_PROJECT` in the
local `.env`. Do not commit credential files or service account JSON files.

## FastAPI endpoint

`GET /api/gee/sar-tile` renders a Sentinel-1 GRD tile URL for the default
Gerlache Strait bounding box and Q1 2024. The query accepts `start_date`,
`end_date`, `min_lat`, `min_lon`, `max_lat`, and `max_lon`.

The processing uses:

- `COPERNICUS/S1_GRD`
- `instrumentMode == IW`
- `transmitterReceiverPolarisation` containing `HH`
- median composite clipped to the requested rectangle
- visualization range `-25` to `5` dB

The endpoint returns HTTP 503 when disabled or unauthenticated, and HTTP 502
for a remote processing failure. A returned tile URL is a remote rendered
asset; it is not a local archive and does not imply continuous real-time data.

## Notebook

Open [gee_antartica_sar.ipynb](../notebooks/gee_antartica_sar.ipynb) in VS Code
after selecting the project Python environment. The notebook loads the native
`GLOBAL_FISHING_WATCH/V1/vessels` FeatureCollection and demonstrates explicit
local paths for Quantarctica IAATO routes, CMEMS sea-ice concentration, and
EMODnet AIS positions.

Those local layers require separate acquisition, license review, schema
mapping, and provenance records. They are not silently treated as GEE assets.

## Scientific limits

Sentinel-1 scenes are snapshots rather than continuous observations. AIS
absence is not vessel absence. An observer GPS position is not a target-vessel
position unless the target location and method were separately recorded. GEE
layers provide context and do not establish causation or environmental impact.