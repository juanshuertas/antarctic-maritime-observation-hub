# Architecture & operations

> Architecture, stack, deployment, ship LAN, cloud sync, testing.  
> Part of the [AMOH documentation](README.md).

## 🏗️ Architecture

```text
┌───────────────────────────────────────────────────────────────┐
│                            AMOH                               │
│                  WORLD OCEANS LIVING OBSERVATORY             │
├───────────────────────────────────────────────────────────────┤
│                         LIVE LENS                             │
│                   MAP · GLOBE · SAT · SURIE                  │
│                                                               │
│ Vessels · Flights · Satellites · Fisheries · Fauna · Cables  │
└───────────────────────────────┬───────────────────────────────┘
                                │
                         AMOH DATA FABRIC
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
    ONLINE ADAPTERS        FIELD / EDGE        SCIENCE LAYERS
    AIS / GFW / APIs       PWA / Android       Quantarctica
    Satellite / Weather    DuckDB / LAN        SURIE / COG/MVT
           │                    │                    │
           └────────────────────┼────────────────────┘
                                ▼
                     PROVENANCE + REVIEW
                                │
               ┌────────────────┼────────────────┐
               ▼                ▼                ▼
            PYTHIA         EXPEDITIONS        PASSPORT
               │                │                │
               └────────────────┼────────────────┘
                                ▼
                            MIROFISH
                      SCENARIO SIMULATION
```

---

## 🧱 Technology stack

### Frontend

```text
React
Vite
MapLibre GL JS
IndexedDB
PWA
```

### Backend

```text
Python
FastAPI
DuckDB
DuckDB Spatial
```

### AI / Edge

```text
Ollama
Pythia
MiroFish adapter
```

### Optional integrations

```text
Global Fishing Watch
ArcGIS SURIE
Quantarctica
Copernicus
Google Earth Engine
World / World ID
Google Cloud
BigQuery
AIS providers
scientific open-data APIs
```

---

## Development and deployment

See the [repository README](../README.md) for the current repository layout
and backend commands, and the [frontend guide](../app/README.md) for OLEA and
PB124 builds. The capabilities described here include research prototypes and
planned integrations.

---

## 🚢 Ship / Expedition LAN

A typical field deployment may look like:

```text
EDGE NODE
│
├── AMOH Frontend :5174
├── FastAPI :8000
├── Pythia :8088
├── DuckDB Spatial
├── offline map packages
├── selected Quantarctica data
├── observation queue
└── selective cloud sync
```

Phones connect using:

```text
http://<LAN_IP>:5174/
```

---

## ☁️ Cloud synchronization

AMOH is **online-first** during normal observatory operation.

Field and expedition workflows are designed to continue when public Internet disappears.

Cloud services may support:

- backup;
- remote access;
- validated observations;
- selected media;
- historical analytics;
- BigQuery;
- Earth Engine;
- batch processing.

Raw high-frequency sensor data does not need to be uploaded automatically.

---

## 🧪 Testing

Before declaring a build stable:

```bash
npm run build
npm run lint
npm test
```

Only run commands that exist in the current repository.

Minimum test areas:

```text
Live Lens
MapLibre startup
single WebGL context
AIS
GFW
fauna
SURIE
Quantarctica
offline observations
IndexedDB
LAN QR
DJI GSD
Pythia
Brier weighting
Passport state machine
reward gating
Expeditions
responsive layout
provider failures
```

Never report a test as successful unless it was actually executed.
