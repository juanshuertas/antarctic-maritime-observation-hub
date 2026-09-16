# 🧊 Antarctic Maritime Observation Hub (AMOH)

**AI-enabled satellite and AIS monitoring of Antarctic shipping pressure**

Universal ocean observation platform for the National Geographic Society
Visiting Scientist Program (Southern Ocean 2027-2028).

## 🎯 Principios

- **Observation ≠ causation** — Co-occurrence no prueba impacto
- **Offline-first** — Funciona sin internet
- **Privacy by design** — GDPR + anonimización
- **Open source** — AGPL-3.0

## 🏗️ Stack

- **Backend:** Python 3.11 + FastAPI + DuckDB
- **Frontend:** React 18 + Vite + MapLibre GL
- **IA:** PyTorch (MobileNetV3)
- **Cloud:** GCS + Cloud Run + Earth Engine
- **Edge:** Docker Compose

## 🚀 Inicio rápido

```bash
git clone https://github.com/juanshuertas/antarctic-maritime-observation-hub.git
cd antarctic-maritime-observation-hub
cp .env.example .env
docker compose up --build
```

## MVP local sin internet

El núcleo local funciona sin AISStream, Google Cloud ni mapas remotos. Requiere
Python 3.11+ y las dependencias de `backend/requirements.txt`.

```powershell
uv venv
uv pip install --python .venv\Scripts\python.exe -r backend\requirements.txt
$env:PYTHONPATH = "backend"
$env:DATA_DIR = "$PWD\data"
& .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

En otra terminal, sirve la interfaz local:

```powershell
python -m http.server 5173 --directory frontend
```

Abre `http://localhost:5173`. La interfaz usa archivos locales y muestra los
registros en tabla cuando no existe un paquete de cartografía offline.

### Importar AIS local

```powershell
curl.exe -X POST -F "file=@data\sample_ais.csv" http://localhost:8000/ais/import
```

El importador CSV valida MMSI, UTC, latitud y longitud, informa filas
rechazadas y no duplica una posición idéntica. AISStream sigue siendo opcional.

### Exportar y respaldar

- `GET /exports/observations.csv`
- `GET /exports/observations.geojson`
- `POST /exports/backup` crea un snapshot Parquet y un manifiesto SHA-256.

El snapshot local no es un respaldo independiente: debe copiarse manualmente a
otro medio y conservar su manifiesto.

## Estado y limitaciones del MVP

Implementado: CRUD local de observaciones, posición del observador separada de
la posición objetivo, procedencia básica, bandera demo, importación CSV AIS,
deduplicación, exportaciones, backup verificable e interfaz local.

Pendiente: importación Parquet con mapeo interactivo, escenas satelitales,
matching y revisión humana, cartografía offline PMTiles, PWA, sincronización e
IA opcional. No se presentan rutas turísticas ni posiciones AIS como evidencia
si no fueron importadas o verificadas.

La validación cubre coordenadas cero y antimeridiano, objetivo separado,
importación válida/duplicada/inválida, exportaciones y backup. No se declara
rendimiento del hardware de campo.