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