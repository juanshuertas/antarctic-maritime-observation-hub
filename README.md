🧊 Antarctic Maritime Observation Hub — AMOH

<p align="center">
  <strong>WORLD OCEANS LIVING OBSERVATORY</strong><br/>
  <em>Field Atlas · Live Ocean Intelligence · Antarctic Expeditions · Scientific Passport</em>
</p>

<p align="center">
  <a href="https://www.gnu.org/licenses/agpl-3.0">
    <img alt="License: AGPL-3.0" src="https://img.shields.io/badge/License-AGPL--3.0-2f81f7">
  </a>
  <img alt="Status: Prototype" src="https://img.shields.io/badge/Status-Prototype-35c3c8">
  <img alt="Frontend: React + Vite" src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-58d5e3">
  <img alt="Map: MapLibre" src="https://img.shields.io/badge/Map-MapLibre-72e0b5">
  <img alt="Backend: FastAPI" src="https://img.shields.io/badge/Backend-FastAPI-009688">
  <img alt="Spatial: DuckDB" src="https://img.shields.io/badge/Spatial-DuckDB-yellow">
  <img alt="AI: Pythia + MiroFish" src="https://img.shields.io/badge/AI-Pythia%20%2B%20MiroFish-a995ff">
  <img alt="Field: Offline capable" src="https://img.shields.io/badge/Field-Offline%20Capable-caf9f7">
</p>

<!--
README HERO IMAGE
Recommended: download the project image supplied by the author and save it inside the repository as:
docs/images/amoh-overview.png

GitHub renders repository-hosted images more reliably than Google Drive share links.
-->

<p align="center">
  <img src="docs/images/amoh-overview.png" alt="AMOH — World Oceans Living Observatory" width="100%">
</p>

<p align="center">
  <a href="#-qué-es-amoh">Qué es AMOH</a> ·
  <a href="#-live-lens">Live Lens</a> ·
  <a href="#-expediciones">Expediciones</a> ·
  <a href="#-field-connect">Field Connect</a> ·
  <a href="#-pasaporte-científico-antártico">Pasaporte</a> ·
  <a href="#-pythia--mirofish">AI</a> ·
  <a href="#-instalación">Instalación</a>
</p>

🌊 Qué es AMOH

Antarctic Maritime Observation Hub (AMOH) es un observatorio digital experimental para integrar, visualizar y documentar evidencia geoespacial del Océano Austral y la Antártida desde una sola interfaz.

El proyecto combina cartografía, actividad marítima, pesca, observación satelital, biodiversidad, hielo marino, infraestructura, fotogrametría DJI, datos de campo, expediciones científicas e inteligencia artificial local. Su objetivo no es crear “otro dashboard”, sino construir una infraestructura de observación trazable en la que cada dato pueda conservar su fuente, tiempo, ubicación, precisión, calidad, método y estado de revisión.

AMOH fue iniciado por Juan Sebastián Huertas Olea como proyecto independiente de investigación y desarrollo, con interés en la Península Antártica, el Océano Austral, la ciencia abierta, la observación participativa y la continuidad de datos entre expediciones.

Principio de producto: primero el océano, después los datos, luego el análisis y, solo cuando sea necesario, las herramientas.

English summary

AMOH — Antarctic Maritime Observation Hub is an experimental, map-first observatory for the Southern Ocean and Antarctica. It connects maritime activity, satellite observations, fisheries, biodiversity, field data, expedition workflows, local AI and scientific provenance in a single system designed to remain useful under intermittent connectivity.

🚧 Estado del proyecto

AMOH se encuentra en desarrollo activo / prototipo de investigación.

No todos los conectores descritos en este README están necesariamente habilitados en una instalación determinada. La disponibilidad depende de APIs, licencias, credenciales, permisos, conectividad y datasets configurados.

AMOH distingue explícitamente entre:

Estado

Significado

LIVE

El proveedor confirma datos actuales dentro de la latencia declarada

DELAYED

El dato es reciente, pero no en tiempo real

RECENT

Registro reciente dentro de una ventana definida

HISTORICAL

Dato histórico

STALE

El dato superó su ventana de actualización esperada

OFFLINE

El proveedor o enlace no está disponible

SIMULATION

Resultado de modelo o escenario, no observación

DEMO

Dato sintético o demostrativo

UNREVIEWED

Evidencia recibida sin revisión científica

VALIDATED

Registro revisado bajo un flujo científico definido

NOT_CONFIGURED

El adaptador existe, pero no tiene proveedor/credenciales configuradas

AMOH nunca debe presentar datos DEMO, SIMULATION, históricos o no configurados como si fueran LIVE.

🔬 Pregunta científica y contexto

AMOH nace de una pregunta práctica:

¿Dónde y cuándo se concentra la actividad humana en el entorno antártico, qué evidencia podemos observar alrededor de ella y dónde existen vacíos de monitoreo que merecen mayor atención científica?

El sistema está diseñado para reconciliar fuentes heterogéneas sin confundir correlación con causalidad:

trazas AIS y otras fuentes marítimas autorizadas;

observaciones satelitales ópticas y SAR;

hielo marino, atmósfera y variables oceánicas;

Global Fishing Watch y contexto pesquero;

biodiversidad y avistamientos;

fotografías y fotogrametría DJI;

observaciones realizadas desde buques, estaciones y dispositivos móviles;

productos de Quantarctica y otras infraestructuras científicas abiertas;

evidencia documental y resultados de expediciones.

Regla científica central

Observation ≠ Causation.

La coincidencia espacio-temporal entre un buque, una señal satelital, un animal, una observación humana o un cambio ambiental no demuestra por sí sola causalidad, ilegalidad, impacto ecológico ni intención.

🧭 Principios de diseño y operación

Map-first. El mapa es el espacio de trabajo principal y debe conservar la mayor parte del viewport.

Online-first, field-offline-capable. En operación normal AMOH aprovecha fuentes online; en territorio/expedición, la captura y revisión crítica pueden continuar sin Internet público.

Un solo mapa principal. La home utiliza un único motor MapLibre y evita montar múltiples renderers pesados simultáneamente.

Carga bajo demanda. Pesquerías, SURIE, Quantarctica, analítica avanzada, Pasaporte, Expediciones, World y simulaciones se cargan solo cuando el usuario las solicita.

Provenance by default. Todo dato importante conserva fuente, tiempo UTC, licencia, precisión, calidad, método y revisión.

Cero interferencia. Las observaciones de campo se adaptan a la operación real de la expedición; AMOH no exige alterar la ruta del buque.

Privacidad mínima necesaria. El sistema no necesita almacenar biometría para operar.

AI ≠ scientific validation. La IA puede resumir, priorizar, comparar o proponer hipótesis; no sustituye la revisión científica.

Graceful degradation. Si GFW, AIS, SURIE, World, Pythia o cualquier proveedor externo falla, el observatorio debe seguir funcionando.

Rendimiento antes que densidad visual. AMOH evita miles de marcadores DOM, capas globales innecesarias y renderers redundantes.

🗺️ Live Lens

Live Lens es la pantalla principal del observatorio.

La referencia visual combina la identidad propia de AMOH con patrones de interacción inspirados en plataformas de inteligencia geoespacial abiertas: navegación fluida, filtros compactos, selección de entidades, capas semánticas, agrupación por escala y paneles contextuales.

Modos de mapa

MAP — vista cartográfica ligera;

GLOBE — proyección global enfocada en el hemisferio sur;

SAT — base satelital cuando el proveedor está configurado;

SURIE — comparación bajo demanda con el WebMap de ArcGIS SURIE.

EARTH 3D no forma parte de la home actual: se retiró para reducir carga gráfica y evitar múltiples contextos WebGL.

Filtros de entidades

El rail de filtros puede activar, según disponibilidad:

🚢 Buques

✈️ Vuelos

🛰️ Satélites

🐟 Pesquerías

🐋 Fauna

〰️ Cables submarinos / infraestructura subsea

Los íconos en la aplicación deben utilizar una familia vectorial consistente; los emojis anteriores solo representan las categorías en este README.

Semantic zoom

Escala

Representación

Global

densidad, clusters y capas agregadas

Regional

categorías, corredores y eventos relevantes

Local

entidades individuales, trayectorias y evidencia

🎣 Global Fishing Watch

AMOH integra Global Fishing Watch (GFW) como una fuente de contexto pesquero bajo demanda.

La interfaz puede incorporar, cuando el proveedor y sus productos lo permiten:

esfuerzo pesquero aparente;

presencia AIS/VMS;

arte de pesca;

embarcaciones seleccionadas;

encuentros;

comportamiento de deriva/loitering;

discontinuidades AIS;

visitas a puerto;

detecciones ópticas;

SAR;

night lights.

La consulta se limita al viewport, periodo y producto activo, evitando cargar mapas globales completos.

Importante

AMOH no etiqueta automáticamente una embarcación como “ilegal” por ausencia AIS, detección SAR, actividad aparente, encuentro o presencia en un hotspot. Esas señales son contexto para revisión; una conclusión legal requiere evidencia y autoridad competentes.

🐋 Fauna polar y biodiversidad

La capa Fauna Polar permite explorar registros relacionados con especies clave del Océano Austral.

La experiencia inicial contempla iconografía individual para:

Krill antártico

Merluza negra / Antarctic toothfish

Pingüinos

Foca de Weddell

Ballena jorobada

Orca

Albatros y petreles marinos

Adaptadores potenciales incluyen OBIS, GBIF, IWC, CCAMLR, SCAR/SOOS y observaciones AMOH Field.

Cada registro debe conservar su procedencia y, cuando aplique:

scientific_name
common_name
source
dataset
observed_at_utc
latitude
longitude
coordinate_precision
quality
review_state
license
retrieved_at

AMOH puede visualizar superposición espacial entre fauna, pesca, hielo, turismo y actividad marítima, pero superposición no equivale a impacto causal.

🧊 Quantarctica, SCAR y SURIE

Quantarctica

Quantarctica funciona como catálogo científico y paquete de campo, no como un segundo mapa independiente.

Las capas seleccionadas pueden cubrir:

topografía;

glaciología;

ice shelves;

geología;

biología;

estaciones;

áreas protegidas;

gestión ambiental;

infraestructura y contexto polar.

Para rendimiento web, AMOH prioriza formatos optimizados como PMTiles/MVT para vectores y COG/tiles para rásteres.

En expedición pueden prepararse paquetes offline limitados al corredor de navegación o zona de trabajo.

ArcGIS SURIE

AMOH contempla integración bajo demanda con el WebMap SURIE:

WebMap ID:
de8bb6821bf148649f1e7b9154592a97

La comparación puede realizarse mediante vista dividida o extensión sincronizada, siempre que el SDK, permisos y rendimiento lo permitan.

SCAR OSC 2026

AMOH enlaza el trabajo presentado en SCAR Open Science Conference 2026 mediante acceso directo al póster correspondiente:

Poster gallery — Abstract / Poster #1820
https://virtual.oxfordabstracts.com/event/75327/poster-gallery/grid?sort=titles&current=1820

La interfaz puede utilizar el logotipo oficial de SCAR 2026 únicamente respetando sus condiciones de uso y sin implicar patrocinio o respaldo institucional.

🌍 Ciencias de la Tierra

AMOH organiza variables del Sistema Tierra en dominios:

atmósfera;

océano;

criósfera;

costa/tierra;

biosfera;

geofísica;

teledetección.

Los análisis satelitales o de Earth Engine se ejecutan como trabajos bajo demanda, no como carga inicial de la home.

Estados de job recomendados:

QUEUED
PROCESSING
COMPLETED
FAILED
CANCELLED

Las visualizaciones pueden incluir:

mapas;

series temporales;

estadísticas;

escenas;

metodología;

calidad;

fuente;

fecha de adquisición.

No se debe mostrar progreso falso si el proveedor no expone un progreso real.

📡 AIS, rutas y actividad marítima

La capa marítima normaliza:

mmsi
vessel_name
vessel_type
timestamp_utc
speed_knots
course_deg
source
quality
geom

AMOH puede construir:

trayectorias;

corredores;

densidad;

cambios de velocidad;

gaps de señal;

coincidencias espacio-temporales con observaciones de campo;

contexto de investigación, turismo, pesca y logística.

Ausencia AIS ≠ ausencia de buque.

🌐 Cables submarinos e infraestructura

AMOH diferencia explícitamente entre cables submarinos / infraestructura subsea y activos navales.

Cuando una fuente pública lo permita, una entidad de cable puede incluir:

name
operator
landing_points
status
route_precision
source
retrieved_at

Las rutas deben representarse con precisión acorde con la fuente y nunca inventarse cuando el trazado público no está disponible.

📸 DJI y fotogrametría

AMOH puede ingerir fotografías de drones DJI y extraer metadatos EXIF/XMP como:

GPS;

altitud;

altitud relativa;

pitch, roll, yaw;

modelo de cámara;

distancia focal;

ancho de imagen;

timestamp;

hash del archivo.

Ground Sample Distance — GSD

Cuando el ancho físico del sensor está disponible:

$$
GSD = \frac{Sw \times H \times 100}{Fr \times ImW}
$$

donde:

$Sw$ = ancho del sensor en mm;

$H$ = altura sobre el terreno en m;

$Fr$ = focal en mm;

$ImW$ = ancho de imagen en píxeles;

$GSD$ = cm/px.

AMOH no inventa el ancho del sensor. Si el modelo de cámara no puede resolverse con una fuente confiable, el GSD se marca como no disponible.

Los ortomosaicos pueden ser procesados externamente con herramientas compatibles como OpenDroneMap o DJI Terra y luego cargados como capas georreferenciadas.

📱 Field Connect

AMOH Field Connect convierte teléfonos y tabletas en nodos voluntarios de observación.

PWA

La PWA puede utilizar, cuando el navegador y los permisos lo permiten:

GPS;

precisión de ubicación;

altitud;

heading;

velocidad;

cámara;

orientación;

movimiento;

timestamp;

estado de red;

formularios de campo.

Los registros se almacenan localmente en IndexedDB y posteriormente se sincronizan con el Edge Node.

Estados recomendados:

LOCAL
QUEUED
SYNCING
SERVER_RECEIVED
UNDER_REVIEW
APPROVED
REJECTED
FAILED

QR de red local

En una red de buque o estación, el QR debe resolver una dirección LAN real:

http://<LAN_IP>:5174/

Nunca debe anunciar:

localhost
127.0.0.1
0.0.0.0

El backend puede exponer GET /api/network-info para resolver la dirección LAN de forma controlada.

Android Field Node

Una aplicación Android opcional puede ampliar la captura mediante:

ubicación fusionada;

acelerómetro;

giroscopio;

magnetómetro;

vector de rotación;

barómetro, si el dispositivo lo incluye;

batería y conectividad;

Nearby Connections para transferencia local.

AMOH debe descubrir las capacidades reales del equipo y no asumir que cada teléfono posee todos los sensores.

Perfiles de muestreo:

ECO
SURVEY
BURST

El modo BURST debe ser temporal para proteger batería, almacenamiento y estabilidad.

🧭 Expediciones

/expeditions transforma AMOH en un sistema de continuidad científica entre preparación, territorio, revisión y memoria.

Modelo:

EXPEDITION
   ↓
VOYAGE
   ↓
FIELD SESSION
   ↓
DEVICE
   ↓
OBSERVATION
   ↓
EVIDENCE
   ↓
MATCHUP
   ↓
SCIENTIFIC REVIEW
   ↓
VALIDATED OUTPUT
   ↓
PASSPORT

National Geographic–Lindblad Visiting Scientist concept

AMOH incluye un workspace para una propuesta/aplicación de investigación adaptada al contexto del Visiting Scientist Program — Southern Ocean 2027–2028.

Estado recomendado mientras no exista confirmación oficial:

PROPOSAL

La propuesta se centra en integrar:

AIS
+
SATELLITE
+
FIELD OBSERVATION
↓
MATCH
↓
REVIEW
↓
OUTPUT

La presencia de este módulo no implica selección, financiación, patrocinio ni respaldo de National Geographic o Lindblad Expeditions.

Programa Antártico Colombiano — PAC

AMOH contempla un segundo template de expedición para el Programa Antártico Colombiano, capaz de modelar campañas sucesivas sin hardcodear el número o temporada.

El ciclo puede cubrir:

CALL / APPLICATION
→ EVALUATION
→ SELECTION
→ PREPARATION
→ TRAINING
→ MEDICAL / ADMIN READINESS
→ LOGISTICS
→ DEPLOYMENT
→ FIELD SCIENCE
→ RETURN
→ REPORTING
→ SCIENTIFIC PRODUCTS
→ LESSONS LEARNED
→ ARCHIVE

El sistema diferencia entre PROPOSAL, SELECTED, ACTIVE, COMPLETED y otros estados, evitando que una propuesta aparezca como participación confirmada.

Science Hub

Cada expedición puede exponer un Science Hub QR para tres tipos de contribución:

investigador/científico;

staff de expedición;

invitado/comunidad.

Pipeline obligatorio:

SUBMIT
↓
REVIEW
↓
MATCH
↓
USE

Nada se transforma automáticamente en ciencia validada.

🪪 Pasaporte Científico Antártico

El AMOH Antarctic Scientific Passport es una credencial científica interactiva y un registro de participación.

Prototipo de pasaporte científico. No es un documento de viaje.

Puede reunir:

identidad pública del participante;

expediciones;

sesiones de campo;

observaciones validadas;

sellos científicos;

datasets;

publicaciones;

credenciales;

logros;

rutas y lugares;

historial de contribuciones.

El Pasaporte no sustituye un pasaporte legal, visa, credencial gubernamental o autorización expedicionaria.

Diseño

La experiencia combina:

objeto editorial tipo pasaporte;

cartografía polar;

sellos;

security-pattern graphics originales;

smart card científica;

interfaz móvil minimalista.

AMOH no replica documentos oficiales ni arte protegido de otros proyectos.

Estados

DRAFT
ACTIVE
SUSPENDED
EXPIRED

Un usuario no recibe automáticamente estado ACTIVE; debe existir un flujo de emisión definido.

🌐 World ID y recompensas WLD

La integración con World es opcional y separa tres conceptos:

AMOH identity — cuenta y perfil científico;

World verification — verificación de persona/human uniqueness cuando el producto y región lo permiten;

Scientific validation — revisión científica de la contribución.

Una verificación World no demuestra formación científica, institución, autoría ni calidad del dato.

AMOH no necesita almacenar biometría.

Flujo de recompensa

MISSION COMPLETE
↓
SUBMISSION
↓
SCIENTIFIC REVIEW
↓
APPROVED
↓
REWARD ELIGIBILITY
↓
WORLD VERIFICATION
↓
ANTI-FRAUD
↓
BUDGET CHECK
↓
AUTHORIZED
↓
PROCESSING
↓
WORLD WALLET
↓
PAID / CONFIRMED

Estados sugeridos:

NOT_ELIGIBLE
PENDING_SCIENTIFIC_REVIEW
ELIGIBLE
PENDING_WORLD_VERIFICATION
AUTHORIZED
PROCESSING
PAID
FAILED
REVOKED

PENDING nunca debe liberar una recompensa. Solo una observación científicamente APPROVED puede avanzar hacia elegibilidad.

WLD es un mecanismo opcional de incentivo; AMOH no es una aplicación de trading y no muestra precios, gráficas especulativas ni promesas de rentabilidad.

🧠 Pythia & MiroFish

Pythia Intelligence Stack

Pythia es la capa analítica local de AMOH.

Configuración objetivo:

Pythia server: :8088
Local inference: Ollama
Models: llama3.1 / qwen3 or configured equivalents

Consejo de agentes:

Ice Navigator — hielo, navegabilidad y contexto de ruta;

Marine Biologist — biodiversidad, fauna y contexto ecológico;

Naval Strategist — patrones marítimos/AIS desde una perspectiva analítica no operativa;

Skeptic — incertidumbre, contradicciones y falsos positivos.

La UI debe marcar sus respuestas como:

AI ANALYSIS

Toda respuesta relevante debe poder referenciar evidencia, fuente, tiempo, lugar, supuestos y limitaciones.

Pythia no sustituye:

comandante;

autoridad de navegación;

médico;

comité científico;

revisor;

autoridad legal.

Brier weighting

Para pronósticos probabilísticos verificables:

$$
BS_i = \frac{1}{N}\sum_{t=1}^{N}(f_{i,t}-o_t)^2
$$

$$
W_i = \frac{(1-BS_i)^2}{\sum_{j=1}^{K}(1-BS_j)^2}
$$

Los tests deben cubrir, como mínimo:

agente perfecto;

agente deficiente;

pesos iguales;

datos faltantes;

un único agente.

Forecast Rings

Horizontes experimentales:

24H
1W
1M
1Y

Todo Forecast Ring debe indicar claramente:

SIMULATION
generated_at
model
horizon
assumptions
evidence
limitations

Nunca debe confundirse una simulación con una observación.

MiroFish

MiroFish funciona como motor prospectivo desacoplado con el flujo:

01 / Ontology Generation
02 / Graph Construction
03 / Parallel Simulation
04 / Report Generation
05 / Deep Interaction

AMOH debe utilizar un adaptador sobre el motor disponible en lugar de reimplementarlo sin necesidad.

🧪 Matchups y revisión científica

AMOH puede combinar:

FIELD OBSERVATION
+
AIS
+
SATELLITE
+
ENVIRONMENTAL CONTEXT

para producir un ScientificMatchup.

Estados:

MATCH
PARTIAL_MATCH
NO_MATCH
DATA_GAP
CONFLICT

Un conflicto entre fuentes se conserva como información científica; no debe ocultarse para “mejorar” la narrativa.

Ejemplo de modelo:

matchup_id
expedition_id
observation_id
ais_evidence_ids[]
satellite_evidence_ids[]
time_delta_seconds
distance_meters
quality
uncertainty
status
reviewer
reviewed_at
notes

🗄️ Data Fabric y DuckDB Spatial

AMOH utiliza DuckDB Spatial como motor analítico local.

En provisioning conectado:

INSTALL spatial;

En ejecución:

LOAD spatial;

En modo de campo offline, la extensión debe estar preparada previamente; la aplicación no debe intentar descargarla silenciosamente.

Vessel tracks

CREATE TABLE vessel_tracks (
    mmsi VARCHAR,
    vessel_name VARCHAR,
    vessel_type VARCHAR,
    timestamp TIMESTAMP,
    speed_knots DOUBLE,
    course_deg DOUBLE,
    geom GEOMETRY,
    dark_vessel_flag BOOLEAN DEFAULT FALSE
);

Passport claims

CREATE TABLE passport_claims (
    claim_id UUID PRIMARY KEY,
    nullifier_hash VARCHAR,
    investigator_did VARCHAR,
    observation_type VARCHAR,
    timestamp TIMESTAMP,
    location GEOMETRY,
    status VARCHAR,
    reward_wld_amount DOUBLE DEFAULT 0
);

Forecast rings

CREATE TABLE forecast_rings (
    ring_id UUID PRIMARY KEY,
    horizon_code VARCHAR,
    confidence_score DOUBLE,
    prophecy_text TEXT,
    center_geom GEOMETRY,
    radius_meters DOUBLE
);

Reward ledger

reward_id
user_id
campaign_id
activity_id
observation_id
scientific_status
reward_status
reward_wld
approved_by
approved_at
world_verification_reference
wallet_transaction_reference
created_at

Expedition data

El modelo de expedición puede incorporar:

expeditions
expedition_members
expedition_voyages
expedition_sessions
expedition_routes
expedition_devices
field_observations
observation_media
scientific_matchups
review_events
expedition_outputs
sync_jobs

🌐 Fuentes y adaptadores de datos

AMOH se diseña alrededor de adaptadores. Un adaptador presente en el código no significa que la fuente esté habilitada o incluida por licencia.

Fuente / familia

Uso potencial

Quantarctica

topografía, glaciología, geología, cartografía polar

Copernicus Marine

océano, SST, hielo y variables marinas

Sentinel-1

observación SAR

Sentinel-2

observación óptica

Global Fishing Watch

actividad pesquera y contexto marítimo

SCAR / SOOS

ciencia antártica y datasets relacionados

OBIS / GBIF

biodiversidad

IWC

cetáceos, cuando la fuente/dataset aplicable esté disponible

CCAMLR

ecosistema marino y contexto pesquero/regulatorio

NOAA / NSIDC

hielo y variables atmosféricas/marinas

USGS / GEOFON

sismicidad

AIS providers

posición y trazas de buques

ArcGIS SURIE

referencia/visualización comparativa

AMOH Field

observaciones originales de expedición

Cada conector debe documentar:

provider
endpoint / dataset
license
attribution
authentication
refresh policy
latency
spatial precision
temporal precision
normalization method
failure behavior

📊 Visualización científica

AMOH aplica tres reglas simples:

1. Missing ≠ zero

Si un dato no existe, la gráfica debe mostrar un gap, no un cero inventado.

2. Tooltip trazable

Cada punto o serie relevante debe exponer:

value
unit
UTC
source
quality
evidence

3. Diferenciar evidencia y simulación

observación: línea/símbolo continuo;

interpolación: estilo discontinuo;

simulación: estilo diferenciado y etiqueta SIMULATION.

🎥 Cámaras y observación remota

Una cámara solo aparece como LIVE si existe un stream real configurado.

Una tarjeta de cámara debe mostrar, cuando exista:

operator
location
status
timestamp
permissions
source

No se deben mostrar imágenes genéricas haciéndolas pasar por streams reales.

Detecciones automáticas sobre imagen deben iniciar como:

UNREVIEWED

Audio desactivado por defecto.

🧳 Turismo antártico

AMOH puede representar rutas turísticas, operadores, zonas de visita y presión espacial cuando las fuentes lo permitan.

El módulo debe separar:

ruta planificada;

ruta publicada;

ruta observada;

temporada;

operador;

fuente;

periodo de validez.

Las proyecciones futuras deben etiquetarse como escenario, no como itinerario confirmado.

⚖️ Oceanopolítica, Tratado y seguridad

AMOH puede integrar contexto público sobre:

Sistema del Tratado Antártico;

áreas protegidas;

presencia científica;

logística;

pesca;

turismo;

infraestructura;

conectividad;

eventos ambientales;

cooperación internacional.

El módulo se orienta a análisis científico, diplomático y de políticas públicas basado en fuentes abiertas, no a targeting, seguimiento de personas, scoring hostil o instrucciones operativas de defensa.

☢️ Legado radiológico y contaminación

El roadmap de AMOH puede incorporar datasets públicos sobre:

pruebas nucleares históricas;

accidentes de reactores;

descargas documentadas;

radionúclidos marinos;

contaminación;

acidificación y calentamiento como estresores combinados.

Cada evento debe mostrar fuente, periodo, geografía, incertidumbre y naturaleza histórica/actual. La plataforma no debe inferir contaminación presente a partir de un evento histórico sin evidencia de medición.

🛰️ Conectividad y señal

AMOH puede documentar disponibilidad de comunicaciones en expedición:

Wi‑Fi de buque/estación;

Internet satelital;

conectividad celular cuando exista;

latencia;

pérdida de enlace;

disponibilidad local LAN.

La telemetría de conectividad debe enfocarse en calidad del enlace y operación de campo; AMOH no requiere identificadores invasivos como IMEI, IMSI o advertising IDs para identificar un dispositivo.

🎨 Ciencia, arte y cultura oceánica

Como extensión opcional, AMOH contempla un espacio de galería para:

fotografía oceánica;

obra de expedición;

visualización científica;

realidad aumentada;

proyectos de arte y ciencia.

La publicación de una obra debe conservar:

author
title
date
source
license / permission
credit

No se reutilizan fotografías, concursos o assets de terceros sin permiso/licencia verificable.

🎓 Grants & Opportunities

Un módulo opcional de oportunidades puede estructurar:

opportunity
organization
theme
region
deadline
eligibility
funding
source
status
matched_need

Pythia puede ayudar a detectar coincidencias entre necesidades científicas del territorio y convocatorias, pero la elegibilidad final debe verificarse en la fuente oficial.

🔐 Seguridad y privacidad

AMOH adopta una postura defensiva.

Aplicación

queries SQL parametrizadas;

validación de inputs;

protección XSS;

evitar dangerouslySetInnerHTML salvo sanitización explícita;

CORS restringido;

validación de Host en despliegues LAN;

protección ante DNS rebinding;

CSRF cuando aplique;

rate limits;

permisos por rol;

auditoría de acceso.

Uploads

Validar:

MIME
extension
size
magic bytes
generated filename
safe destination
hash

LAN

La disponibilidad en una red local no equivale a confianza implícita.

World

No almacenar biometría de World ID. El sistema conserva solo el resultado mínimo de verificación requerido por el flujo.

Dispositivos

Permisos granulares para:

ubicación;

cámara;

movimiento;

orientación;

salud, solo en estudios específicos y con opt-in separado.

Defensive testing

Las pruebas OWASP WSTG se limitan a entornos AMOH propios/autorizados. No se realizan escaneos ofensivos de terceros desde el proyecto.

🧩 Arquitectura

┌──────────────────────────────────────────────────────────────┐
│                         AMOH HOME                            │
│                World Oceans Living Observatory              │
├──────────────────────────────────────────────────────────────┤
│  MapLibre Live Lens                                         │
│  MAP · GLOBE · SAT · SURIE                                  │
│  Buques · Vuelos · Satélites · Pesca · Fauna · Cables       │
└─────────────────────────────┬────────────────────────────────┘
                              │
                       AMOH DATA FABRIC
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  ONLINE ADAPTERS       FIELD / EDGE          SCIENCE LAYERS
  AIS / GFW / APIs      PWA / Android         Quantarctica
  Satellite / Weather   DuckDB / LAN          SURIE / COG/MVT
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    PROVENANCE + REVIEW
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
          PYTHIA          EXPEDITIONS       PASSPORT
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                         MIROFISH
                     scenario simulation

Regla de rendimiento

La home no debe montar simultáneamente todos los módulos.

HOME
 └─ MapLibre core
      ├─ AIS / basic science
      └─ user action
          ├─ GFW          lazy
          ├─ Fauna        lazy
          ├─ Quantarctica lazy
          ├─ SURIE        lazy
          ├─ Pythia       lazy
          ├─ Expeditions  lazy
          └─ Passport     lazy

🧱 Stack tecnológico

Frontend

React
Vite
MapLibre GL JS
IndexedDB
PWA

Backend

Python 3.12+
FastAPI
DuckDB
DuckDB Spatial

Edge / AI

Ollama
Pythia
MiroFish adapter

Integraciones opcionales

ArcGIS Maps SDK / SURIE
Global Fishing Watch
World / World ID
Google Cloud / BigQuery
Earth Engine
external AIS providers
scientific open-data APIs

🔌 API de referencia

La implementación puede exponer endpoints como:

GET  /api/health
GET  /api/system/status
GET  /api/network-info

GET  /api/vessels
GET  /api/observations
POST /api/observations

GET  /api/forecast-rings

GET  /api/expeditions
GET  /api/expeditions/:id
GET  /api/expeditions/:id/observations
GET  /api/expeditions/:id/devices

GET  /api/missions
GET  /api/achievements
GET  /api/profile/progress
GET  /api/rewards

GET  /api/passport/me
GET  /api/passport/journey
GET  /api/passport/stamps
GET  /api/passport/credentials

La lista real debe mantenerse sincronizada con las rutas implementadas.

⚙️ Variables de entorno

Nunca publiques secretos en Git.

Ejemplo:

# Frontend
PORT=5174
HOST=0.0.0.0
VITE_API_URL=http://localhost:8000
VITE_PYTHIA_URL=http://localhost:8088

# Backend
DUCKDB_PATH=./app/data/amoh_spatial.duckdb

# Optional providers
VITE_SURIE_WEBMAP_ID=de8bb6821bf148649f1e7b9154592a97
GFW_API_TOKEN=
AIS_API_KEY=
GOOGLE_CLOUD_PROJECT=
EARTH_ENGINE_PROJECT=

# Optional World integration
WORLD_APP_ID=
WORLD_ACTION_ID=

Usa .env.example con valores vacíos/documentados y conserva .env fuera del repositorio.

🚀 Instalación

Requisitos

Herramienta

Recomendación

Git

2.30+

Node.js

versión soportada por el package.json actual

Python

3.12+

Docker / Docker Compose

estable reciente

Ollama

opcional, para AI local

Clonar

git clone https://github.com/juanshuertas/antarctic-maritime-observation-hub.git
cd antarctic-maritime-observation-hub

Frontend

npm install
npm run dev -- --host 0.0.0.0 --port 5174

Abrir:

http://localhost:5174/

Backend

Windows PowerShell

python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

Linux / macOS

python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

Pythia local

Con Ollama instalado:

ollama pull llama3.1
ollama pull qwen3

Iniciar el servicio AMOH/Pythia de acuerdo con los scripts del repositorio. La configuración objetivo utiliza:

http://localhost:8088

Docker

Cuando docker-compose.yml esté configurado para el estado actual del repositorio:

docker compose up --build -d
docker compose ps

🚢 Operación en LAN / buque

El frontend puede exponerse en la red local:

http://<LAN_IP>:5174/

El QR de Conectar celular debe utilizar esa dirección real.

Un despliegue Edge típico:

Laptop / Edge Node
├─ React/Vite or production frontend
├─ FastAPI
├─ DuckDB Spatial
├─ local map packages
├─ IndexedDB sync gateway
├─ Pythia/Ollama
└─ selective cloud sync

La pérdida de Internet público no debe impedir:

nueva observación;

GPS;

fotos;

notas;

almacenamiento local;

sincronización LAN;

revisión local;

datasets offline preparados;

consulta de expedición y Pasaporte almacenados localmente.

☁️ Sincronización cloud

Cuando existe conectividad, AMOH puede sincronizar selectivamente con infraestructura cloud.

Usos potenciales:

backup;

publicación de observaciones validadas;

almacenamiento de media autorizado;

BigQuery para análisis históricos;

tareas batch;

acceso remoto.

No se recomienda enviar por defecto todos los streams de sensores crudos. El sistema prioriza:

metadata
validated observations
selected media
scientific outputs
essential state

🧪 Testing

Antes de declarar una build estable:

npm run build
npm run lint
npm test

Usa únicamente los scripts que realmente existan en package.json.

Casos mínimos:

home y mapa;

un solo MapLibre/WebGL;

filtros;

AIS;

GFW load/error/unload;

fauna;

SURIE load/error/unload;

offline queue;

IndexedDB persistence;

QR LAN;

GSD;

Brier;

Passport state machine;

reward gating;

Expeditions navigation;

responsive layout;

provider failure.

No declarar una prueba como exitosa si no se ejecutó.

⚡ Performance

Objetivo de la home:

1 MapLibre instance
1 WebGL context
minimal default layers
no ArcGIS at startup
no World SDK at startup
no Passport bundle at startup
no Expeditions bundle at startup
no MiroFish at startup
no global GFW heatmap at startup

Medir:

initial requests
transferred MB
map-ready time
interactive time
FPS
WebGL contexts
MapLibre sources
MapLibre layers
visible entities
memory

La optimización debe demostrarse con métricas, no solo con la palabra “optimized”.

📂 Estructura de referencia

La estructura exacta puede evolucionar con el repositorio; una organización típica es:

antarctic-maritime-observation-hub/
├── app/
│   ├── main.py
│   ├── db.py
│   └── routers/
├── services/
│   ├── pythia/
│   ├── mirofish/
│   └── adapters/
├── src/
│   ├── components/
│   ├── gis/
│   ├── field/
│   ├── expeditions/
│   ├── passport/
│   ├── science/
│   └── services/
├── public/
├── docs/
│   └── images/
│       └── amoh-overview.png
├── docker-compose.yml
├── package.json
├── requirements.txt
├── .env.example
├── LICENSE
└── README.md

Documenta la estructura real del repositorio si difiere de este esquema.

🧭 Roadmap

Core

Live Lens MapLibre ligero;

filtros de entidades;

AIS;

GFW;

fauna;

cables submarinos;

Quantarctica;

SURIE;

Pythia.

Field

PWA;

Android Field Node;

sensores;

LAN pairing;

offline queue;

Edge Node.

Expeditions

NatGeo proposal workspace;

PAC expedition template;

Science Hub;

matchups;

review;

outputs;

voyage replay.

Passport

identidad científica;

journey;

stamps;

credentials;

smart card;

World verification opcional;

WLD reward gating.

Science & Culture

Earth Science;

turismo;

radiological legacy;

connectivity;

cameras;

grants;

art/science gallery.

💼 Sostenibilidad

El núcleo científico puede mantenerse abierto mientras se exploran modelos de sostenibilidad para servicios avanzados, por ejemplo:

APIs de contexto marítimo/hielo;

servicios de integración;

deployments Edge;

analítica para investigación;

reportes de procedencia;

infraestructura de datos;

soporte institucional.

Estas líneas representan posibilidades de desarrollo, no productos comerciales garantizados ni certificaciones existentes.

🤝 Contribuciones

Las contribuciones son bienvenidas cuando respetan:

trazabilidad;

licencias de datos;

privacidad;

reproducibilidad;

seguridad;

rendimiento;

separación entre observación, inferencia y simulación.

Antes de abrir un PR:

1. Revisa issues existentes.
2. Mantén cambios pequeños y trazables.
3. No incluyas secretos ni datos sensibles.
4. Documenta nuevas fuentes y sus licencias.
5. Añade tests cuando corresponda.
6. No etiquetes datos simulados como reales.

📚 Investigación, poster y expediciones

SCAR OSC 2026

Póster / Abstract #1820:

https://virtual.oxfordabstracts.com/event/75327/poster-gallery/grid?sort=titles&current=1820

National Geographic–Lindblad concept

AMOH contiene una adaptación de investigación preparada para un contexto de expedición Southern Ocean 2027–2028. Su presencia en el repositorio se considera proposal/research concept salvo confirmación externa posterior.

Programa Antártico Colombiano

La arquitectura de Expediciones permite modelar campañas del Programa Antártico Colombiano y mantener continuidad entre temporadas sin convertir una propuesta en participación confirmada.

⚠️ Independencia y marcas

AMOH es un proyecto independiente.

Las referencias a SCAR, National Geographic, Lindblad Expeditions, Global Fishing Watch, World, ArcGIS, Quantarctica, Copernicus, Google, DJI, CCAMLR, OBIS, GBIF, IWC u otras organizaciones describen programas, fuentes, tecnologías o integraciones de interés.

A menos que se indique explícitamente mediante documentación verificable, su mención no implica patrocinio, asociación, selección, aval, certificación ni respaldo institucional.

Todas las marcas pertenecen a sus respectivos titulares.

🛡️ Licencia

Este README conserva la licencia indicada por el repositorio fuente:

GNU Affero General Public License v3.0 — AGPL-3.0

Consulta LICENSE.

Antes de publicar, verifica que el archivo LICENSE del repositorio coincida con este badge y con esta sección.

👤 Autor

Juan Sebastián Huertas Olea
Creator / Research & Product Lead — AMOH

Antarctic Maritime Observation Hub
World Oceans Living Observatory

<p align="center">
  <strong>Observe · Document · Understand · Preserve</strong>
</p>

<p align="center">
  <em>A living scientific record of our relationship with the Southern Ocean.</em>
</p>
