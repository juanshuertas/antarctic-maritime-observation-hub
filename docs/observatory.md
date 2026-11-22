# Observatory: map, globe & filters

> World Oceans Living Observatory, Live Lens, Antarctic Globe, filters and semantic zoom.  
> Part of the [AMOH documentation](README.md).

## 🌐 World Oceans Living Observatory

> **One connected ocean. Evidence to understand it.**

AMOH begins with Antarctica and the Southern Ocean, but its long-term concept is broader:

```text
OCEAN
+
SATELLITES
+
VESSELS
+
FISHERIES
+
BIODIVERSITY
+
FIELD OBSERVATIONS
+
EXPEDITIONS
+
SCIENTIFIC DATA
+
ARTIFICIAL INTELLIGENCE
+
HUMAN PARTICIPATION
```

The objective is not simply to collect more data.

The objective is to connect evidence while preserving:

```text
SOURCE
TIME
LOCATION
PRECISION
QUALITY
METHOD
LICENSE
PROVENANCE
REVIEW STATE
```

## 🗺️ Live Lens

**Live Lens** is the main AMOH workspace.

The map is the product.

The interface is designed so that Antarctica and the Southern Ocean remain visually dominant while controls and analytical panels appear only when requested.

#### Map modes

```text
MAP
GLOBE
SAT
SURIE
```

AMOH intentionally avoids loading multiple heavy globe engines at startup.

The home experience uses a single primary geospatial renderer.

---

## 🌍 Antarctic Globe

The primary globe is oriented toward the Southern Hemisphere.

Main geographic areas include:

- Antarctica;
- Antarctic Peninsula;
- Drake Passage;
- Scotia Sea;
- South Shetland Islands;
- Southern Ocean;
- sub-Antarctic gateways.

The interface can progressively display:

```text
VESSELS
FLIGHTS
SATELLITES
FISHERIES
FAUNA
PROTECTED AREAS
SUBMARINE CABLES
SCIENCE DATA
TOURISM
FIELD OBSERVATIONS
EXPEDITION DATA
```

---

## 🎛️ Spatial intelligence filters

AMOH uses a compact filter system inspired by modern open-source geospatial-intelligence interfaces.

The interaction language emphasizes:

- map-first navigation;
- semantic zoom;
- spatial filtering;
- entity selection;
- density visualization;
- viewport-aware loading;
- lightweight contextual drawers.

#### Main filters

##### 🚢 Vessels

Possible categories:

```text
Research
Tourism
Fishing
Logistics
Icebreakers
Support vessels
```

##### ✈️ Flights

Regional aviation context where authorized public data is available.

##### 🛰️ Satellites

Relevant passes rather than the entire global satellite population.

Possible categories:

```text
Earth observation
Communications
Weather
Navigation
Research
```

##### 🐟 Fisheries

Fishing activity and marine-resource context.

##### 🐋 Fauna

Marine biodiversity and Antarctic wildlife.

##### 〰️ Submarine infrastructure

Public subsea cable and communications context.

---

## 🔭 Semantic zoom

AMOH changes the representation according to scale.

| Scale | Visualization |
|---|---|
| Global | density, clusters, aggregated context |
| Regional | categories, corridors, hotspots |
| Local | individual entities, tracks and evidence |

This avoids rendering tens of thousands of unnecessary individual objects.
