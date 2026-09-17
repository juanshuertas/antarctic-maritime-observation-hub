```markdown
# 🇦🇳 Antarctic Maritime Observation Hub (AMOH)

[![Repository](https://img.shields.io/badge/GitHub-juanshuertas%2Fantarctic--maritime--observation--hub-blue?logo=github)](https://github.com/juanshuertas/antarctic-maritime-observation-hub)
[![Platform Status](https://img.shields.io/badge/Status-Operational-brightgreen)](#)
[![Network](https://img.shields.io/badge/Network-Offline--First-orange)](#)
[![AI Engines](https://img.shields.io/badge/AI-Pythia%20%2B%20MiroFish-purple)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

**AMOH (Antarctic Maritime Observation Hub)** es una plataforma táctica de inteligencia marítima, fotogrametría aérea y simulación prospectiva diseñada para operar en entornos sin conectividad en la Península Antártica y el Océano Austral. Unifica 14 capas GIS, ortomosaicos de drones DJI, captura móvil participativa PWA, verificación de identidad mediante **World ID**, micro-recompensas en **World Money ($WLD)** y un motor de predicción descentralizado alimentado por **Ollama**.

---

## 📐 Arquitectura General del Sistema


```

┌─────────────────────────────────────────────────────────────────────────┐
│                      AMOH FIELD ATLAS (HUD TÁCTICO)                      │
│                  Interfaz Dark Glassmorphism (#080E19)                   │
└─────────┬───────────────────────────┬─────────────────────────┬─────────┘
│                           │                         │
┌────────┴────────┐         ┌────────┴────────┐       ┌────────┴────────┐
│   GIS & DRONE   │         │  FIELD CONNECT  │       │   SIMULATION    │
│   CAPAS GIS     │         │   PWA MÓVIL     │       │     ENGINES     │
├─────────────────┤         ├─────────────────┤       ├─────────────────┤
│ • 14 Osiris AI  │         │ • Offline-First │       │ • MiroFish 5-St │
│ • DJI Raster    │         │ • Sensores GPS  │       │ • Pythia Swarm  │
│ • Metadatos EXIF│         │ • Conexión QR   │       │ • Forecast Ring │
└────────┬────────┘         └────────┬────────┘       └────────┬────────┘
│                           │                         │
└───────────────────────────┼─────────────────────────┘
▼
┌─────────────────────────────────────────────────┐
│       PASAPORTE CIENTÍFICO & WORLD MONEY        │
├─────────────────────────────────────────────────┤
│ • Proof of Personhood (World ID Verification)   │
│ • Sellos de expedición criptográficos            │
│ • Micro-recompensas $WLD (Aprobación Antifraude)│
└─────────────────────────────────────────────────┘

```

---

## 🛠️ Módulos Principales

### 1. HUD Táctico OSINT & 14 Capas GIS (Estilo God's Eye)
* **Dashboard de Alta Densidad:** Interfaz táctica en modo oscuro (`#080E19`) con radar de anomalías, feeds de eventos en vivo y métricas de hielo.
* **Capas OSIRIS AI:** Integración en tiempo real de tráfico marítimo (AIS), aviación, actividad militar, eventos sísmicos, cables submarinos y cámaras.
* **Filtros Cero-Latencia:** Detección de buques con transpondedores AIS desactivados, giros abruptos de rumbo y movimientos no declarados.

### 2. Mapas Abiertos DJI & Fotogrametría Aérea
* **Superposición de Ortomosaicos:** Soporte para capas raster procesadas mediante OpenDroneMap o DJI Terra sobre bases antárticas.
* **Extractor EXIF/XMP:** Lectura automática de altitud ($m$), Ground Sample Distance (GSD), ángulos de inclinación (pitch/roll/yaw) y coordenadas GPS desde capturas aéreas.

### 3. PWA "AMOH Field Connect" & Enlace Local QR
* **Offline-First Storage:** Registro de avistamientos (buques, hielo, fauna, fotos DJI y notas) guardados en `IndexedDB` y sincronizados al recuperar conexión.
* **Emparejamiento QR Dinámico:** Resuelve automáticamente la IP de la red local del buque (ej. `http://192.168.1.100:5174`) para conectar móviles sin pasar por `localhost`.

### 4. Pasaporte Científico Antártico & World Money ($WLD)
* **Verificación World ID:** Autenticación de humanidad única (*Proof of Personhood*) vía `world.org/world-money` respetando la privacidad.
* **Sellos de Expedición:** Cada aporte aceptado genera un sello criptográfico inmutable en el historial del colaborador.
* **Mecanismo Antifraude:** La liberación de **World Money ($WLD)** se realiza **únicamente** cuando la observación es validada y aprobada por el comité científico revisor.

### 5. Consola MiroFish Simulation Engine
Consola independiente para análisis prospectivo y simulación de escenarios basada en un flujo de dos columnas:
* **Secuencia Ontológica (01–05):**
  1. *Ontology Generation:* Extracción de entidades y anclas fácticas.
  2. *Graph Construction:* Grafo dinámico de actores (buques, bases, biomasa, clima).
  3. *Parallel Simulation:* Simulación de interacción entre agentes en rondas virtuales.
  4. *Report Generation:* Reporte predictivo con puntos de inflexión y niveles de confianza.
  5. *Deep Interaction:* Consultas al modelo mediante `ReportAgent`.
* **Consola de Semillas (*Reality Seeds*):** Carga directa de documentos (PDF, MD, TXT hasta 50MB) o importación vía URLs de fuentes científicas abiertas.

### 6. Pythia Intelligence Stack (Ollama + Swarm Council)
* **Servidor Oráculo Local (`:8088`):** Inferencia 100% offline utilizando **Ollama** (`llama3.1`, `qwen3`) sin costos de consumo de APIs.
* **Consejo de Enjambre Antártico:** Deliberación multimodelo con 4 roles (*Ice Navigator*, *Marine Biologist*, *Naval Strategist*, *Skeptic*) ajustados por puntuación de Brier.
* **Anillos de Pronóstico Visuales:** Anillos pulsantes sobre el mapa GIS con horizontes de predicción: **24 Hours** (Rojo), **1 Week** (Naranja), **1 Month** (Púrpura) y **1 Year** (Azul).
* **Modo Kiosk (Bridge Display):** Modo ambiental a pantalla completa con rotación continua de mapa y telemetría flotante para pantallas del puente de mando.

---

## 🌐 Fuentes de Datos Científicos Abiertos

| Fuente Scientific Open Data | Tipo de Información | Aplicación en AMOH |
| :--- | :--- | :--- |
| **Quantarctica** *(Norwegian Polar Institute)* | Capas GIS de glaciología, topografía y batimetría | Relieve, batimetría y mapeo base |
| **Copernicus Marine Service** | Concentración de hielo marino y temperatura ($SST$) | Monitoreo de banquisa y deriva de hielo |
| **Global Fishing Watch (GFW API)** | Registros AIS y actividad pesquera en alta mar | Detección de pesca no declarada (IUU) |
| **SCAR / SOOS** | Biotelemetría, fauna y colonias antárticas | Registros de biodiversidad y conservación |
| **NOAA / NSIDC** | Extensión diaria e histórica de la banquisa | Tendencias y semillas para MiroFish / Pythia |

---

## 💰 Modelo Económico B2B / B2G

El uso de la plataforma y sus herramientas móviles es **100% libre y gratuito** para investigadores, tripulaciones y ciencia ciudadana. La sostenibilidad del proyecto se financia mediante servicios comerciales en backend:

* **APIs de Rutas e Hielo (B2B):** Suscripciones comerciales para navieras, cruceros y flotas pesqueras.
* **Datos MRV & Certificación ESG (B2B):** Reportes auditados de estado del hielo para aseguradoras marítimas y emisión de créditos de conservación.
* **Analítica Defensiva B2G:** Licencias gubernamentales para agencias estatales de control pesquero, seguridad y soberanía.

---

## 🚀 Instalación y Despliegue Local

### Requisitos Previos
* **Node.js**: v18.0.0 o superior
* **Python**: v3.10+ (para pipelines de fotogrametría)
* **Ollama**: Instalado localmente con los modelos `llama3.1` y `qwen3`

### Pasos de Configuración

```bash
# 1. Clonar el repositorio oficial
git clone [https://github.com/juanshuertas/antarctic-maritime-observation-hub.git](https://github.com/juanshuertas/antarctic-maritime-observation-hub.git)
cd antarctic-maritime-observation-hub

# 2. Instalar dependencias
npm install

# 3. Descargar modelos locales en Ollama
ollama pull llama3.1
ollama pull qwen3

# 4. Iniciar el servidor local
npm run dev

```

Accede a la plataforma desde `http://localhost:5174/`. Escanea el código QR desde cualquier teléfono en la misma red Wi-Fi para vincular la PWA de campo.

---

## 📂 Estructura del Proyecto

```
antarctic-maritime-observation-hub/
├── public/                  # Assets estáticos, íconos PWA y basemaps
├── src/
│   ├── components/          # Componentes UI (HUD, Leaflet Map, MiroFish, Pythia)
│   ├── gis/                 # Manejadores de capas Leaflet, DJI Raster y lector EXIF
│   ├── services/            # Conectores para Ollama (:8088), GFW API y Copernicus
│   ├── wallet/              # Integración World ID y contabilidad de $WLD
│   └── workers/             # Processors offline en segundo plano (IndexedDB)
├── server/                  # Proxy Node.js local para red interna del buque
├── index.html               # Entry point de la aplicación táctica
├── package.json             # Dependencias y scripts del proyecto
└── README.md                # Documentación principal del repositorio

```

---

## 🛡️ Seguridad, Privacidad & Descargo de Responsabilidad

* **Privacidad de Identidad:** La integración con **World ID** utiliza pruebas de conocimiento cero (*Zero-Knowledge Proofs*). No se almacenan nombres reales ni datos biométricos.
* **Aviso sobre el Pasaporte:** El *Pasaporte Científico Antártico* es un registro digital de contribuciones científicas y **no constituye un documento de viaje oficial**.
* **OWASP Compliance:** La carga de archivos y extracción de metadatos EXIF incorporan sanitización de datos para prevenir vulnerabilidades XSS, SQLi y ejecución remota de scripts.

```

```
