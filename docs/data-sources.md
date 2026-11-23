# Data sources & layers

> AIS, Global Fishing Watch, fauna, biodiversity, krill, satellite, Earth sciences, Quantarctica, SURIE, cables, connectivity.  
> Part of the [AMOH documentation](README.md).

## 🚢 AIS & maritime activity

AMOH can normalize maritime observations using fields such as:

```text
mmsi
vessel_name
vessel_type
timestamp_utc
latitude
longitude
speed_knots
course_deg
source
quality
geom
```

Potential analyses include:

- vessel tracks;
- maritime corridors;
- vessel density;
- route concentration;
- speed changes;
- signal gaps;
- voyage replay;
- field-observation matchups;
- tourism context;
- fisheries context;
- research-vessel activity.

#### Critical rule

```text
AIS absence ≠ vessel absence
```

An AIS gap cannot by itself prove disappearance, illegal activity or deliberate transponder deactivation.

---

## 🎣 Global Fishing Watch

AMOH is designed to integrate selected **Global Fishing Watch — GFW** data products when access, licensing and configuration allow.

Potential layers include:

- apparent fishing effort;
- AIS activity;
- VMS activity;
- vessel presence;
- fishing gear;
- vessel encounters;
- loitering;
- AIS gaps;
- port visits;
- optical detections;
- SAR detections;
- night-light detections.

Queries should be constrained by:

```text
VIEWPORT
+
TIME PERIOD
+
ACTIVE PRODUCT
```

instead of loading unnecessary global datasets.

---

### ⚠️ Fishing activity ≠ illegal fishing

AMOH does not automatically classify a vessel as illegal because of:

- apparent fishing activity;
- AIS gaps;
- SAR detection;
- vessel encounters;
- loitering;
- proximity to a protected area;
- activity hotspots.

These are signals that may require additional investigation.

Legal determinations require appropriate evidence and competent authorities.

---

## 🐋 Polar Fauna

AMOH includes a **Polar Fauna** interface for exploring species observations and biodiversity datasets.

Initial species groups include:

#### 🦐 Antarctic krill

A central component of the Southern Ocean food web.

#### 🐟 Antarctic toothfish

Relevant to Antarctic ecosystem and fisheries science.

#### 🐧 Penguins

Observation records can be connected with sea ice, tourism, fisheries and environmental variables.

#### 🦭 Weddell seal

Marine mammal records can be explored alongside environmental conditions.

#### 🐋 Humpback whale

Possible evidence can include:

- sightings;
- acoustic records;
- tags;
- field observations;
- historical records.

#### Orca

Observations can be represented individually or as aggregated scientific evidence.

#### Albatrosses and petrels

Seabird records can be connected with marine and fisheries context.

---

## 🧬 Biodiversity sources

Potential adapters include:

```text
OBIS
GBIF
IWC
CCAMLR
SCAR datasets
SOOS
AMOH Field
```

Each record should preserve:

```text
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
```

---

## 🦐 Krill Intelligence

A dedicated krill context can compare:

```text
KRILL
+
SEA ICE
+
WHALES
+
PENGUINS
+
SEALS
+
FISHERIES
+
OCEAN CONDITIONS
```

Spatial overlap can help identify monitoring priorities.

It does not establish ecological causality by itself.

---

## 🛰️ Satellite observations

AMOH can integrate satellite observations relevant to Antarctica.

Potential products include:

- Sentinel-1 SAR;
- Sentinel-2 optical imagery;
- Copernicus products;
- Earth Engine analyses;
- sea-ice observations;
- ocean-colour products;
- atmospheric products;
- night lights;
- vessel detections.

Every satellite observation should preserve, where available:

```text
source
satellite
sensor
acquisition_time
processing_time
resolution
quality
license
```

Satellite information must not automatically be labelled as real-time.

---

## 🌍 Earth Sciences

AMOH groups Earth-system observations into:

```text
ATMOSPHERE
OCEAN
CRYOSPHERE
LAND / COAST
BIOSPHERE
GEOPHYSICS
REMOTE SENSING
```

Potential outputs include:

- maps;
- time series;
- statistics;
- scenes;
- methodology;
- source;
- quality;
- uncertainty.

Analytical jobs may use:

```text
QUEUED
PROCESSING
COMPLETED
FAILED
CANCELLED
```

AMOH should never show fake progress when a remote provider does not expose real processing progress.

---

## 🧊 Quantarctica

AMOH is designed to connect with **Quantarctica** as an important Antarctic scientific-data environment.

Potential layers include:

- topography;
- bathymetry;
- glaciers;
- ice shelves;
- geology;
- research stations;
- protected areas;
- biological context;
- environmental management;
- infrastructure.

For browser performance AMOH should prefer optimized representations such as:

```text
PMTiles
MVT
COG
raster tiles
```

rather than loading full desktop GIS datasets directly into the browser.

---

### Offline Quantarctica packages

During an expedition, users may define:

```text
REGION
ROUTE CORRIDOR
FIELD SITES
LAYERS
RESOLUTION
```

and prepare a limited offline science package before departure.

---

## 🗺️ ArcGIS SURIE

AMOH supports on-demand comparison with the ArcGIS SURIE WebMap.

```text
WebMap ID:
de8bb6821bf148649f1e7b9154592a97
```

Potential comparison modes:

```text
SIDE BY SIDE
SWIPE
LINKED EXTENT
```

SURIE is loaded only when requested.

It is not required for AMOH startup.

---

## 🌐 Submarine cables

AMOH differentiates:

```text
SUBMARINE CABLES
```

from:

```text
SUBMARINES
```

These are not equivalent.

Public infrastructure records may include:

```text
cable_name
operator
landing_points
status
route_precision
source
retrieved_at
```

AMOH should never fabricate confidential or undocumented subsea infrastructure.

---

## 📡 Connectivity

AMOH can document connectivity conditions during expeditions.

Potential context:

- ship Wi-Fi;
- research-station networks;
- satellite Internet;
- Starlink where authorized;
- local LAN;
- cellular signal where available;
- latency;
- packet loss;
- offline periods.

The goal is to understand field connectivity.

It is not to identify or surveil individuals.

AMOH does not require:

```text
IMEI
IMSI
Advertising ID
```

as scientific device identifiers.
