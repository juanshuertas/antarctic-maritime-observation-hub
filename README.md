# 🧊 Antarctic Maritime Observation Hub (AMOH)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Python: 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python)](https://www.python.org/)
[![Engine: DuckDB Spatial](https://img.shields.io/badge/Engine-DuckDB_Spatial-yellow)](https://duckdb.org/)
[![AI Stack: Pythia + MiroFish](https://img.shields.io/badge/AI_Stack-Pythia_%2B_MiroFish-purple)](#)
[![SCAR OSC 2026: Abstract 1820](https://img.shields.io/badge/SCAR_OSC_2026-Abstract_1820-00D2FF)](https://scar2026.org/)
[![Program: NG--LEX Visiting Scientist 2027--28](https://img.shields.io/badge/NG--LEX-Visiting_Scientist_2027--28-gold)](https://www.nationalgeographic.org/)

> **Plataforma offline-first de fusión geoespacial, fotogrametría táctica y simulación prospectiva para el monitoreo de la presión del tráfico marítimo mediante sensores satelitales (Sentinel), trazas AIS, sensores dron y validación visual en la Península Antártica y el Océano Austral.**  
> Desarrollado por **Juan Sebastián Huertas Olea** como proyecto de investigación independiente alineado con la *Agenda Científica Antártica de Colombia 2025–2035* y adaptado para el *National Geographic–Lindblad Visiting Scientist Program (Southern Ocean 2027–2028)*. Abstract SCAR OSC 2026 #1820.

---

## 📋 Tabla de Contenidos

1. [Contexto de Investigación y Metas](#-contexto-de-investigación-y-metas)
2. [Principios Operativos Fundamentales](#-principios-operativos-fundamentales)
3. [Arquitectura General del Sistema](#-arquitectura-general-del-sistema)
4. [Módulos Principales del Hub](#️-módulos-principales-del-hub)
   - [1. HUD Táctico OSINT & 14 Capas GIS](#1-hud-táctico-osint--14-capas-gis-estilo-gods-eye)
   - [2. Mapas Abiertos DJI & Fotogrametría Aérea](#2-mapas-abiertos-dji--fotogrametría-aérea)
   - [3. PWA AMOH Field Connect & Enlace Local QR](#3-pwa-amoh-field-connect--enlace-local-qr)
   - [4. Pasaporte Científico Antártico & World Money ($WLD)](#4-pasaporte-científico-antártico--world-money-wld)
   - [5. Consola MiroFish Simulation Engine](#5-consola-mirofish-simulation-engine)
   - [6. Pythia Intelligence Stack (Ollama + Swarm Council)](#6-pythia-intelligence-stack-ollama--swarm-council)
5. [Modelos Matemáticos y Formulaciones](#-modelos-matemáticos-y-formulaciones)
6. [Estructura de Base de Datos (DuckDB Spatial)](#-estructura-de-base-de-datos-duckdb-spatial)
7. [Ingesta de Datos Científicos Abiertos](#-ingesta-de-datos-científicos-abiertos)
8. [Modelo Económico B2B / B2G](#-modelo-económico-b2b--b2g)
9. [Guía de Descarga, Instalación y Despliegue](#-guía-de-descarga-instalación-y-despliegue)
10. [Estructura del Repositorio](#-estructura-del-repositorio)
11. [Seguridad, Privacidad y Licencia](#-seguridad-privacidad-y-licencia)

---

## 🔬 Contexto de Investigación y Metas

El **Antarctic Maritime Observation Hub (AMOH)** aborda la creciente necesidad de caracterizar la presión del tráfico marítimo (buques turísticos, pesqueros y logísticos) sobre los ecosistemas vulnerables de la Península Antártica. Operando en zonas donde la conectividad a Internet es nula o extremadamente costosa, AMOH funciona como una **estación de trabajo táctica Edge** autónoma capaz de:

1. **Reconciliar datos heterogéneos:** Trazas AIS satelitales y terrestres, imágenes ópticas Sentinel-2/SAR Sentinel-1, ortomosaicos aéreos de drones DJI y observaciones visuales de campo.
2. **Predecir tendencias y derivas:** Proyectar eventos de navegación, interacciones con fauna y dinámica de banquisa de hielo utilizando simulaciones de agentes y oráculos LLM locales.
3. **Incentivar la ciencia ciudadana y abierta:** Garantizar la autenticidad de los datos mediante un Pasaporte Científico respaldado por **World ID** y micro-recompensas en **World Money ($WLD)**.

---

## 🎯 Principios Operativos Fundamentales

* **Observation $\neq$ Causation:** La coincidencia espacio-temporal entre un buque y un registro visual o ambiental no demuestra impacto ecológico directo ni causalidad.
* **Offline-First Edge Workstation:** Operatividad local autónoma al 100% sobre un nodo Edge (MacBook Pro / servidor de buque) sin dependencia de conectividad satelital ni APIs externas.
* **Trazabilidad Criptográfica & Identidad Soberana:** Cada observación genera un hash SHA-256 inmutable vinculado al Pasaporte Científico Antártico respaldado por World ID (*Proof of Personhood*).
* **Cero Interferencia:** La recolección de datos se adapta estrictamente a la ruta del buque expedicionario; no requiere alteraciones de rumbo, paradas dedicadas ni alteración de ecosistemas.

---

## 📐 Arquitectura General del Sistema

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AMOH FIELD ATLAS — OSINT HUD TÁCTICO                            │
│                        Interfaz Dark Glassmorphism (#080E19)                            │
└──────────────┬───────────────────────────┬───────────────────────────┬─────────────────┘
               │                           │                           │
 ┌─────────────┴────────────┐  ┌───────────┴───────────┐  ┌─────────────┴────────────┐
 │  CAPAS GIS & FOTOGRAM.   │  │   FIELD CONNECT PWA   │  │     MOTORES DE AI & ENJ.  │
 ├──────────────────────────┤  ├───────────────────────┤  ├──────────────────────────┤
 │ • 14 Capas OSIRIS AI     │  │ • Offline IndexedDB   │  │ • MiroFish (5 Pasos)     │
 │ • Ortomosaicos DJI       │  │ • Sensores GPS / Camera│  │ • Pythia Local (:8088)   │
 │ • Extractor EXIF/XMP     │  │ • Código QR IP Local  │  │ • Swarm Council (Ollama) │
 └─────────────┬────────────┘  └───────────┬───────────┘  └─────────────┬────────────┘
               │                           │                           │
               └───────────────────────────┼───────────────────────────┘
                                           ▼
             ┌───────────────────────────────────────────────────────────┐
             │            PASAPORTE CIENTÍFICO & WORLD MONEY             │
             ├───────────────────────────────────────────────────────────┤
             │ • Proof of Personhood (Verificación World ID)             │
             │ • Sellos Digitales Inmutables de Expedición               │
             │ • Micro-recompensas $WLD (Aprobación Antifraude)          │
             └─────────────────────────────┬─────────────────────────────┘
                                           ▼
             ┌───────────────────────────────────────────────────────────┐
             │              BACKEND STORAGE & ENGINE EDGE                │
             ├───────────────────────────────────────────────────────────┤
             │ • Python 3.12 + FastAPI + DuckDB Spatial                  │
             │ • Datasets: Quantarctica / Copernicus / GFW / SCAR        │
             └─────────────────────────────┴─────────────────────────────┘
```

---

## 🛠️ Módulos Principales del Hub

### 1. HUD Táctico OSINT & 14 Capas GIS (Estilo God's Eye)

* **Dashboard de Alta Densidad:** Diseño táctico glassmorphism en modo oscuro (`#080E19`) con radar de anomalías en vivo, contador de tráfico marítimo y telemetría de hielo.
* **14 Capas OSIRIS AI Integradas:**
  * `flights`: Tráfico aéreo antártico y logística intercontinental.
  * `military`: Posicionamiento de bases y buques gubernamentales.
  * `maritime`: Transpondedores AIS en tiempo real y reconstrucción de trazas.
  * `sat_military`: Cobertura de satélites en órbita polar.
  * `cctv`: Transmisiones directas de estaciones científicas.
  * `cctv_previews`: Capturas periódicas de cámaras costeras.
  * `live_news`: RSS y boletines meteorológicos polares.
  * `earthquakes`: Eventos sísmicos y volcanismo subglaciar (USGS/GEOFON).
  * `global_incidents`: Alertas de socorro marítimo y derrames.
  * `day_night`: Ciclo de iluminación solar y noche polar.
  * `cables`: Infraestructura de telecomunicaciones y sensores submarinos.
  * `sdk_sea`: Batimetría de alta resolución y temperatura de superficie ($SST$).
  * `sdk_air`: Rosa de vientos, presión atmosférica y frentes fríos.
  * `sdk_naval`: Zonas de Exclusión Marítima (ZEE) y Áreas Marinas Protegidas (AMP).
* **Filtros Cero-Latencia:** Algoritmos automáticos para identificar buques con AIS desactivado (*dark vessels*), cambios bruscos de velocidad o desviaciones no declaradas.

---

### 2. Mapas Abiertos DJI & Fotogrametría Aérea

* **Superposición Ráster de Drones:** Renderizado de ortomosaicos aéreos georreferenciados procesados mediante OpenDroneMap o DJI Terra sobre bases y zonas costeras.
* **Extractor EXIF/XMP:** Análisis automático de imágenes subidas para extraer:
  * Altitud de vuelo ($H$) en metros relativos al punto de despegue.
  * Tamaño del sensor ($Sw, Sh$) y distancia focal ($Fr$).
  * Coordenadas GPS integradas en metadatos.
  * Ángulos de orientación de cámara: *pitch*, *roll* y *yaw*.

---

### 3. PWA AMOH Field Connect & Enlace Local QR

* **Offline-First Storage:** Formulario georreferenciado optimizado para tabletas y móviles de campo. Guarda registros de buques, témpanos de hielo, fauna y fotos en `IndexedDB`.
* **Sincronización Transaccional:** Los datos guardados localmente se envían automáticamente al servidor del buque al detectar enlace Wi-Fi.
* **Emparejamiento por QR Dinámico:** Genera un código QR que resuelve la IP de la red local del buque (ej. `http://192.168.1.100:5174`), asegurando conexión fluida desde cualquier dispositivo móvil sin pasar por `localhost`.

---

### 4. Pasaporte Científico Antártico & World Money ($WLD)

* **Autenticación con World ID:** Garantiza que cada contribución científica proviene de un ser humano único (*Proof of Personhood*) mediante Zero-Knowledge Proofs (ZKP), protegiendo la identidad del usuario.
* **Sellos de Expedición:** Cada aporte aprobado por el comité revisor genera un sello inmutable almacenado en la bitácora del investigador.
* **Liberación de Recompensas Antifraude:** Micro-pagos en **World Money ($WLD)** abonados directamente a la billetera asociada al pasaporte únicamente cuando el estado de la observación cambia de `Pendiente` a `Aceptado`.

---

### 5. Consola MiroFish Simulation Engine

Espacio modal independiente para prospectiva y análisis de escenarios marinos complejos, dividido en un flujo de dos columnas:

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│     COLUMNA 1: SECUENCIA DE PASOS     │    COLUMNA 2: CONSOLA DE SEMILLAS     │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ 01 / Ontology Generation              │ 01 / REALITY SEEDS                    │
│    • Extracción de entidades clave    │    • Upload File (PDF, MD, TXT 50MB)  │
│ 02 / Graph Construction               │    • Import Scientific Link (GFW,     │
│    • Grafo vivo de actores y variables│      Copernicus, NOAA, Quantarctica)  │
│ 03 / Parallel Simulation              │ 02 / SIMULATION PROMPT                │
│    • Agentes interactuando en rondas  │    • Input de escenario prospectivo   │
│ 04 / Report Generation                │ ───────────────────────────────────── │
│    • Puntos de inflexión y confianza  │ [ INICIAR MOTOR DE SIMULACIÓN ]      │
│ 05 / Deep Interaction                 │                                       │
│    • Interrogación vía ReportAgent    │                                       │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

### 6. Pythia Intelligence Stack (Ollama + Swarm Council)

* **Servidor Oráculo Local (`:8088`):** Ejecución 100% offline mediante **Ollama** con modelos locales (`llama3.1`, `qwen3`), sin costos ni necesidad de claves API.
* **Consejo de Enjambre Antártico (Swarm Council):** Sistema de deliberación compuesto por 4 especialistas virtuales:
  * **Ice Navigator:** Experto en derroteros, concentración de hielo y navegabilidad.
  * **Marine Biologist:** Evaluador de interacciones con biomasa y megafauna.
  * **Naval Strategist:** Analista de patrones AIS, velocidad y conducta operacional.
  * **Skeptic:** Agente de validación encargado de mitigar falsos positivos y ruido.
* **Anillos de Pronóstico Visuales (Forecast Rings):** Capa de círculos pulsantes georreferenciados sobre el mapa con código de color por horizonte temporal:
  * 🔴 **24 Horas:** Alertas inminentes de deriva o colisión.
  * 🟠 **1 Semana:** Tendencias de tráfico y acumulación de banquisa.
  * 🟣 **1 Mes:** Proyecciones de derretimiento y rutas estacionales.
  * 🔵 **1 Año:** Modelado de presión turística y tendencias macroclimáticas.
* **Modo Kiosk (Bridge Display):** Modo de visualización ambiental a pantalla completa diseñado para los monitores del puente de mando, con rotación continua de mapa y widgets de telemetría flotantes.

---

## 📐 Modelos Matemáticos y Formulaciones

### 1. Ponderación Brier para el Consejo de Enjambre Pythia

La influencia de cada modelo/agente $i$ en las predicciones del enjambre se ajusta dinámicamente según su precisión histórica utilizando la puntuación de Brier ($BS_i$):

$$BS_i = \frac{1}{N} \sum_{t=1}^{N} (f_{i,t} - o_t)^2$$

Donde $f_{i,t} \in [0,1]$ es la probabilidad pronosticada por el agente $i$ y $o_t \in \{0,1\}$ es el resultado real observado. El peso ponderado $W_i$ del agente se calcula como:

$$W_i = \frac{(1 - BS_i)^2}{\sum_{j=1}^{K} (1 - BS_j)^2}$$

### 2. Cálculo de Ground Sample Distance (GSD) en Drones DJI

Para determinar la resolución espacial de los ortomosaicos sobre el hielo o zonas costeras:

$$GSD = \frac{Sw \times H \times 100}{Fr \times ImW}$$

Donde:
* $GSD$: Distancia entre centros de dos píxeles consecutivos ($cm/px$).
* $Sw$: Ancho físico del sensor de la cámara ($mm$).
* $H$: Altitud de vuelo sobre el terreno ($m$).
* $Fr$: Distancia focal de la lente ($mm$).
* $ImW$: Ancho de la imagen en píxeles ($px$).

---

## 🗄️ Estructura de Base de Datos (DuckDB Spatial)

AMOH utiliza **DuckDB Spatial** para ejecutar consultas geoespaciales analíticas de alta velocidad localmente.

```sql
-- Tabla de Trazas de Buques (AIS)
CREATE TABLE vessel_tracks (
    mmsi INTEGER,
    vessel_name VARCHAR,
    vessel_type VARCHAR,
    timestamp TIMESTAMP,
    speed_knots DOUBLE,
    course_deg DOUBLE,
    geom GEOMETRY,
    dark_vessel_flag BOOLEAN DEFAULT FALSE
);

-- Tabla de Observaciones del Pasaporte Científico
CREATE TABLE passport_claims (
    claim_id UUID PRIMARY KEY,
    nullifier_hash VARCHAR UNIQUE, -- Verificación World ID (ZKP)
    investigator_did VARCHAR,
    observation_type VARCHAR,
    timestamp TIMESTAMP,
    location GEOMETRY,
    ipfs_exif_hash VARCHAR,
    status VARCHAR DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reward_wld_amount DOUBLE DEFAULT 0.0
);

-- Tabla de Anillos de Pronóstico de Pythia
CREATE TABLE forecast_rings (
    ring_id UUID PRIMARY KEY,
    horizon_code VARCHAR, -- 24h, 1w, 1m, 1y
    confidence_score DOUBLE,
    prophecy_text TEXT,
    center_geom GEOMETRY,
    radius_meters DOUBLE,
    created_at TIMESTAMP
);
```

---

## 🌐 Ingesta de Datos Científicos Abiertos

La plataforma consume e ingiere automáticamente conjuntos de datos públicos mediante pipelines optimizados:

| Fuente Scientific Open Data | Tipo de Información | Aplicación en AMOH |
| :--- | :--- | :--- |
| **Quantarctica** *(Norwegian Polar Institute)* | Capas GIS de glaciología, topografía y batimetría | Relieve, batimetría y mapeo base |
| **Copernicus Marine Service** | Concentración de hielo marino y temperatura ($SST$) | Monitoreo de banquisa y deriva de hielo |
| **Global Fishing Watch (GFW API)** | Registros AIS y actividad pesquera en alta mar | Detección de pesca no declarada (IUU) |
| **SCAR / SOOS** | Biotelemetría, fauna y colonias antárticas | Registros de biodiversidad y conservación |
| **NOAA / NSIDC** | Extensión diaria e histórica de la banquisa | Tendencias y semillas para MiroFish / Pythia |

---

## 💰 Modelo Económico B2B / B2G

El software y sus herramientas de campo son **100% libres y gratuitos** para la comunidad científica, tripulaciones y ciencia ciudadana. La sostenibilidad del hub se financia mediante servicios comerciales en backend:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FUENTES DE INGRESOS B2B                         │
├──────────────────────────────────────┬─────────────────────────────────┤
│ APIs de Rutas & Hielo (B2B)          │ Suscripciones comerciales para  │
│                                      │ navieras, cruceros y flotas.    │
├──────────────────────────────────────┼─────────────────────────────────┤
│ Datos MRV & Certificación ESG (B2B)  │ Reportes auditados de hielo para│
│                                      │ aseguradoras y créditos verdes. │
├──────────────────────────────────────┼─────────────────────────────────┤
│ Analítica Defensiva (B2G)            │ Licencias gubernamentales para  │
│                                      │ agencias de control y soberanía.│
└──────────────────────────────────────┴─────────────────────────────────┘
```

---

## 🚀 Guía de Descarga, Instalación y Despliegue

### Requisitos Previos del Sistema

| Software / Herramienta | Versión Requerida | Propósito |
| :--- | :--- | :--- |
| **Git** | v2.30.0+ | Clonación del repositorio |
| **Node.js** | v18.0.0 o v20.0.0+ | Entorno de ejecución de Vite + React |
| **Python** | v3.12+ | Servidor Backend FastAPI & DuckDB Spatial |
| **Docker & Docker Compose** | Latest Stable | Despliegue containerizado en red local del buque |
| **Ollama** | Latest | Servidor de Inteligencia Artificial local (:8088) |

---

### Paso 1: Descarga del Repositorio

#### Opción 1: Mediante Git (Recomendado)
```bash
git clone [https://github.com/juanshuertas/antarctic-maritime-observation-hub.git](https://github.com/juanshuertas/antarctic-maritime-observation-hub.git)
cd antarctic-maritime-observation-hub
```

#### Opción 2: Descarga Directa ZIP (Para entornos con conectividad restringida)
1. Ve al botón verde **Code** en GitHub y haz clic en **Download ZIP**.
2. Descomprime el archivo `.zip` en tu directorio de trabajo.
3. Abre una terminal y navega hasta la carpeta:
```bash
cd antarctic-maritime-observation-hub-main
```

---

### Paso 2: Configuración de Variables de Entorno

Copia el archivo de plantilla `.env.example` para crear tu archivo `.env` local:

```bash
cp .env.example .env
```

Contenido por defecto de `.env`:
```env
PORT=5174
HOST=0.0.0.0
FASTAPI_BACKEND_URL=http://localhost:8000
PYTHIA_OLLAMA_URL=http://localhost:8088
DUCKDB_PATH=./app/data/amoh_spatial.duckdb
WORLD_ID_APP_ID=app_staging_amoh_antarctica
```

---

### Paso 3: Métodos de Instalación y Ejecución

#### 🐳 Opción A: Despliegue Rápido con Docker Compose (Recomendado para Buques)

Este método levanta el sistema completo (Frontend React, Backend FastAPI, DuckDB y Pythia Ollama) en contenedores aislados compartidos en la red local del buque.

```bash
# 1. Construir e iniciar los servicios
docker compose up --build -d

# 2. Verificar el estado de los contenedores
docker compose ps
```

* **Interfaz Principal (HUD):** `http://localhost:5174` (o la IP del buque `http://192.168.x.x:5174`)
* **API Backend FastAPI:** `http://localhost:8000/docs`
* **Servidor Pythia AI:** `http://localhost:8088`

---

#### 💻 Opción B: Instalación Manual para Desarrollo (Linux / macOS / Windows)

##### 1. Configurar e instalar dependencias Frontend:
```bash
npm install
```

##### 2. Crear y activar entorno virtual de Python:
```bash
# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate
```

##### 3. Instalar dependencias backend de Python:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

##### 4. Instalar y preparar los modelos locales de Ollama para Pythia:
```bash
# Asegúrate de tener Ollama instalado ([https://ollama.com/](https://ollama.com/))
# Descargar modelos locales requeridos por el Swarm Council
ollama pull llama3.1
ollama pull qwen3
```

##### 5. Iniciar los servidores en paralelo:

**Terminal 1 (Backend FastAPI):**
```bash
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Servidor Pythia Local):**
```bash
python services/pythia/swarm.py --port 8088
```

**Terminal 3 (Frontend React + Vite):**
```bash
npm run dev -- --host 0.0.0.0 --port 5174
```

---

### Paso 4: Verificación del Estado (Health Checks)

Puedes verificar el correcto funcionamiento ejecutando los siguientes comandos en tu terminal:

```bash
# Probar estado del Backend FastAPI
curl -X GET http://localhost:8000/health

# Probar estado del motor Pythia AI
curl -X GET http://localhost:8088/health
```

Respuesta esperada: `{"status": "online", "system": "AMOH Edge Node", "duckdb": "connected"}`

---

## 📂 Estructura del Repositorio

```text
antarctic-maritime-observation-hub/
├── app/                      # Backend FastAPI y rutas de API
│   ├── main.py               # Entrypoint del servidor FastAPI (:8000)
│   ├── db.py                 # Conexión y consultas DuckDB Spatial
│   └── routers/              # Endpoints (vessels, forecast, passport)
├── services/
│   ├── pythia/               # Servidor local de Pythia (:8088)
│   │   ├── swarm.py          # Lógica del Swarm Council (Ollama)
│   │   └── brier.py          # Algoritmo de ponderación Brier
│   ├── mirofish/             # Motor de simulación ontológica de 5 pasos
│   └── osiris_engine/        # Procesador de capas GIS tácticas
├── src/                      # Frontend React + Vite + MapLibre / Leaflet
│   ├── components/           # UI Components (HUD, Radar, MiroFish, Pythia)
│   ├── gis/                  # Layers, DJI Photogrammetry & EXIF Parser
│   └── wallet/               # Conector World ID & $WLD Ledger
├── public/                   # Basemaps estáticos, assets y manifest PWA
├── docker-compose.yml        # Configuración de contenedores Edge
├── package.json              # Dependencias JavaScript
├── requirements.txt          # Dependencias Python
└── README.md                 # Documentación principal
```

---

## 🛡️ Seguridad, Privacidad y Licencia

* **Privacidad Zero-Knowledge:** La autenticación mediante **World ID** utiliza la prueba de conocimiento cero `semaphore-protocol`. No se almacenan datos biométricos, nombres reales ni direcciones IP de los investigadores.
* **Sanitización OWASP:** Todos los puntos de entrada de archivos (PDF/MD/TXT/EXIF) pasan por pipelines de validación y sanitización para prevenir vulnerabilidades XSS, SQLi e Inyección de Comandos.
* **Licencia:** Este proyecto está distribuido bajo la licencia **GNU Affero General Public License v3.0 (AGPL-3.0)**. Consulta el archivo `LICENSE` para más detalles.
