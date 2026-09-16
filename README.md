# 🧊 Antarctic Maritime Observation Hub (AMOH)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Python: 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python)](https://www.python.org/)
[![Engine: DuckDB Spatial](https://img.shields.io/badge/Engine-DuckDB_Spatial-yellow)](https://duckdb.org/)
[![SCAR OSC 2026: Abstract 1820](https://img.shields.io/badge/SCAR_OSC_2026-Abstract_1820-00D2FF)](https://scar2026.org/)
[![Program: NG--LEX Visiting Scientist 2027--28](https://img.shields.io/badge/NG--LEX-Visiting_Scientist_2027--28-gold)](https://www.nationalgeographic.org/)

> **Plataforma offline-first de fusión geoespacial para el monitoreo de presión de tráfico marítimo mediante sensores satelitales (Sentinel), trazas AIS y validación visual en la Península Antártica.**  
> Desarrollado por **Juan Sebastián Huertas Olea** como proyecto de investigación independiente alineado con la *Agenda Científica Antártica de Colombia 2025–2035* y adaptado para el *National Geographic–Lindblad Visiting Scientist Program (Southern Ocean 2027–2028)*.

---

## 🎯 Principios Operativos Fundamentales

* **Observation $\neq$ Causation:** La coincidencia espacio-temporal entre un buque y un registro visual no demuestra impacto ambiental ni causalidad.
* **Offline-First Edge Workstation:** Operatividad local autónoma al 100% sobre un MacBook Pro Edge Node sin dependencia de conectividad satelital ni APIs externas.
* **Trazabilidad Criptográfica:** Cada observación genera un hash SHA-256 local para garantizar la integridad y proveniencia de los datos antes de sincronizarse.
* **Cero Interferencia:** La investigación se adapta estrictamente a la ruta del buque expedicionario; no se realizan cambios de rumbo, paradas dedicadas ni recolección de muestras físicas.

---

## 🏗️ Arquitectura Técnica y Módulos

```text
AMOH Edge Node (MacBook Pro)
├── app/                  --> Backend FastAPI + DuckDB Spatial
├── data/
│   ├── amoh_local.db     --> Base de datos DuckDB Spatial
│   └── quantarctica/     --> Capas vectoriales/ráster de SCAR (quantarcticR)
├── services/
│   ├── mirofish/         --> Motor de análisis de tráfico y anomalías de velocidad
│   └── osiris_engine/    --> Motor espacial desacoplado de OSIRIS
└── static/               --> Frontend MapLibre GL JS (Línea gráfica WOD 2025)
git clone https://github.com/juanshuertas/antarctic-maritime-observation-hub.git
cd antarctic-maritime-observation-hub
cp .env.example .env
docker compose up --build
