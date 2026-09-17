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
