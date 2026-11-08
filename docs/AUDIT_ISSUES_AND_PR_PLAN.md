# 🧊 AMOH — Owner Brief, Adversarial Audit, GitHub Issues & PR Plan

---

## Part 1: Jovial Summary for the Repository Owner (English & Español)

### 🐧 The "Penguin-Friendly" Summary (English)

**First off: The vision is 10/10.**
Reading `README.md` feels like stepping onto the bridge of a futuristic research icebreaker—between the Antarctic Globe, local AI council ("Pythia"), Scientific Passports, and drone GSD math, the conceptual design is awesome.

**The catch? Right now, the README is a 5-star research icebreaker, while the `main` branch is a rubber zodiac dinghy with a very enthusiastic outboard motor.** 😄

Here is what we found under the hood and what we’re going to do next to get the code matching the vision:

1. **Operation "Bring the Crew Back to the Same Ship" (Branch Cleanup)**
   - Right now, there are **16 different branches** floating around like icebergs (`pb124-pilot`, `olea-research`, `copilot/revisa-todo`, etc.). Even some bug fixes that were already written never made it back into `main`, and one branch is carrying ~120 MB of compiled website files.
   - *What we'll do next:* Rescue the best fixes into `main` and keep the repository lean and clean.

2. **Teaching the Code to Obey Its Own Scientific Rules**
   - The README has a great golden rule: *"Observation ≠ Causation — never accuse a ship of illegal fishing just because of an AIS gap, and never pass off simulated data as live."*
   - Meanwhile, `behavioral_analysis.py` is currently acting like an over-caffeinated detective: if a ship loses satellite signal for 4 hours (pretty normal near the South Pole!) or slows down in a hardcoded box of fake NASA data (`environmental_service.py`), it immediately shouts `"High probability of IUU Fishing!"` 🚨
   - *What we'll do next:* Label simulated data honestly (`SIMULATION`) and change the verdict to a proper scientific flag (`ANOMALY_DETECTED — Needs human review` with `review_state: "UNREVIEWED"`).

3. **Fixing Polar Math & "Chatty" Database Queries**
   - In `ais_service.py`, the ship-encounter detector takes a `min_duration_hours` parameter and... completely ignores it! Plus, it asks the database thousands of tiny questions in a loop instead of one smart query.
   - In `behavioral_analysis.py`, distance is calculated on a flat grid of degrees (`lat/lon`)—which gets super stretched out near Antarctica—and we have three copy-pasted versions of the Haversine distance formula across the repo.
   - *What we'll do next:* One clean geodesic math module, fast DuckDB queries, and proper encounter duration tracking.

4. **Turning "Ghost Features" into Real Endpoints**
   - The database creates tables for `observations` and `consents` (`database.py`), and the README promises endpoints like `/api/observations`, `/api/network-info` (for the ship LAN QR code), **Brier Score AI weighting**, and **DJI Drone GSD math**—but none of them are wired up yet!
   - *What we'll do next:* Build out these core endpoints and scientific formulas so they work out of the box.

5. **Locking the Hatch (Security & Tests)**
   - We’ll fix a SQL injection hole in the CSV importer (`import_historical_ais.py`), add CORS and input validation to FastAPI (`main.py`), fix `.gitignore` (which is currently ignoring almost all `.json` files!), and add a full automated test suite so nothing breaks on the next expedition.

---

### 🇨🇴 Versión Jovial en Español (Lista para enviar al dueño del repo)

> **¡Juan! Estuvimos revisando a fondo el repo de AMOH y aquí va el diagnóstico con cariño polar 🐧🧊:**
>
> **Lo bueno:** ¡La visión del proyecto es brutal! El `README` parece el plano de una estación espacial antártica: pasaporte científico, IA local con Pythia, cálculo de GSD para drones, DuckDB espacial y operación offline en expediciones.
>
> **El detalle:** Ahora mismo el `README` es un rompehielos de última generación, pero la rama `main` es un zodiac inflable con apenas 580 líneas de Python tratando de alcanzarlo 😂.
>
> **¿Qué encontramos y cuál es el plan de ataque?**
> 1. **Reunificar los témpanos (Ramas de Git):** Hay 16 ramas sueltas con arreglos y pilotos (`pb124-pilot`, `olea`, fixes de Copilot) que nunca llegaron a `main`. Vamos a rescatar e integrar lo mejor en `main`.
> 2. **Alinear el código con tu propia filosofía científica:** En el README dices muy claro que *"Observación ≠ Causalidad"* y que nunca se debe acusar a un barco de pesca ilegal automáticamente ni mezclar simulaciones con datos reales. ¡Pero el código actual en `behavioral_analysis.py` ve un hueco de 4 horas de AIS o datos simulados de NASA y de una vez grita *"Alta probabilidad de pesca ilegal (IUU)"*! Vamos a etiquetar bien los datos como `SIMULATION` y cambiar eso a alertas científicas (`UNREVIEWED` / anomalía para revisión).
> 3. **Arreglar la geometría polar y las consultas:** El detector de encuentros entre barcos ignoraba la duración mínima (`min_duration_hours`) y hacía miles de consultas en bucle; además, había cálculos de distancia usando grados planos (que en la Antártida se deforman muchísimo) y la fórmula de Haversine repetida 3 veces. Lo dejaremos en un solo módulo geodésico rápido y exacto.
> 4. **Darle vida a lo que hoy está en "modo fantasma":** Las tablas de `observations` y `consents` ya existen en DuckDB pero no tienen endpoints, y faltan las funciones clave del README (cálculo de GSD de drones DJI, pesos Brier para Pythia, `/api/network-info` para el QR en la LAN del barco y el motor de *matchups*). ¡Los vamos a dejar implementados y funcionando!
> 5. **Blindaje y pruebas automáticas:** Cerraremos una inyección SQL en el importador CSV, arreglaremos el `.gitignore` (que estaba bloqueando todos los `.json`), añadiremos validación de datos en FastAPI y crearemos una suite completa de tests para que el código quede listo para zarpar. 🚢✨

---

## Part 2: Series of GitHub Issues to Open on the Repository

### Issue #1: `[Bug / Performance] Fix AIS encounter detection (min_duration_hours ignored) and eliminate O(V²) N+1 SQL query explosion`
- **Labels:** `bug`, `performance`, `backend`, `priority: critical`
- **Problem:** `AISService.get_encounters()` ignores `min_duration_hours` and executes $1 + 2\binom{V}{2}$ SQL queries per HTTP request.
- **Acceptance Criteria:**
  - [x] Single-query position fetch + two-pointer temporal window scan.
  - [x] Enforce `duration_hours >= min_duration_hours`.
  - [x] Add unit tests for encounter duration threshold filtering.

### Issue #2: `[Scientific Integrity] Align BehavioralAnalysisService & EnvironmentalService with AMOH "Observation ≠ Causation" and Data State (SIMULATION) rules`
- **Labels:** `scientific-integrity`, `bug`, `backend`, `priority: critical`
- **Problem:** Simulated environmental data lacks `"data_state": "SIMULATION"`, and `BehavioralAnalysisService` automatically labels vessels `"High probability of IUU Fishing"`.
- **Acceptance Criteria:**
  - [x] Tag simulated outputs with `"data_state": "SIMULATION"` and provenance metadata.
  - [x] Report `"review_state": "UNREVIEWED"` and non-accusatory anomaly summaries (`Observation != Causation`).

### Issue #3: `[Bug / Geodesy] Replace planar Euclidean degree distance at polar latitudes and deduplicate Haversine implementations`
- **Labels:** `bug`, `geospatial`, `refactor`, `priority: high`
- **Problem:** `behavioral_analysis.py` computes Euclidean distance on raw `lat/lon` degrees (distorted $>2.3\times$ at $65^\circ\text{S}$) and `haversine` is copy-pasted 3 times without null/bounds checks.
- **Acceptance Criteria:**
  - [x] Extract `backend/app/geodesy.py` with `haversine_nm`, `haversine_meters`, and coordinate validation.
  - [x] Refactor all services and scripts to use `geodesy.py`.

### Issue #4: `[Security] Fix SQL injection in CSV importer, harden secrets/CORS/headers, and run Docker container as non-root`
- **Labels:** `security`, `devops`, `priority: critical`
- **Problem:** `import_historical_ais.py` uses f-string SQL interpolation; `config.py` uses literal `"change-me"` fallbacks; `Dockerfile` runs as `root`; `.gitignore` blocks `*.json` globally.
- **Acceptance Criteria:**
  - [x] Parameterized SQL in `import_historical_ais.py` + path traversal validation.
  - [x] Ephemeral cryptographic secret fallback with warning in `config.py`.
  - [x] Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`) & strict `CORSMiddleware` in `main.py`.
  - [x] Non-root user in `Dockerfile` and narrowed `.gitignore` rule.

### Issue #5: `[Backend / Database] Fix DuckDB connection concurrency, offline spatial loading, indexes, and FastAPI lifecycle`
- **Labels:** `backend`, `database`, `priority: high`
- **Acceptance Criteria:**
  - [x] Try `LOAD spatial;` before `INSTALL spatial;`, respecting offline mode.
  - [x] Add indexes on `ais_vessels(mmsi, utc)` and `observations(expedition_id, utc)` and create `expeditions`, `forecast_rings`, `passport_claims`, and `scientific_matchups` tables.
  - [x] Migrate `main.py` from deprecated `@app.on_event("startup")` to `lifespan`.

### Issue #6: `[Feature / API] Implement documented AMOH API endpoints (/api/observations, /api/network-info, /api/system/status, /api/vessels, /api/matchups)`
- **Labels:** `enhancement`, `api`, `backend`, `priority: high`
- **Acceptance Criteria:**
  - [x] Implement `/api/health`, `/api/system/status`, `/api/network-info`, `/api/vessels`, `GET/POST /api/observations`, `POST /api/matchups/evaluate`, `/api/expeditions`, `/api/forecast-rings`, `/api/passport/me`, and `/api/rewards`.

### Issue #7: `[Feature / Science Engine] Implement documented Brier Score Swarm Council weighting and DJI Aerial GSD calculator`
- **Labels:** `enhancement`, `science`, `ai`, `priority: medium`
- **Acceptance Criteria:**
  - [x] Implement `calculate_gsd_cm_per_px()` returning `"UNAVAILABLE"` when sensor width is missing/invalid.
  - [x] Implement `compute_brier_weights()` passing all 5 documented test cases (`perfect`, `poor`, `equal`, `missing data`, `single agent`).

### Issue #8: `[Repo Hygiene & Testing] Add comprehensive automated test suite and clean up CLI scripts`
- **Labels:** `testing`, `maintenance`, `ci`, `priority: high`
- **Acceptance Criteria:**
  - [x] Add unit & integration test suite under `backend/tests/`.
  - [x] Refactor `backend/scripts/*.py` to remove duplicate math and `sys.path` hacks.

---

## Part 3: Pull Request Plan (`fix/adversarial-audit-remediation`)

1. **Step 1 — Geodesy, Security & Config Hardening (`Issues #3, #4`)**: `geodesy.py`, `config.py`, `import_historical_ais.py`, `Dockerfile`, `.gitignore`.
2. **Step 2 — Database Schema, Indexes & Offline Spatial Provisioning (`Issue #5`)**: `database.py`.
3. **Step 3 — AIS Encounters & Scientific Integrity (`Issues #1, #2`)**: `ais_service.py`, `environmental_service.py`, `behavioral_analysis.py`.
4. **Step 4 — Core `/api/*` Endpoints & Scientific Metrics (`Issues #6, #7`)**: `scientific_metrics.py`, `schemas.py`, `main.py`.
5. **Step 5 — Automated Test Suite & Script Cleanup (`Issue #8`)**: `backend/tests/*`, `backend/scripts/*`.
