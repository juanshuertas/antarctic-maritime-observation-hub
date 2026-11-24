# OBSERVATORY FOR LINKED EVIDENCE IN ANTARCTICA — OLEA

**OLEA** (*Observatory for Linked Evidence in Antarctica*), evolved from the **Antarctic Maritime Observation Hub (AMOH)**, is an open-source, offline-first geospatial research platform and data integration engine for Antarctica and the Southern Ocean. It brings together Automatic Identification System (AIS) vessel tracking, Copernicus Earth Observation imagery, Antarctic geophysical compilations, expedition telemetry, and georeferenced field observations on an interactive 2D map and 3D globe.

[Live Observatory (OLEA)](https://juanshuertas.github.io/antarctic-maritime-observation-hub/olea/) · [PB124 Voyage Edition](https://juanshuertas.github.io/antarctic-maritime-observation-hub/peaceboat/) · [Video Demo](Antarctic_Maritime_Hub_compressed.mp4) · [SCAR 2026 Poster (Abstract 1820)](https://virtual.oxfordabstracts.com/event/75327/poster-gallery/grid?sort=titles&current=1820)

![AMOH / OLEA Overview](amoh-overview.png)

---

## Scientific Purpose & Epistemic Principles

Polar and maritime observations are fragmented across incompatible systems — satellite sensors constrained by cloud cover and revisit intervals, AIS transponders subject to high-latitude reception gaps, interpolated geophysical grids, and localized shipboard logs. Rather than forcing false certainty, OLEA harmonizes heterogeneous sources by **UTC timestamp, WGS84 position, sensor/method, quality tier, uncertainty, provenance, and redistribution license**, preserving both agreements and discrepancies as explicit scientific evidence.

Every module in OLEA is governed by six operational and scientific control rules:

1. **Observation is not causation.** Vessel concentration or spatial overlap does not establish environmental impact.
2. **AIS absence is not vessel absence.** Missing transponder messages may reflect coverage gaps or non-transmission.
3. **Satellite observations are not continuous real time.** Revisit intervals, viewing geometry, and cloud cover shape observability.
4. **Community observations remain a separate quality tier.** Opportunistic logs are never automatically promoted to instrumental measurements.
5. **AI supports comparison, matching, and prioritization; it does not infer causality.** Human QA/QC remains central before scientific use.
6. **The expedition does not adapt to the research; the research adapts to the expedition.** Field workflows are lightweight, non-invasive, and require zero itinerary changes or physical sampling.

---

## Research Context & Institutional Milestones

* **12th SCAR Open Science Conference (Oslo, August 2026):** Methodology and platform architecture presented as digital poster *"AI-enabled satellite and AIS monitoring of Antarctic shipping pressure"* (Abstract 1820).
* **Geophysical ML & Marine Sediment Thickness (Khalifa University & Emirates Polar Program, Jan–Apr 2027):** Extending OLEA with a reproducible geophysical workflow in collaboration with the Department of Earth Science at Khalifa University (Abu Dhabi) to evaluate whether integrating `ADMAP-2B/2S` magnetic anomalies and `AntGG2021` gravity/Bouguer anomalies with `IBCSO v2` bathymetry reduces prediction error against independent marine reflection seismic profiles under spatially blocked cross-validation.
* **SCAR AGATA Working Group 3:** Metadata interoperability and observation-model comparison crosswalks supporting polar atmospheric and geospace research (*Coupling to Geospace — Modelling and Data Assimilation*).
* **National & Regional Polar Alignment:** Designed as low-footprint, reproducible research infrastructure aligned with Colombia's *Agenda Científica Antártica 2025–2035*, the Colombian Ocean Commission (CCO) / ARC *Simón Bolívar* campaigns, bilateral science diplomacy with the Chilean Antarctic Institute (INACH), and proposed 2027–2028 Western Antarctic Peninsula field validation.

---

## Monorepo Structure

| Path | Description |
|------|-------------|
| [`apps/web/`](apps/web/) | Editable React 19 + Vite 8 + TypeScript frontend with MapLibre GL + Cesium. Produces separate builds for **OLEA** and **PB124**. |
| [`services/backend/`](services/backend/) | Public **FastAPI** backend service with **DuckDB Spatial**, health checks, metadata governance, and AIS/spatiotemporal endpoints. |
| [`packages/contracts/`](packages/contracts/) | Shared TypeScript data contracts, quality tiers, and schemas synchronized between frontend and backend. |
| [`pb124-pages`](https://github.com/juanshuertas/antarctic-maritime-observation-hub/tree/pb124-pages) | Compiled static site published to GitHub Pages. OLEA at `/olea/`, PB124 at root and `/peaceboat/`. |
| [`docs/`](docs/README.md) | Architectural notes, monorepo guide ([`docs/MONOREPO.md`](docs/MONOREPO.md)), and data governance documentation. |

---

## Data Governance & Quality Tiers

OLEA enforces an explicit review pipeline (**`SUBMIT → REVIEW → MATCH → USE`**) alongside four standardized evidence tiers:

| Tier | Source Category | Scientific Role |
|------|-----------------|-----------------|
| **Tier A** | Validated instrumental & authoritative datasets | Primary analytical baseline (e.g., calibrated EO products, vetted AIS, reviewed seismic profiles). |
| **Tier B** | Verified researcher observations | Georeferenced field logs with documented method, GNSS accuracy, provenance, and uncertainty. |
| **Tier C** | Expedition crew & operational logs | Documented situational and navigational context. |
| **Tier D** | Community / shipboard guest contributions | Opportunistic sightings/media stored in an isolated layer for engagement and visual context. |

Each observation record enforces standardized metadata fields: `observation_id`, `timestamp_utc`, `latitude` / `longitude` (WGS84), `gnss_accuracy`, `source_type`, `observation_type`, `method_sensor`, `qa_status`, `uncertainty`, `owner_contributor`, and `permissions`.

---

## Comprehensive Data Inventory

### 🌊 Fauna & Flora — Antarctic Biodiversity Atlas

**Source:** `apps/web/src/lib/biodiversity-service.ts` (ANTARCTIC_LIFE_ATLAS) + `apps/web/src/components/FaunaStrip.tsx` (POLAR_SPECIES — 32 species, 8 categories, 18 circumpolar sectors)

#### **Complete Species Inventory (32 Species, 8 Categories)**

| # | Category | Common Name | Scientific Name | IUCN | Sector / Region | Conservation Notes |
|---|----------|-------------|-----------------|------|-----------------|-------------------|
| **1–4** | **Penguins** | Emperor | *Aptenodytes forsteri* | NT | Ross Sea / McMurdo (Cape Crozier) | Cape Crozier colony |
| | | Adélie | *Pygoscelis adeliae* | LC | Adélie Coast / Dumont d'Urville | Pointe Géologie colony |
| | | Chinstrap | *Pygoscelis antarcticus* | LC | South Shetland Islands (Deception Island) | Baily Head / Fumaroles |
| | | Gentoo | *Pygoscelis papua* | LC | Antarctic Peninsula / Port Lockroy | Climate change indicator |
| **5–7** | **Cetaceans** | Antarctic Blue Whale | *Balaenoptera musculus intermedia* | CR | Wilkes Land / Prydz Bay | Megafauna filter-feeder |
| | | Humpback Whale | *Megaptera novaeangliae* | LC | Gerlache Strait / Peninsula | Mass summer feeding |
| | | Antarctic Orca (Type B/C) | *Orcinus orca* | DD | Ross Sea / McMurdo Polynya | Apex cooperative predator |
| **8–11** | **Pinnipeds** | Weddell Seal | *Leptonychotes weddellii* | LC | Ross Sea / Erebus Bay | Extreme diver (>600m) |
| | | Leopard Seal | *Hydrurga leptonyx* | LC | Antarctic Peninsula / Drake Passage | Penguin predator |
| | | Crabeater Seal | *Lobodon carcinophaga* | LC | Bellingshausen / Amundsen Seas | Largest seal biomass |
| | | Ross Seal | *Ommatophoca rossii* | LC | Queen Maud Land / Lazarev Sea | Cryptic pack-ice species |
| **12–14** | **Seabirds** | Wandering Albatross | *Diomedea exulans* | VU | Kerguelen Plateau / Heard Island | 3.5m wingspan, circumpolar |
| | | Snow Petrel | *Pagodroma nivea* | LC | South Pole / Queen Maud Land nunataks | Nests 400km inland |
| | | South Polar Skua | *Stercorarius maccormicki* | LC | George V Land / Mertz Glacier | Southernmost bird observed |
| **15–16** | **Krill** | Antarctic Krill | *Euphausia superba* | LC | Bransfield Strait / Scotia Arc | 400Mt global biomass pillar |
| | | Ice Krill | *Euphausia crystallorophias* | LC | Ronne-Filchner / Weddell Ice Shelf | Subglacial endemic |
| **17–19** | **Fish** | Antarctic Toothfish | *Dissostichus mawsoni* | NT | Ross Sea Continental Slope (MPA) | Strict CCAMLR regulation |
| | | Antarctic Silverfish | *Pleuragramma antarcticum* | LC | Weddell Sea / Filchner Shelf | Key neritic trophic link |
| | | Blackfin Icefish | *Chaenocephalus aceratus* | LC | Scotia Arc / South Georgia | Hemoglobin-less blood |
| **20–21** | **Benthos & Cephalopods** | Colossal Squid | *Mesonychoteuthis hamiltoni* | LC | Ross Sea / Abyssal Canyons | Largest invertebrate (>1200m) |
| | | Deep VME Octocoral | *Thouarella sp.* | VU | Ronne-Filchner Shelf / Slope | CCAMLR Vulnerable Marine Ecosystem |
| **22–23** | **Phytoplankton** | Antarctic Diatom (Chlorophyll Bloom) | *Fragilariopsis kerguelensis* | LC | Ross Sea Polynya / Terra Nova Bay | Record primary production |
| | | Phaeocystis Colonial Alga | *Phaeocystis antarctica* | LC | Prydz Bay / Amery Polynya | Massive CO₂ sink |
| **24–27** | **Flora (Terrestrial & Marine)** | Antarctic Hair Grass | *Deschampsia antarctica* | LC | Fildes Peninsula, King George Island | Vascular plant, +120% expansion |
| | | Antarctic Pearlwort | *Colobanthus quitensis* | LC | Admiralty Bay, Arctowski | Cushion plant, wind-adapted |
| | | Polar Moss Bank | *Chorisodontium aciphyllum* | SP_PROTECTION | Port Lockroy, Wiencke Island | 2,800 yr radiocarbon |
| | | Subantarctic Kelp Forest | *Himantothallus/Durvillaea* | LC | Arthur Harbor, Neumayer Channel | >12m fronds, nursery habitat |
| **28–29** | **Corals & Hydrozoans** | Hexacorallia (Actiniaria/Scleractinia) | *Actinernus, Aulactinia* spp. | — | 164–3800m, SCAR AntOBIS | Presence-only, 1000+ records |
| | | Stylasteridae (Hydrozoa) | *Adelopora pseudothyron* | — | 419–742m, SCAR AntOBIS | Presence-only, 200+ records |

**Category Filters (UI):** Todos, Pingüinos, Cetáceos, Focas, Aves, Krill, Peces, Fitoplancton, Bentos y Abisal — with IUCN badges (CR=red, VU=amber, NT=yellow, LC=green, DD=gray)

**Downloadable Data:** GeoJSON (fauna completa, fitoplancton, cardúmenes, krill, ballenas), CSV (monitoreo marino)

---

### 🪸 Cold-Water Corals & Hydrozoans — Deep Benthic Biodiversity

**Source:** `app/public/data/web/geojson/antarctic_hexacorals.geojson`, `antarctic_stylasteridae.geojson`, `open_science_sources_v3.json`

| Taxon | Dataset | Records | Depth Range | Key Species | Role |
|-------|---------|---------|-------------|-------------|------|
| **Hexacorallia** (Actiniaria, Scleractinia) | SCAR AntOBIS / OBIS | 1,000+ | 164–3800 m | *Actinernus antarcticus*, *Aulactinia sulcata* | PRESENCE_ONLY_ECOLOGICAL_EVIDENCE |
| **Stylasteridae** (Hydrozoa) | SCAR AntOBIS / OBIS | 200+ | 419–742 m | *Adelopora pseudothyron* | PRESENCE_ONLY_ECOLOGICAL_EVIDENCE |

**Conservation Context:** Both datasets are **presence-only** (no absence sampling), licensed CC-BY-4.0. Training gate: "date and spatial precision gaps; not absence samples." VME Registry (CCAMLR) provides management context for vulnerable benthic ecosystems.

---

### 🌱 Phytoplankton & Primary Production — Carbon Cycle & Blooms

**Source:** `apps/web/src/components/FaunaStrip.tsx` (POLAR_SPECIES, category `phytoplankton`), Sentinel-3 OLCI / MODIS-Aqua

| Species | Scientific Name | Sector / Bloom Region | Conservation | Key Metric | Satellite Product |
|---------|----------------|----------------------|--------------|------------|-------------------|
| **Diatom (Floración Clorofila)** | *Fragilariopsis kerguelensis* | Ross Sea Polynya / Terra Nova Bay | LC | Primary production record | Sentinel-3 OLCI |
| **Alga Colonial de Polinia** | *Phaeocystis antarctica* | Prydz Bay / Amery Polynya | LC | Massive CO₂ sink | MODIS-Aqua |

**Downloadable Layers:** `phytoplankton_chlorophyll.geojson` (Sentinel-3 chlorophyll-a), `fauna_krill_swarms.geojson` (krill-phytoplankton coupling). Category filter in FaunaStrip UI.

---

### ☢️ Nuclear Legacy & Radioactivity — IAEA MARIS Baseline

**Source:** `apps/web/src/lib/maris-service.ts` (SEED_MARIS_SAMPLES), `HISTORICAL_NUCLEAR_CONTEXT`

**Samples (4 stations):**

| Station | Medium | Radionuclide | Value | Depth | Baseline Context |
|---------|--------|--------------|-------|-------|------------------|
| Drake Passage Transect DP-4 | SEAWATER | Cs-137 | 0.18 Bq/m³ | 10 m | Global fallout tracer (ocean circulation) |
| Bransfield Strait Core BS-12 | SEDIMENT | Pu-239,240 | 0.045 Bq/kg dry | 850 m | 1960s atmospheric test deposition |
| King George Island Maxwell Bay | BIOTA (macroalgae) | Cs-137 | 0.12 Bq/kg wet | 5 m | *Himantothallus grandifolius* bioaccumulation |
| McMurdo PM-3A Historical Site | SEDIMENT | Cs-137 | 0.08 Bq/kg dry | 0 m | Reactor dismantled 1979, 12,000t soil repatriated to USA |

**Treaty Compliance (Antarctic Treaty Art. V):** Explicit prohibition of nuclear explosions and radioactive waste disposal south of 60°S. PM-3A "Nukey Poo" reactor (1962–1972) fully dismantled; contaminated soil returned to Savannah River Site, USA. **No containerized radioactive dumping** has occurred in the Southern Ocean south of 60°S.

**Heatmap Layer:** `nuclear_contamination_heatmap` (variables: `activity_bq_m3`, `cesium_137`, `tritium`)

---

### 🛰 Satellite Constellation — Polar Orbital Telemetry

**Source:** `apps/web/src/lib/osiris-live-feeds.ts` (POLAR_SATELLITES_CONSTELLATION) + `apps/web/src/lib/observatory-orbits.ts` (CelesTrak SGP4 propagation)

| Constellation | Satellites | Sensors | Key Capabilities for Antarctic |
|---------------|------------|---------|-------------------------------|
| **Starlink Polar Shell** | 8 tracked (30124, 30582, 31045, 31410, 31890, 32115, 32450, 32880) | Optical laser crosslinks + Ku/Ka phased array | 97.6° inclination, 550-570 km altitude, real-time science data relay for McMurdo, Scott Base, South Pole, Concordia, Pine Island Glacier |
| **Sentinel-1A/B/C/D** | 4 (C-SAR) | C-band SAR (IW/EW modes) | 250 km swath, 5×20m (IW) / 400 km 20×40m (EW), ice motion, ship detection, deformation |
| **Sentinel-2A/B** | 2 (MSI) | 13-band multispectral | 290 km swath, 10-60m, snow albedo, phytoplankton blooms |
| **Sentinel-3A/B** | 2 (SLSTR+OLCI) | Thermal + Ocean color | 1270 km swath, SST, chlorophyll, sea ice |
| **CryoSat-2** | 1 (SIRAL) | SAR/In radar altimeter | 717 km, 92° inclination, sea ice thickness, ice sheet topography |
| **ICESat-2** | 1 (ATLAS) | Photon-counting laser (532nm) | 496 km, 92°, sub-decimeter elevation, grounding line dynamics |
| **Landsat 8/9** | 2 (OLI-2/TIRS-2) | Multispectral + Thermal | 185 km swath, nunatak mapping, fracture dynamics |
| **SWOT** | 1 (KaRIn) | Ka-band SAR interferometer | 120 km swath, 2D ocean topography, Antarctic Circumpolar Current eddies |
| **Terra/Aqua** | 2 (MODIS/ASTER) | 36-band radiometer | 2330 km swath, daily snow/ice monitoring |
| **NOAA-21 (JPSS-2)** | 1 (VIIRS) | Day/Night band | 3040 km swath, polar low tracking, ice edge |
| **MetOp-B/C** | 2 (ASCAT/IASI/GOME-2) | Scatterometer + IR sounder | Surface winds, ozone column, polar vortex |
| **SARAL** | 1 (AltiKa) | Ka-band altimeter | 800 km, significant wave height, SSH |
| **Iridium NEXT** | 2 tracked (114, 128) | L-band cross-linked mesh | 780 km, 86.4°, Argo buoy relay, SAR comms |
| **OneWeb** | 1 tracked (0145) | Ku/Ka gateway | 1200 km, 87.9°, East Antarctic station backbone |

**Live Propagation:** SGP4 from CelesTrak active catalog (or bundled fallback), updated every 95-110 min per satellite. Full 360° Keplerian rings, ground tracks, sensor swaths, and vertical tethers rendered in MapLibre.

---

### 🌊 Oceanopolitical Friction Engine — Strategic Analysis

**Source:** `apps/web/src/lib/oceanopolitical-friction-engine.ts` + `apps/web/src/lib/olea-sar-layers.ts`

**Six-Dimensional Interaction Index (AMOH-CODENAL-CIDENAL-OCEANOPOLITICS-V5.2):**

| Dimension | Weight | Data Sources | What It Measures |
|-----------|--------|--------------|------------------|
| **Strategic** | 0.25 | `grey_zones_defense.geojson` (base layer) | Baseline geopolitical friction |
| **Maritime** | 0.22 | GFW fishing effort + IAATO tourism | Vessel pressure (fishing + tourism) |
| **Governance** | 0.18 | ASPA + CCAMLR MPA boundaries | Regulatory sensitivity |
| **Ecosystem** | 0.15 | Krill + Penguin + Whale density | Ecological vulnerability |
| **Use Diversity** | 0.10 | Multi-source overlap count | Multi-use competition |
| **Uncertainty** | 0.10 | Data completeness + confidence | Information gaps |

**Output Classes:** OBSERVACIÓN → INTERACCIÓN → ATENCIÓN → ALTA_INTERACCIÓN → VERIFICACIÓN_PRIORITARIA

**Guardrails (hard-coded):**
- No atribuye intención, hostilidad ni incumplimiento
- No convierte reclamaciones territoriales en conflicto
- ASPA/MPA elevan sensibilidad, no implican infracción
- Asociación espacial ≠ causalidad
- Dimensiones sin datos se excluyen y pesos se renormalizan

---

### 🛰 SAR (Synthetic Aperture Radar) Coverage — All-Weather Observation

**Source:** `apps/web/src/lib/olea-sar-layers.ts` (Harvested 2026-11-14 from NASA ASF DAAC Search API)

| Mission | Band | Product | Scenes | Period | Coverage Box |
|---------|------|---------|--------|--------|--------------|
| **NISAR (NASA/ISRO)** | L | L2 GCOV | 1,423 | 2025-10-18 → 2026-11-05 | 70-55°W, 68-54°S |
| **Sentinel-1 (ESA/Copernicus)** | C | GRD HD | 3,212 | 2014-11-01 → 2026-11-11 | Same box |
| **ALOS PALSAR (JAXA/METI)** | L | L1.5 | 10,565 | 2006-05-17 → 2011-04-20 | Same box |
| **RCM-3 (CSA)** | C | GRD/SLC/MLC | 1 (open) | 2020-01-24 | West Antarctic Peninsula |

**NOT counted (require credentials):** RADARSAT-1/2, RCM (EODMS), TerraSAR-X, COSMO-SkyMed, SAOCOM, ICEYE

**Layers:** Coverage grid (count), Recency (age), NISAR-only coverage, Acquisition footprints (ascending/descending, polarization), Sentinel-1 footprints (HH+HV vs VV+VH), RCM open scene.

---

### ⚓ Fisheries Intelligence — GFW + CCAMLR Registry

**Source:** `apps/web/src/lib/fisheries-service.ts` (SEED_FISHING_INTEL)

| Vessel | Flag | Gear | Target | CCAMLR Area | Status | SAR Match |
|--------|------|------|--------|-------------|--------|-----------|
| SHEN LAN (深蓝) | CN | TRAWL | Krill | 48.1 Bransfield | AUTHORIZED (CHN-001) | ✓ |
| HAI FENG 68 | CN | TRAWL | Krill | 48.2 South Orkneys | AUTHORIZED (CHN-008) | ✓ |
| FU RONG HAI | CN | TRAWL | Krill | 48.2 Scotia Sea | AUTHORIZED (CHN-012) | ✓ |
| LONG TENG | CN | TRAWL | Krill | 58.4.2 Prydz Bay | AUTHORIZED (CHN-015) | ✓ |
| ZHOU SHANG 928 | CN | POTS | Illex squid | SW Atlantic (Blue Hole) | VERIFICATION_IN_PROGRESS | ✓ |
| YONG SHENG 2 (REEFER) | CN | CARRIER | Transshipment | Drake / 48.1 edge | VERIFICATION_IN_PROGRESS | ✓ |
| CHANG TAI 888 | CN | POTS | Dosidicus gigas | SE Pacific (SPRFMO) | VERIFICATION_IN_PROGRESS | ✗ |
| ANTARCTIC ENDEAVOUR | NO | TRAWL | Krill | 48.1 Bransfield | AUTHORIZED (NOR-019) | ✓ |
| CABO DE HORNOS IV | CL | LONGLINE | Toothfish | 48.3 South Georgia | AUTHORIZED (CHL-003) | ✗ |
| DARK CONTACT #481-B | UNKNOWN | CARRIER | Unclassified | 48.1 edge | NO_AUTHORIZATION_MATCH_FOUND | ✓ |

**Key Capability:** SAR detection (Sentinel-1) cross-matched with AIS — "dark contact" detection for vessels without AIS transmission.

---

### 🏭 Offshore Energy — Gateway Margins Only (Madrid Protocol Art. 7)

**Source:** `apps/web/src/lib/offshore-energy.ts` (GATEWAY_OFFSHORE_ENERGY)

| Basin / Region | Platform / Project | Fuel | Status | Operator | Treaty Compliance |
|----------------|-------------------|------|--------|----------|-------------------|
| **Austral/Magallanes** (Chile/Argentina) | Poseidón Platform | Gas | Operating | TotalEnergies/Wintershall Dea | 52°39′S — North of 60°S |
| **Austral/Magallanes** | Fénix Offshore Gas | Gas | Development (2025+) | TotalEnergies Austral | 53°24′S — Continental margin |
| **Gippsland/Bass Strait** (Australia) | Marlin & Barracouta | Oil | Operating (1969+) | Esso/Woodside | 38°24′S — Hobart gateway logistics |
| **Otway Basin** (Australia) | Thylacine Unmanned | Gas | Operating (2006+) | Beach Energy | 38°54′S — Southern margin |
| **Taranaki** (New Zealand) | Māui-A Platform | Gas/Condensate | Operating (1979+) | OMV NZ | 39°36′S — Ross Sea gateway |
| **Taranaki** (New Zealand) | Pohokura Field | Gas | Operating (2006+) | OMV NZ | 40°06′S — NZ EEZ |
| **Bredasdorp/Agulhas** (South Africa) | F-A Mossel Bay | Gas | Operating (1992+) | PetroSA | 34°54′S — Cape Town gateway |

**Legal Mandate:** Zero commercial extraction south of 60°S (Madrid Protocol Art. 7). All rendered infrastructure is in *gateway margins* only.

---

### ⛏️ Mineral Resources & Deep-Sea Mining — Treaty Prohibition Context

**Source:** `apps/web/src/lib/offshore-energy.ts` (GATEWAY_OFFSHORE_ENERGY), `apps/web/src/lib/quantarctica-service.ts` (geology theme), `apps/web/src/pages/ContextPage.tsx`

| Aspect | Status | Details |
|--------|--------|---------|
| **Madrid Protocol Art. 7** | **INDEFINITE BAN** | "Any activity relating to mineral resources, other than scientific research, shall be prohibited." Review only after 2048 (50 years after 1998 entry into force). |
| **Known Mineral Occurrences** | Scientific only | **Iron ore** (Prince Charles Mountains), **Coal** (Transantarctic Mountains, Permian-Triassic), **Copper/Gold** (Antarctic Peninsula, volcanic arcs), **Platinum Group** (Dufek Intrusion), **Rare Earths** (carbonatites, not quantified), **Hydrocarbon potential** (Ross Sea, Weddell Sea — not quantified, seismic only). |
| **Deep-Sea Mining (Seabed)** | Banned south of 60°S | **Polymetallic nodules** (Pacific sector, not in Antarctic Treaty area), **Cobalt-rich crusts** (seamounts, not surveyed), **Seafloor massive sulfides** (hydrothermal vents, e.g., Kemp Caldera, East Scotia Ridge — scientific study only). |
| **CCAMLR / ISA Jurisdiction** | Separate regimes | **ISA** governs Area (seabed beyond national jurisdiction) — Antarctic Treaty area excluded from ISA mining code. **CCAMLR** manages living resources; VME closures protect benthic habitats from any bottom disturbance. |
| **Geological Survey (Quantarctica Geology Theme)** | 11 layers, 520 MB | SCAR GeoMAP outcrops, exposed rock, moraines, volcanic centers, ADMAP-2 aeromagnetics, Bouguer gravity, geothermal heat flux — all EPSG:3031, scientific use only. |
| **Monitoring & Compliance** | Satellite + SAR | SAR change detection (Sentinel-1, NISAR) for any unauthorized ground disturbance; AIS dark vessel detection in gateway margins; VME closure enforcement via CCAMLR VMS. |

**Key Point:** OLEA renders **zero commercial extraction infrastructure south of 60°S**. The `GATEWAY_OFFSHORE_ENERGY` layer shows only **gateway-margin** oil/gas platforms (Austral, Bass Strait, Taranaki, Bredasdorp — all north of 60°S) for contextual logistics awareness. Mineral occurrences are mapped in Quantarctica geology/geophysics themes **exclusively for scientific research planning**.

---

### 🚢 Antarctic Tourism — Complete Cruise Routes & Influencer Hotspots

**Source:** `apps/web/src/lib/tourism-service.ts` (SEED_TOURISM_ROUTES + INFLUENCER_TOURISM_HOTSPOTS)

#### **13 Published Routes (2026–2030 Seasons)**

| ID | Route Name | Operator / Vessel | Family | Season | Pax | IAATO Cat | Key Waypoints | Overlap Warnings |
|----|------------|-------------------|--------|--------|-----|-----------|---------------|------------------|
| TR-NATGEO-01 | Península Clásica e Islas Shetland | Lindblad/NG Resolution | CLASSIC_PENINSULA | 2026-27 | 126 | Cat 1 (≤200) | Ushuaia → Drake → King George → Decepción → Gerlache → Port Lockroy → Lemaire → Ushuaia | Whale feeding corridor Gerlache |
| TR-QUARK-02 | Mar de Weddell Profundo / Emperador | Quark / Ultramarine (H145) | WEDDELL_SEA | 2026-27 | 199 | Cat 1 | Ushuaia → Antarctic Sound → Paulet → **Snow Hill (Emperor colony)** → Erebus & Terror → Brown Bluff | Heli limit 1000m over Snow Hill |
| TR-AURORA-03 | Extremo Sur / Círculo Polar 66°33′ | Aurora / Douglas Mawson (X-BOW) | POLAR_CIRCLE | 2027-28 | 154 | Cat 1 | Ushuaia → Low Island → Lemaire → Vernadsky → **Detaille (66°33′S)** → Margarita Bay → Gullet | Pack ice & crabeater seal haul-outs |
| TR-ANT21-04 | Fly & Cruise: Antártico Express | Antarctica21 / Magellan Discoverer + BAE-146 | FLY_AND_CRUISE | 2026-27 | 76 | Cat 1 | Punta Arenas → **Marsh Airfield (Frei)** → Zodiac transfer → Gerlache → Paraíso → Return air | Weather ceiling at Marsh |
| TR-SILVER-05 | Antarctica Bridge Luxury | Silversea / Silver Endeavour (PC6) | FLY_AND_CRUISE | 2026-27 | 200 | Cat 1 | **Puerto Williams** → Drake → Fildes → Port Lockroy → Paraíso → Danco → Return Williams | Dock coordination Navarino |
| TR-HURTI-06 | Gran Circuito: Malvinas, Georgias, Antártida | HX / MS Roald Amundsen (Hybrid) | GRAND_ARC | 2027-28 | 250 | Cat 2 (201-500) | Ushuaia → **Stanley (Malvinas)** → Saunders → **Grytviken (S. Georgia)** → St Andrews → Salisbury → Signy → Gerlache | Boot biosecurity mandatory S. Georgia |
| TR-PONANT-07 | Transpolar / Hielo Extremo | Ponant / Le Commandant Charcot (PC2 GNL) | WEDDELL_SEA | 2026-27 | 245 | Cat 2 | Ushuaia → Shetland → **Deep Weddell** → **Consolidated pack ice** → **Ronne/Filchner** → Return | Scientific approval for pristine shelf |
| TR-SCENIC-08 | Mar de Ross / Antártida Oriental | Scenic / Scenic Eclipse II (Submarines) | ROSS_SEA | 2027-28 | 200 | Cat 1 | **Lyttelton (NZ)** → Campbell → Macquarie → **Cape Adare** → Ross Sea → **Cape Royds (Shackleton hut)** → **Hut Point/McMurdo** → **Ross Ice Shelf** → Hobart | ASPA permit for historic huts |
| TR-ALE-09 | Interior Profundo: Polo Sur & Vinson | ALE / B757 + Basler BT-67 + Twin Otter | FLY_IN_INTERIOR | 2026-27 | 45 | Air-Land | Punta Arenas → **Union Glacier (blue ice)** → Basler to **South Pole** → Return | Catabatic storm contingency |
| TR-WHITEDESERT-10 | Ultralujo: Echo/Whichaway Camps | White Desert / G550 + A340 + Basler | FLY_IN_INTERIOR | 2026-27 | 24 | Air-Land | **Cape Town** → Wolf's Fang → **Whichaway/Echo (Schirmacher)** → **South Pole (Basler)** → Return | UV bio-decon from Cape Town |
| TR-CELEBRITY-11 | Navegación Escénica SIN Desembarco | Celebrity/Princess / Eclipse / Sapphire | CRUISE_ONLY | 2027-28 | **2,850** | **Cat 3 (>500)** | Buenos Aires → Beagle → Drake → **Elephant Island** → Antarctic Sound → **Gerlache (scenic only)** → Lemaire → Valparaíso | **NO LANDING** (Cat 3), 10kt whale zones |
| TR-QANTAS-12 | Sobrevuelo Panorámico sin Aterrizaje | Qantas / B787-9 Dreamliner | SCENIC_FLIGHT | 2026-27 | 230 | Air-Land | **Sydney** → Southern Ocean → **Adélie Land (Mawson hut)** → Wilkes → Pointe Géologie → Return Sydney | Minimum altitude for wildlife |
| TR-PEACEBOAT-13 | Tránsito Circumpolar Austral | Peace Boat / Pacific World (AMOH catalog) | GRAND_ARC | 2026-27 | **2,400** | **Cat 3 (>500)** | Valparaíso → Chacabuco → Punta Arenas → Ushuaia → Drake N → **South Atlantic transit** → Cape Town | Polar Code compliance <50°S |

**IAATO Categories:** Cat 1 (≤200 pax, landings allowed), Cat 2 (201-500, landings with restrictions), Cat 3 (>500, **scenic cruising only, no landings**), Air-Land (fly-in interior).

#### **12 Influencer Tourism Hotspots — Viral Impact & IAATO Guidelines**

| ID | Site / Region | Platforms | Viral Tropes | Vulnerability | Key Metrics | Documented Cases | IAATO Guidelines |
|----|---------------|-----------|--------------|---------------|-------------|------------------|------------------|
| INF-DEC-01 | **Whalers Bay, Decepción** | TikTok, IG Reels, YT Shorts | Polar Plunge, geothermal steam, abandoned whaling station | **CRITICAL** | Fauna stress 7.5, BC loss 19.8mm/yr, drone HIGH | >15M views polar plunge; posing on HSM 71 ruins | Bio-wash mandatory; no climbing HSM 71; 5m penguin distance |
| INF-LCK-02 | **Port Lockroy / Goudier** | IG, TikTok, YT | Penguin Post Office selfie, gentoo on boardwalks | **HIGH** | Fauna stress 8.9, BC 16.5mm, drone VERY HIGH | Selfies with gentoo under HSM 61 pilings | Max 35-40 pax simultaneous; marked trails only |
| INF-NEK-03 | **Neko Harbour** | IG, TikTok, YT | Continental landing, glacier calving tsunami reactions | **CRITICAL** | Fauna stress 8.2, BC 22.4mm, drone HIGH | Celebrations + tsunami clips | Tsunami alert; stay >10m elevation on beach |
| INF-PAR-04 | **Paradise Harbour** | YT, IG, TikTok | Overnight snow camping, sledding, Zodiac champagne | **HIGH** | Fauna stress 7.8, BC 21.0mm, drone HIGH | Kara & Nate overnight vlog (millions views) | Waste evacuation; zodiac speed near cormorants |
| INF-LEM-05 | **Canal Lemaire (Kodak Gap)** | TikTok, IG Reels | Timelapse from balcony, 1000m cliffs reflected | **HIGH** | Fauna stress 6.9, BC 23.1mm, drone VERY HIGH | Viral reels with ambient audio | Acoustic restriction for whales/orcas |
| INF-CUV-06 | **Cuverville Island** | TikTok, IG | 6,500 gentoo pairs, ground-level penguin walk clips | **CRITICAL** | Fauna stress 9.4, BC 17.2mm, drone HIGH | Influencers lying in snow for penguin passages | No off-snow walking; respect penguin highways |
| INF-HLF-07 | **Half Moon Island** | IG, TikTok | Bokeh chinstrap portraits, crescent bay views | **CRITICAL** | Fauna stress 9.1, BC 14.8mm, drone HIGH | Individual poses in declining colonies | Zero trail deviation; species in climate decline |
| INF-BEA-08 | **Union Glacier / Heritage Range** | YT, TikTok, X | 50hr survival challenge, "Shopify Mtn" naming, IL-76 landing | **CRITICAL** | Fauna stress 1.2, BC 8.5mm, biosecurity HIGH | **MrBeast 50hrs (>140M views)** | Commercial names not SCAR-recognized; extreme air footprint |
| INF-WHI-09 | **Whichaway Camp / Wolf's Fang** | IG, TikTok | Futuristic domes, polar sauna, Basler to Emperor colony | **HIGH** | Fauna stress 6.8, BC 12mm, biosecurity CRITICAL | Celebrities champagne in heated domes | UV/chemical decon from Cape Town mandatory |
| INF-FIL-10 | **Bahía Fildes / Villa Las Estrellas** | TikTok, YT, IG | Civilian town with school/bank, fly-cruise transshipment hub | **CRITICAL** | Fauna stress 8.7, BC 28.5mm, biosecurity CRITICAL | Viral daily life + tourist flight arrivals | Max human pressure; border control for Ardley penguinery (ASPA 150) |
| INF-SCO-11 | **Scott Base / McMurdo** | TikTok, IG, YT | Frozen food challenge at -60°C, polar physics, winter life | **HIGH** | Fauna stress 4.1, BC 15mm, drone LOW | **Matty Jordan (@mattykjordan) millions followers** | ASMA 2 restricted access; positive science outreach model |

**Impact Metrics:** Fauna Stress (0-10), Black Carbon Loss (mm/yr), Biosecurity Risk, Drone Hazard, Vegetation Trampling. IAATO guidelines per site enforce biosecurity, distance, trail compliance, waste evacuation, acoustic restrictions.

---

### 📄 SCAR Papers & Global Fishing Watch — Application in OLEA

**Source:** `apps/web/src/lib/tourism-service.ts`, `apps/web/src/lib/fisheries-service.ts`, `apps/web/src/lib/quantarctica-service.ts`, `apps/web/src/pages/explore/ExploreSCAR.tsx`

#### **Key SCAR References Integrated**

| Paper / Product | Year | OLEA Integration | Data Layer |
|-----------------|------|------------------|------------|
| **SCAR 2026 Poster (Abstract 1820)** | 2026 | "AI-enabled satellite and AIS monitoring of Antarctic shipping pressure" — methodology & platform architecture | Observatory overview, Oceanopolitical Friction Engine |
| **MAPPPD (Penguin Populations)** | 2017+ | Penguin colony census (Adélie, Chinstrap, Emperor) — ground counts + VHR satellite (WorldView-3) | `biodiversity-service.ts` (ANTARCTIC_LIFE_ATLAS), `penguin_colonies.geojson` |
| **RAATD (Retrospective Analysis of Antarctic Tracking Data)** | 2020 | Marine mammal & seabird telemetry — state-space filtered Argos/Satellite | `biodiversity-service.ts` (humpback, crabeater, orca Type B) |
| **AntOBIS (Hexacorallia / Stylasteridae)** | 2024 | Presence-only deep benthos (1000+ hexacoral, 200+ stylasterid) | `antarctic_hexacorals.geojson`, `antarctic_stylasteridae.geojson` |
| **Quantarctica 3 / 4** | 2022/2024 | 10 themes, EPSG:3031, offline field package generator | `quantarctica-service.ts` (10 themes, coordinate reprojection) |
| **CCAMLR VME Registry** | 2023+ | Vulnerable Marine Ecosystems — protected benthic habitats | `ccamlr_vme` source in `open_science_sources_v3.json` |
| **IBCSO v2 Bathymetry** | 2022 | 500m resolution, EPSG:9354 → reprojected to EPSG:3031 | Basemap, terrain theme, bathymetry layer |
| **Bedmap2 / REMA** | 2013/2018 | Ice thickness, surface elevation, grounding lines | Quantarctica terrain theme (1800 MB) |
| **ADMAP-2 / AntGG2021** | 2018/2024 | Magnetic & gravity anomalies (EPSG:3031, 5km) | Quantarctica geophysics theme (610 MB), Khalifa ML |
| **MEOP (Marine Mammals Exploring Oceans Pole-to-Pole)** | 2016+ | CTD-tagged seals (crabeater, Weddell) — oceanographic profiles | `biodiversity-service.ts` (crabeater seal) |
| **SOCCOM / BGC-Argo / Argo GDAC** | 2014+ | Biogeochemical floats (O₂, NO₃, pH, carbon) | `open_science_sources_v3.json` (priority 1) |
| **IAEA MARIS** | 2024+ | Radioactivity baseline (Cs-137, Pu-239,240, H-3) | `maris-service.ts` (SEED_MARIS_SAMPLES) |

#### **Global Fishing Watch (GFW) v3 API — Applied in OLEA**

| GFW Product | OLEA Layer | Implementation | Key Parameters |
|-------------|------------|----------------|----------------|
| **Apparent Fishing Effort** | `gfw_fishing_effort` (points + grid) | `fisheries-service.ts` (SEED_FISHING_INTEL) + `fisheries_effort` heatmap | Hours, gear type (TRAWL/LONGLINE/POTS), target species, CCAMLR area |
| **Fishing Effort Heatmap** | `gfw_fishing_effort_heatmap` | `continuous-heatmap-runtime.ts` (CONFIGS) | `hours`, `apparent_fishing_hours`, `effort`, `value` weight keys; ramp cyan→amber→red |
| **SAR Vessel Detections** | `gfw_sar_detections` | `osiris-live-feeds.ts` + `fisheries-service.ts` (sarMatch boolean) | Sentinel-1 GRD cross-match with AIS; dark contact detection |
| **CCAMLR Authorization Registry** | `ccamlrStatus` enum | `fisheries-service.ts` (AUTHORIZED / VERIFICATION_IN_PROGRESS / NO_AUTHORIZATION_MATCH_FOUND) | License IDs (e.g., CCAMLR-2026-CHN-001), VMS verification |
| **Transshipment Monitoring** | Carrier/reefer tracking | `SEED_FISHING_INTEL` (YONG SHENG 2, DARK CONTACT #481-B) | MMSI, coordinates at CCAMLR boundaries, sarMatch |
| **API Access** | Authenticated research API | `tourism-service.ts` (gfw source) | Free non-commercial; account token required; rate-limited |

**GFW + AIS + SAR Fusion (Core MDA Capability):**
1. AIS provides declared position/identity
2. Sentinel-1 SAR detects **all** vessels (including AIS-off)
3. Cross-match → `sarMatch: true/false` + `ccamlrStatus`
4. **Dark Contact** = SAR detection + no AIS + no CCAMLR match → flagged for investigation
5. Heatmap renders **apparent effort hours** (not catch) — avoids false causality

---

### 🗺️ Quantarctica — Antarctic GIS Package & Offline Field Deployment

**Source:** `apps/web/src/lib/quantarctica-service.ts` (QUANTARCTICA_THEMES, epsg3031To4326, buildFieldPackageManifest)

#### **10 Themes (EPSG:3031 Polar Stereographic, 71°S standard parallel)**

| Theme ID | Name | Layers | Size | CRS | Key Content |
|----------|------|--------|------|-----|-------------|
| `basemap` | Basemap & Boundaries | 14 | 240 MB | EPSG:3031 | SCAR coastlines, grounding lines, ice shelf fronts, territorial claim reference lines |
| `terrain` | Terrain & Bathymetry | 18 | **1800 MB** | EPSG:3031 | Bedmap2, REMA 8m/100m, IBCSO v2 ocean bathymetry |
| `satellite` | Satellite Mosaics | 12 | 2400 MB | EPSG:3031 | Landsat 8 LIMA, MODIS MOA 2009/2014, Sentinel-1 SAR backscatter |
| `glaciology` | Glaciology & Ice Velocity | 22 | 950 MB | EPSG:3031 | MEaSUREs ice velocity vectors, flow lines, blue ice areas |
| `atmosphere` | Atmosphere & Climate | 16 | 380 MB | EPSG:3031 | RACMO2 surface mass balance, wind regimes, mean annual temperature |
| `biology` | Biology & Ecology | 15 | 120 MB | EPSG:3031 | Penguin colonies (MAPPPD), seal haul-outs, vegetation index (NDVI) |
| `environmental` | Environmental Management | 8 | 45 MB | EPSG:3031 | ASPA/ASMA protected areas, Historic Sites & Monuments (HSM) |
| `geology` | Geology & Geomorphology | 11 | 520 MB | EPSG:3031 | SCAR GeoMAP outcrops, exposed rock, moraines, volcanic centers |
| `geophysics` | Geophysics & Magnetics | 9 | 610 MB | EPSG:3031 | ADMAP-2 aeromagnetic, Bouguer gravity, geothermal heat flux |
| `ice_cores` | Ice Cores & Deep Drilling | 6 | 35 MB | EPSG:3031 | EPICA Dome C, Vostok, WAIS Divide paleoclimate borehole locations |

**Total:** ~**6.1 GB** full package; field packages subset by expedition.

#### **Coordinate Reprojection (EPSG:3031 → WGS84 EPSG:4326)**
```typescript
// Polar Stereographic (71°S standard parallel) → Lon/Lat
function epsg3031To4326(x: number, y: number): [number, number] {
  const a = 6378137.0; const e = 0.081819190842622;
  const phi_c = -71 * Math.PI / 180;
  const rho = Math.sqrt(x*x + y*y);
  if (rho === 0) return [0, -90]; // South Pole
  // ... iterative latitude solver (5 iterations max)
  return [lon, lat];
}
```

#### **Offline Field Package Generator**
```typescript
buildFieldPackageManifest(
  expeditionName: "AMOH-SUR-XXVI",
  targetRegion: "Bransfield Strait",
  themeIds: ["basemap", "terrain", "glaciology", "biology", "environmental"]
)
// Returns: { totalEstimatedMb: 1415, duckdbCompatible: true, generatedAt: "..." }
```
- **DuckDB Compatible:** Layers exported as GeoJSON/Parquet for local spatial queries
- **Expedition Customization:** Select themes by region → minimize download size
- **Offline-First:** No internet required once package deployed to field device

#### **Quantarctica Layers in OLEA Map**
- Loaded via `quantarctica-layers.ts` → `applyQuantarcticaLayersToMap()`
- ComBase layers (coastline, ice shelves, bathymetry) always available
- High-res layers (REMA, LIMA) lazy-loaded when active
- ASPA/HSM boundaries integrated with governance friction engine

---

### 🧭 Geophysics & Bathymetry — Marine Geophysics Engine

**Source:** `apps/web/src/lib/marine-geophysics-layers.ts`, `apps/web/src/components/MarineGeophysicsPanel.tsx`, `apps/web/src/lib/wod-map-engine.ts`, `apps/web/src/lib/quantarctica-layers.ts`

OLEA integrates a **comprehensive marine geophysics suite** built on Antarctic geophysical compilations, enabling sediment thickness prediction, tectonic analysis, and bathymetric visualization.

#### **Core Geophysical Layers (Marine Geophysics Panel)**

| Layer ID | Label | Source | Resolution/Details | Scientific Role |
|----------|-------|--------|-------------------|-----------------|
| `lindeque_sediment_reference` | Lindeque · Espesor (m) | Lindeque et al. 2016 (PANGAEA 864906) | 5 km, EPSG:3031 | **Independent label** for sediment thickness ML (seismic reflection derived) |
| `antgg_gravity_anomaly` | AntGG · Gravedad (mGal) | AntGG2021 (PANGAEA 971238) | 5 km, EPSG:3031 | Feature: gravity anomaly (not "free-air") |
| `antgg_bouguer_anomaly` | AntGG · Bouguer (mGal) | AntGG2021 (PANGAEA 971238) | 5 km, EPSG:3031 | Feature: Bouguer anomaly + sigma (uncertainty mask) |
| `admap2b_magnetic_anomaly` | ADMAP‑2B · Magnetismo (nT) | ADMAP-2B (PANGAEA 965433) | 5 km, EPSG:3031 | **Primary magnetic feature** (near-surface, gaps present) |
| `admap2s_magnetic_anomaly` | ADMAP‑2S · Magnetismo con relleno satelital | ADMAP-2S (PANGAEA 965433) | 5 km, EPSG:3031 | **Gap-fill only** (satellite-derived); flagged via `x_magnetic_is_infilled` |
| `ibcso_v2_relief` | IBCSO · Relieve del fondo | IBCSO v2 (PANGAEA 937574) | 500m, EPSG:9354 → reprojected | Bathymetric base; block mean + std-dev (seabed roughness) |
| `ibcso_v2_tid` | IBCSO · Origen de la batimetría | IBCSO v2 | 500m | Multibeam coverage provenance (data quality mask) |

#### **Sediment Thickness Prediction (Khalifa University ML Collaboration)**

**Pipeline:** `data/derived/geophysics/khalifa-ml-cpu/` → `MarineGeophysicsPanel` → `WodMapEngine`

| Component | Details |
|-----------|---------|
| **Label** | Lindeque 2016 total sediment thickness (seismic reflection compiled) — **independent of gravity/magnetics** |
| **Features (8)** | Gravity anomaly, Bouguer, gravity sigma, 2nd radial derivative, magnetic anomaly (2B), magnetic infill flag, bathymetry depth, bathymetry roughness (std-dev of 10× downsample) |
| **CV Scheme** | Spatial block CV (150 km blocks, 50 km buffer) — prevents spatial leakage |
| **Models** | Ridge (best), Random Forest, baselines (mean, bathymetry-only, spatial k-NN) |
| **Results (OOF)** | Ridge MAE **474 m**, R² **0.835** — beats bathymetry-only (+5.2%) and spatial k-NN (+34.7%) |
| **Permutation Importance** | Bathymetry depth (1310 m) > Gravity anomaly (203 m) > Magnetic anomaly (145 m) > Bouguer (117 m) |
| **Residual Uncertainty** | p05–p95: ±980 m (honest prediction band from OOF residuals) |
| **Caveats** | Labels = gridded interpolation (not raw seismic picks); region-limited to Lindeque coverage (Amundsen/Bellingshausen); ADMAP-2B gaps (28%) filled from 2S with infill flag |

**Khalifa University Collaboration:** Joint work with Dept. of Earth Science, Khalifa University (Abu Dhabi), Emirates Polar Program. Reproducible CPU pipeline in `khalifa-ml-cpu/` with summary JSON.

#### **Bathymetry — IBCSO v2 Integration**

| Aspect | Implementation |
|--------|----------------|
| **Source** | IBCSO v2 (PANGAEA 937574, CC-BY-4.0), 500m resolution, EPSG:9354 |
| **CRS Handling** | Explicit reprojection EPSG:9354 → EPSG:3031 (different standard parallels; naive overlay misregisters coast by km) |
| **Downsampling** | 500m → 5km (10×): **block mean + block std-dev** — roughness retained as predictor, not discarded |
| **Layers** | `ibcso_v2_relief` (depth contours, color-ramped), `ibcso_v2_tid` (multibeam coverage provenance = data quality mask) |
| **Quantarctica** | `quantarctica_bathymetry` contours (-500m to -4000m), color-ramped by depth, labels with depth values |
| **Tile Source** | Local webp tiles: `/data/web/tiles/ibcso_v2_relief/{z}/{x}/{y}.webp` (maxzoom 7) |

#### **Quantarctica Geophysics & Bathymetry Themes**

| Theme | Layers | Size | Key Content |
|-------|--------|------|-------------|
| `geophysics` | 9 | 610 MB | ADMAP-2 aeromagnetic, Bouguer gravity, geothermal heat flux (EPSG:3031) |
| `terrain` | 18 | 1800 MB | Bedmap2, REMA 8m/100m, **IBCSO v2 ocean bathymetry** |

#### **Marine Geophysics Panel (UI)**
- Toggle access via dock button "Geofísica" → `MarineGeophysicsPanel.tsx`
- 11 layers with one-click toggle, exploratory ML sediment thickness (CPU) toggle
- Disclaimer: "Lindeque es una compilación interpolada. Validación sísmica independiente pendiente."

---

### ⚓ **Inspiración: El Galeón San José — Patrimonio Sumergido & Arqueología Marina**

**Contexto Histórico:** El **Galeón San José** (1698–1708) fue un navío de línea español de 64 cañones, hundido el **8 de junio de 1708** durante la Batalla de Barú (Guerra de Sucesión Española) frente a las costas de Cartagena de Indias, Colombia. Transportaba una de las cargas más valiosas de la historia colonial: oro, plata, esmeraldas y piezas de ajuar real estimadas en **$17–20 mil millones USD actuales**. Su hallazgo en **2015** por la Armada de Colombia y Woods Hole Oceanographic Institution (WHOI), a **600 m de profundidad**, marcó un hito en arqueología marina profunda.

#### **Cómo el San José Inspira a OLEA/AMOH**

| Dimensión | Inspiración del San José | Implementación en OLEA |
|-----------|-------------------------|------------------------|
| **Arqueología Marina Profunda** | Búsqueda y validación a 600m con AUV (REMUS 6000) + imagen multihaz | Capa `historic_stations` (Quantarctica) + `historic_routes` (Amundsen, Scott, Shackleton, Mawson) — extensible a pecios |
| **Tecnología de Búsqueda** | REMUS 6000 (AUV) + sonar de barrido lateral (side-scan) + cámara 4K | Integración de **sonar de barrido lateral sintético** via `ibcso_v2_tid` (cobertura multihaz) + planificación de AUV en `quantarctica-service.ts` |
| **Identificación No Intrusiva** | Imagen 4K + fotogrametría + confirmación por cañones de bronce con escudo real | **Protocolo de observación no invasiva** (Regla 6: "la investigación se adapta a la expedición") — OLEA registra sin perturbar |
| **Gobernanza & Soberanía** | Disputa Colombia/España/Sea Search Armada → fallo Corte Constitucional Colombia (2022): "patrimonio cultural de la nación" | **Capa `treaty_claims` (Art. IV)** + `quantarctica_ccamlr` + `quantarctica_aspa` — marco legal para patrimonio sumergido antártico |
| **Valor Científico vs. Comercial** | Decisión Colombia: **no extracción comercial**, preservación in situ + estudio científico | **Regla 1 OLEA:** "Observación no es causalidad" + **Madrid Protocol Art. 7** (prohibición minerales) — coherencia total |
| **Colaboración Internacional** | Colombia + España + UNESCO + WHOI (ciencia) | **Khalifa University (EAU) + INACH (Chile) + SCAR** — modelo multilateral para patrimonio polar |
| **Tecnología de Visualización** | Fotogrametría 3D + modelo digital del pecio | **NatGeo Director Suite 4K** + **Cesium 3D Globe** + **CircumpolarFlowCanvas** — reconstrucción inmersiva |

#### **Aplicación Antártica: Patrimonio Sumergido en la Antártida**

| Posible Aplicación | Estado en OLEA |
|-------------------|----------------|
| **Pecios históricos antárticos** (Endurance, Antarctic, etc.) | `historic_stations` + `historic_routes` (Quantarctica) — base para extensiones |
| **Áreas de protección arqueológica** | Extensible via `quantarctica_aspa` / `quantarctica_hsm` (Historic Sites & Monuments) |
| **Sonar multihaz para detección** | `ibcso_v2_tid` (origen batimetría) identifica gaps de cobertura multihaz |
| **Protocolos de observación no intrusiva** | Alineado con **Regla 6 OLEA** + **Protocolo de Madrid** + **Convención UNESCO 2001** (Patrimonio Cultural Subacuático) |
| **Modelo de gobernanza multinivel** | Colombia (soberanía) + España (estado de bandera) + UNESCO + ciencia → **Antártida: Tratado Antártico + Protocolo Madrid + CEP + CCAMLR** |

#### **Lecciones Clave del San José para OLEA**

1. **La tecnología permite, la gobernanza decide** — El hallazgo fue técnico (AUV + sonar); la decisión de **no extraer** fue política/jurídica. OLEA separa **capacidad de observación** (datos) de **decisión de uso** (política).
2. **Datos abiertos con procedencia** — La atribución clara (WHOI + Armada Colombia) inspira el **pipeline de procedencia OLEA** (Tier A–D, metadata obligatoria).
3. **Ciencia > Comercio** — La decisión de Colombia de priorizar estudio científico sobre valor comercial refleja el **principio epistémico OLEA**: "Observación no es causalidad; la investigación se adapta a la expedición."
4. **Colaboración multilateral como norma** — El modelo Colombia-España-UNESCO-WHOI prefigura la **colaboración Khalifa-INACH-SCAR** en OLEA.

---

### 🗺️ National Geographic MapMaker Atlas — 267 Items Integrated

**Source:** `apps/web/src/lib/natgeo-mapmaker-layers.ts` (NATGEO_MAPMAKER_LAYERS, NATGEO_MAPMAKER_PROVENANCE, NATGEO_DRIFTER_IMPLEMENTED)

#### **Provenance**
| Attribute | Value |
|---------|-------|
| **Resource** | https://education.nationalgeographic.org/resource/mapmaker-ocean-currents/ |
| **ArcGIS Account** | `mm.atlas` (National Geographic MapMaker atlas) |
| **App ID** | `0cd1cdee853c413a84bfe4b9a6931f0d` |
| **Webmaps** | "Ocean Currents" (5a63cae1...), "Ocean Currents in Motion" (c69ed6f0...) |
| **Catalog Totals** | 267 items: 106 Feature Services, 30 Image Services, 5 Map Services, 3 Vector Tile, 1 WMTS, 119 Web Maps |
| **Harvested** | 2026-11-02 via `scripts/natgeo_mapmaker_harvest.mjs` |
| **License** | Mostly CC BY 4.0 / 3.0; some layers carry original provider terms (Smithsonian GVP, UNEP-WCMC, USGS, NOAA, Esri MLA) |

#### **13 Supported Layers (MapLibre-Ready)**

| Layer ID | Name | Type | Source | Key Features |
|----------|------|------|--------|--------------|
| `natgeo_ocean_surface_currents` | Corrientes Oceánicas Superficiales | GeoJSON (local) | 51 named currents, 1605 vertices, Warm (29) / Cold (22), simplified 0.01° |
| `natgeo_tectonic_plate_boundaries` | Límites de Placas Tectónicas | ArcGIS FeatureService | 241 segments (divergent/convergent/transform) |
| `natgeo_volcanoes_world` | Volcanes del Mundo (Holoceno/Pleistoceno) | ArcGIS FeatureService | 1281 volcanoes (132 south of 30°S), Smithsonian GVP v5.2.5 |
| `natgeo_earthquakes_major` | Sismos Mayores | ArcGIS FeatureService | 949 events (90 south of 30°S), USGS |
| `natgeo_coral_bleaching_stress` | Estrés Térmico Blanqueamiento Coralino | ArcGIS FeatureService | 214 reef stations, NOAA Coral Reef Watch |
| `natgeo_biomes` | Biomas / Ecorregiones RESOLVE 2017 | ArcGIS FeatureService | 847 ecoregions grouped by biome |
| `natgeo_pristine_seas` | Pristine Seas — Expediciones y AMP | ArcGIS FeatureService | 51 expedition sites, MPA flags |
| `natgeo_perpetual_planet_everest` | Perpetual Planet — Expedición Everest | ArcGIS FeatureService | 9 stations |
| `natgeo_okavango_tracks` | Okavango Wilderness Project — Trazas | ArcGIS FeatureService | 10 expedition tracks |
| `natgeo_light_pollution` | Contaminación Lumínica (Earth at Night 2016) | ArcGIS MapServer (tiles) | NASA night radiance mosaic |
| `natgeo_time_zones` | Husos Horarios | ArcGIS FeatureService | 39 polygons |
| `natgeo_meridians_parallels` | Meridianos y Paralelos Principales | ArcGIS FeatureService | 54 reference lines |
| `ocean_currents` (alias `natgeo_ocean_currents_in_motion`) | **Ocean Currents in Motion** | **Custom renderer** | LERC 2-band ImageServer (magnitude + direction) → particle animation via `CircumpolarFlowCanvas.tsx` |

#### **3 Basemaps (from MapMaker Webmaps)**
| Basemap ID | Label | Kind | URL |
|------------|-------|------|-----|
| `natgeo_world_ocean_base` | World Ocean Base (Ocean Currents webmap) | Raster (Esri) | `services.arcgisonline.com/.../Ocean/World_Ocean_Base/MapServer` |
| `natgeo_world_ocean_reference` | World Ocean Reference (no labels) | Vector style | `arcgis.com/sharing/rest/content/items/4c8912e3.../styles/root.json` |
| `natgeo_world_imagery` | World Imagery (Ocean Currents in Motion webmap) | Raster (Esri) | `services.arcgisonline.com/.../World_Imagery/MapServer` |

#### **Unsupported (LERC ImageServices)**
- Köppen climate, Seafloor Age, Continental Shelf, Marine/Terrestrial Biodiversity, Chlorophyll-a, Human Footprint, Population Density, Surface Winds, Jet Stream, Land Cover — **require LERC decoder or renderingRule**, not yet implemented in MapLibre.

#### **Integration Points in OLEA**
- **Ocean Currents** → particle animation (`CircumpolarFlowCanvas.tsx`) + `natgeo-drifter-field.ts`
- **Layer Library** → `NATGEO_MAPMAKER_TREE_ITEMS` in HierarchicalLayerLibrary
- **Command Palette** → aliases (`natgeo_currents`, `corrientes_natgeo`, `volcanes`, `sismos_mayores`, `biomas`, `pristine_seas`, `contaminacion_luminica`, etc.)
- **Attribution** per layer: mostly CC BY 4.0/3.0; verify `license` in catalog before redistribution

**Source:** `apps/web/src/lib/cable-geometry.ts` (VERIFIED_POLAR_CABLES)

| Cable | Status | Length | Route | Operator | Key Landing Points |
|-------|--------|--------|-------|----------|-------------------|
| **FOA (Fibra Óptica Austral)** | Operational | 2,800 km | Puerto Montt → Puerto Williams | Subtel/CTR Chile | **Southernmost cable landing on Earth (54°56′S)** |
| **Humboldt Cable** | Planned (2026+) | 14,800 km | Valparaíso → Auckland → Sydney | Desarrollo País / H2 / Google | Transpacific Chile↔Oceania |
| **NSF Antarctic Subsea Study** | Feasibility | 4,300 km | McMurdo → Invercargill/Sydney | NSF Polar Programs | Conceptual corridor only |
| **SMART Science Cable (Drake)** | Research Concept | 1,250 km | Puerto Williams → King George Island | ITU/WMO/UNESCO-IOC JTF | Seismic + oceanographic sensors |
| **Bass Strait (Basslink)** | Operational | 300 km | Melbourne → Hobart | Telstra/Basslink | Hobart polar hub (RSV Nuyina) |
| **Tasman Ring** | Operational | 1,800 km | Auckland → Invercargill | Spark/Chorus NZ | Invercargill (Ross Sea gateway) |

**Validation Rules:** Antimeridian-safe splitting, <25°S filter, impossible jump rejection (>3,500 km), status-based color palette (operational/planned/feasibility/smart_science).

---

### 🔴 Grey Zones & Defense — SIGINT/Buffer Analysis

**Source:** `apps/web/src/lib/continuous-heatmap-runtime.ts` (CONFIGS)

| Heatmap Layer | Source Data | Weight Keys | Purpose |
|---------------|-------------|-------------|---------|
| **grey_zones_defense_heatmap** | `grey_zones_defense.geojson` (derived from friction engine) | oceanopolitical_friction_index, tension_weight, polar_friction_index | Strategic friction hotspots |
| **polar_friction_sectors** | `polar_friction_sectors.geojson` | polar_friction_index, tension_weight | 18-sector PFI zoning |
| **grey_zones_buffers** | `grey_zones_buffers.geojson` | tension_weight, radius_km, buffer_km | SIGINT/ELINT range rings |

---

### ⚔️ National Security, Military & Geopolitical Relevance

OLEA/AMOH is designed as a **dual-use research observatory** — its open architecture and data integration directly support national security, defense, and geopolitical analysis capabilities for Antarctic and Southern Ocean domains.

#### **Maritime Domain Awareness (MDA)**
- **AIS + SAR Fusion:** Real-time correlation of AIS transmissions with Sentinel-1 SAR detections identifies "dark vessels" (vessels without AIS but detected by radar) — critical for IUU fishing enforcement and anomaly detection
- **Vessel Classification & Intent:** 10+ vessel types tracked (RESEARCH, ICEBREAKER, EXPEDITION_CRUISE, SUPPLY, PATROL, FISHING) with operator, flag, mission, and CCAMLR authorization status
- **Transshipment Monitoring:** Carrier/reefer vessels (e.g., YONG SHENG 2) tracked at CCAMLR area boundaries — transshipment-at-sea is a primary IUU enabler
- **Dark Contact Registry:** `NO_AUTHORIZATION_MATCH_FOUND` entries (e.g., DARK CONTACT #481-B) flagged for investigation

#### **Strategic Chokepoint Surveillance**
| Chokepoint | Monitoring Assets | Strategic Value |
|------------|-------------------|-----------------|
| **Drake Passage** | SAR (S1/NISAR), AIS, Starlink polar, SWOT, Argo | Primary Atlantic-Pacific gateway, ACC transport measurement |
| **Bransfield Strait** | SAR, AIS, GFW, CCAMLR VMS, webcams | Highest krill fishing density, tourism concentration |
| **Gerlache Strait** | SAR, AIS, tourist vessels, research stations | Tourism hotspot, whale feeding, multi-national presence |
| **McMurdo Sound / Ross Sea** | SAR, ICESat-2, Starlink, NSF cable study | US/ NZ logistics hub, largest MPA, ice shelf stability |
| **Prydz Bay / Amery** | SAR, Chinese/Russian/Australian stations, cables | East Antarctic access, resource proximity |

#### **Communication Infrastructure Resilience**
- **FOA (Fibra Óptica Austral):** World's southernmost submarine cable landing (Puerto Williams, 54°56′S) — Chilean sovereign connectivity to gateway
- **Humboldt Cable (Planned):** First transpolar South America↔Oceania link — reduces latency, bypasses northern choke points
- **SMART Science Cable (Drake):** Proposed sensor-integrated cable for seismic + oceanographic + climate monitoring — dual-use science/security
- **Polar Satellite Comms:** Starlink polar mesh (laser crosslinks), Iridium NEXT (L-band mesh), OneWeb — resilient comms for stations/ships

#### **Satellite-Based ISR (Intelligence, Surveillance, Reconnaissance)**
| Capability | Satellites | Revisit / Latency | Defense Utility |
|------------|------------|-------------------|-----------------|
| **All-weather SAR Imaging** | Sentinel-1 (C), NISAR (L), RCM (C), ALOS (L) | 6-12 days (S1), 12 days (NISAR) | Vessel detection, ice monitoring, oil spill, deformation |
| **Sub-decimeter Altimetry** | ICESat-2, CryoSat-2 | 91-99 days (exact repeat) | Ice shelf fracture, grounding line, sea ice thickness |
| **Ocean Topography (2D)** | SWOT (KaRIn) | 21 days | ACC eddies, frontal dynamics, transport |
| **Persistent LEO Comms** | Starlink Polar (laser mesh), Iridium, OneWeb | Continuous | Real-time data relay, C2 for autonomous assets |
| **Weather / Space Weather** | MetOp (ASCAT/IASI), NOAA-21 (VIIRS), GOES | Hourly | Polar low tracking, ionospheric monitoring, HF comms |

#### **Geopolitical & Treaty Monitoring**
- **Madrid Protocol Art. 7 Compliance:** Offshore energy layer renders **zero** extraction south of 60°S; gateway-margin infrastructure only (Austral, Bass Strait, Taranaki, Bredasdorp)
- **CCAMLR Enforcement:** Vessel authorization registry + VMS + SAR match = compliance verification for 10 krill/toothfish vessels
- **ASPA/MPA Boundaries:** 72+ ASPAs, 2 MPAs (Ross Sea, South Orkneys) — governance sensitivity layer in friction engine
- **Territorial Claim Overlay:** 7 claimant states (Argentina, Australia, Chile, France, NZ, Norway, UK) — treaty claims layer (Art. IV freeze)
- **Dual-Use Infrastructure:** Research stations (30+ year-round) = sovereign presence, logistics hubs, sensor platforms

#### **Oceanopolitical Friction Index (6-Dimensional)**
The **AMOH-CODENAL-CIDENAL-OCEANOPOLITICS-V5.2** engine computes a composite index used for strategic assessment:

| Dimension | Weight | Interpretation for Defense |
|-----------|--------|---------------------------|
| **Strategic** (0.25) | Baseline friction from `grey_zones_defense.geojson` | Geopolitical tension baseline |
| **Maritime** (0.22) | GFW fishing + IAATO tourism | Vessel density, IUU risk, SAR search load |
| **Governance** (0.18) | ASPA + CCAMLR MPA | Regulatory complexity, inspection burden |
| **Ecosystem** (0.15) | Krill + penguins + whales | Environmental security, resource competition |
| **Use Diversity** (0.10) | Multi-sector overlap | Contested zones, multi-mission conflict |
| **Uncertainty** (0.10) | Data gaps | Blind spots, collection requirements |

**Output Classes:** OBSERVACIÓN → INTERACCIÓN → ATENCIÓN → ALTA_INTERACCIÓN → VERIFICACIÓN_PRIORITARIA

**Hard Guardrails (non-negotiable):**
- No attribution of intent, hostility, or violation
- No conversion of territorial claims into conflict
- ASPA/MPA elevate sensitivity only — no implication of infraction
- Spatial association ≠ causation
- Missing dimensions excluded, weights renormalized

---

### 📋 **Data Gaps & Missing Capabilities**

The following critical datasets are **NOT currently integrated** but are identified as requirements for full MDA/defense coverage:

#### **1. Classified / Restricted SAR (Not in ASF DAAC Open Catalog)**
| Mission | Band | Gap | Access Path |
|---------|------|-----|-------------|
| **RADARSAT-1/2** | C | 1995-2013 Antarctic mosaics (AMM-1, MAMM) | CSA EODMS / AWS Open Data (requires account) |
| **RCM (Full Archive)** | C | 3-sat constellation, 4-day revisit, maritime mode | CSA EODMS (account + distribution restrictions) |
| **TerraSAR-X / TanDEM-X** | X | High-res (1-3m), interferometry | DLR / Airbus (commercial) |
| **COSMO-SkyMed (1-4)** | X | 4-sat, 12h revisit, spotlight | ASI / e-GEOS (commercial/NATO) |
| **SAOCOM 1A/1B** | L | **Only L-band in Southern Cone**, polarimetry | CONAE (Argentina) — ONE CLICK registration, no public API |
| **ICEYE** | X | 20+ microsats, sub-daily revisit | Commercial (Finland) |
| **Capella Space** | X | 10+ sats, hourly revisit | Commercial (USA) |

**Impact:** Current SAR coverage grid (NISAR + S1 + ALOS) is a **lower bound** — actual radar observation density is significantly higher but unquantified in open catalogs.

#### **2. Military / Naval AIS (Dark by Design)**
- **Warships / Coast Guard / Patrol vessels** typically operate AIS Class B or OFF per national policy
- **Gap:** No integration of naval vessel databases (e.g., IHS Jane's, Military Periscope) — would require classified feeds
- **Mitigation:** SAR dark detection partially compensates (vessel detected by radar, no AIS)

#### **3. Underwater Domain Awareness (UDA)**
| Missing Capability | Current State | Requirement |
|-------------------|---------------|-------------|
| **Hydrophone Arrays** | PALAOA (AWI, single), MEOP tag data | Multi-national SOSUS-style array (CTBTO hydroacoustic) |
| **Submarine Cable Tamper Detection** | Cable geometry only | DAS (Distributed Acoustic Sensing) on FOA/Humboldt |
| **UUV / Glider Tracking** | Argo floats only | NATO STANAG 4748 / JANUS underwater comms integration |
| **Seabed Sensor Networks** | None | SMART cable concept (ITU/WMO/IOC JTF) — not deployed |

#### **4. Space Domain Awareness (SDA) for Polar Orbits**
- **Current:** CelesTrak GP propagation (SGP4) for active satellites
- **Missing:** Debris tracking (SPACE-TRACK.org catalog), conjunction analysis, anti-satellite test monitoring, polar-specific debris clouds (e.g., 2007 Chinese ASAT debris at 800-900km)

#### **5. Cyber / Electronic Order of Battle**
| Missing Layer | Description |
|--------------|-------------|
| **SIGINT/ELINT Sites** | Known ground stations (e.g., Argentine/Chilean/UK/US/Australian facilities in gateway zones) |
| **HF/DF Networks** | High-frequency direction finding for Southern Ocean comms |
| **GNSS Interference** | Jamming/spoofing incidents (Drake Passage, South Atlantic Anomaly) |
| **Satcom Intercept** | Inmarsat, Iridium, OneWeb, Starlink gateway locations + beam footprints |

#### **6. Climate Security & Infrastructure Vulnerability**
- **Ice Shelf Collapse Scenarios:** No integrated modeling of Larsen C / Thwaites / Pine Island collapse impacts on shipping lanes, cable routes, station access
- **Sea Level Rise Fingerprints:** GRACE-FO gravity + altimetry not integrated for Antarctic contribution to regional SLR
- **Permafrost / Ground Ice:** Station infrastructure risk (e.g., McMurdo, Rothera, Concordia) not mapped

#### **7. Biological / Environmental Security**
| Gap | Relevance |
|-----|-----------|
| **Harmful Algal Blooms (HABs)** | Sentinel-3 OLCI chlorophyll not processed for toxin risk |
| **Pathogen Surveillance** | Avian influenza (H5N1) in seabirds — no real-time OBIS/WHO integration |
| **Invasive Species Vectors** | Hull fouling / ballast water risk from gateway ports not modeled |
| **Marine Genetic Resources** | BBNJ treaty (high seas biodiversity) — no DSI (digital sequence info) tracking |

#### **8. Humanitarian / SAR (Search & Rescue) Gaps**
- **RCC Coordination:** No integration of MRCC (Maritime Rescue Coordination Centre) areas — Chile (Punta Arenas), NZ (RCCNZ), Australia (JRCC), South Africa (MRCC Cape Town)
- **Mass Rescue Operations (MRO):** Cruise ship capacity (500-3000 pax) vs. SAR asset availability in Southern Ocean not modeled
- **Medical Evacuation:** No telemedicine / medevac routing layer (Antarctic stations → gateway hospitals)

---

## 📘 Scientific Passport System — Digital Identity & Provenance

**Source:** `apps/web/src/passport/passport-data.ts`, `apps/web/src/pages/Passport.tsx`, `apps/web/src/lib/passport-data-economy.ts`

The **AMOH Scientific Passport** is a prototype digital credential for polar researchers and field observers, tracking identity, observations, expeditions, datasets, and reputation — **not a travel document**.

### **Core Data Model**

| Component | Description | Example Fields |
|-----------|-------------|----------------|
| **Profile** | Identity, role, credentials, XP/gamification | `displayName`, `credentialId` (AMOH-ASP-2026-08842), `passportType`, `role` (Scientific Observer), `specialization`, `orcid`, `worldIdStatus`, `smartCardStatus` (EMULATED_NFC_ISO7816), `amohXp` (720), `nextMilestoneXp` (750) |
| **Stamps** | Georeferenced base visits with officer verification | 6 stamps: O'Higgins (CL), Frei (CL), Palmer (US), Rothera (UK), Vernadsky (UA), Prat (CL) — each with `lat/lng`, `officer`, `code`, `category` (PLACE/EXPEDITION/OCEAN/ICE/FIELD/WILDLIFE), `verified=true` |
| **Observations** | Evidence-linked scientific records | 5 observations: thermal anomaly (CTD), krill aggregation (EK80), glacial calving (DJI+Sentinel-2), AIS vessel verification, catabatic wind event (Vaisala) — each with `evidenceId`, `qcStatus=verified`, `sensor`, `method`, `accuracy` |
| **Expeditions** | Campaign participation | AMOH-SUR-XXVI (BIO Hespérides), OSIRIS-POLAR-26 (Laurence M. Gould), PB124-OLEA-2026 (Pacific World) |
| **Datasets** | Published data with DOIs | 3 Zenodo datasets (CTD casts, acoustic backscatter, UAV thermal) — CC-BY-4.0, 1.42GB/840MB/4.8GB |
| **Grants & Rewards** | Funding + optional WLD rewards | SCAR Grant ($25k), CCAMLR Fund ($18.5k under review), World Protocol Fellowship (1,500 WLD disbursed) |
| **Achievements** | Milestone badges | Drake Crossing, Below Antarctic Circle, Treaty Sentinel (50 verified obs), Bio-Telemetry Master |

### **Technical Features**
- **Smart Card Emulation:** NFC ISO 7816 virtual card for base access
- **World ID Integration:** Optional human verification via World Protocol (privacy-preserving)
- **Provenance Chain:** Every observation → `evidenceId` → sensor → method → accuracy → QC status
- **Gamification:** XP system (720 current), milestones, category badges
- **Privacy:** `status: PROTOTYPE`, `validityNote: "Prototipo de pasaporte científico. Sin validez migratoria."`

### **Use Cases**
- Base access control (digital stamp replaces paper logbooks)
- Expedition credentialing (verified participation)
- Data provenance (link observations → datasets → publications)
- Reputation & funding (grants, WLD rewards, peer recognition)
- Treaty compliance (Art. VII inspection readiness)

---

## 🎯 In-Situ Observation Capabilities — Field Data Acquisition

**Source:** `apps/web/src/pages/MobileContribute.tsx` (PB124 Field Connect), `apps/web/src/pages/FieldLoggerPage.tsx` (Edge Field Logger), `apps/web/src/components/ObservationModal.tsx` (Public Observatory), `apps/web/src/lib/offline-store.ts`, `apps/web/src/lib/olea-cloud.ts`

OLEA provides **three complementary field observation interfaces** for different user profiles:

### **1. MobileContribute (`/mobile-contribute`) — PB124 Peace Boat Pilot**
- **Target:** Single observer (Meri Joyce) on Peace Boat 124th Global Voyage
- **Authentication:** Private token in URL or `VITE_PB124_PUBLIC_MODE=1`
- **Method:** "Real-vessel methodological pilot" — **no ship systems access** (no NMEA, internal AIS, bridge telemetry, hardware installation)
- **Flow:** Join → Consent → Field Mode ON → GNSS capture → 8 visual fields → **3 mandatory guided photos** (HORIZON, SEA_SURFACE, CONTEXT) → Notes → Save offline → Auto-sync
- **Visual Fields (standardized):** Visibility/horizon (8), Sea state (7), Whitecaps (5), Sea-surface appearance (8), Sky/cloud (6), Environmental context (7), Wildlife (6), Floating material (5)
- **Offline-First:** IndexedDB (`offlineStore` + `mediaStore`) → Cloud Relay (optional) → Local API
- **Evidence Integrity:** SHA-256 lineage, original blobs preserved, **PB124_PHOTOS_NOT_PERSISTED** guard (blocks sync without 3 durable originals)
- **License:** `PRIVATE_RESEARCH_PILOT` (Tier B/C)
- **Guidance:** ~3–5 quality observations per voyage (no quotas, prompts snoozable)

### **2. FieldLoggerPage (`/field-logger`) — Edge Field Logger (Scientists Aboard)**
- **Target:** Researchers on dedicated vessels (NatGeo Resolution, ARC Simón Bolívar, etc.)
- **Expeditions:** NG-LEX-2027-2028, PAC-2027-2028, DRAKE-TRANSIT
- **6 Templates:** Vessel/AIS sighting, Satellite overpass (SAR), Sea ice & icebergs, Polar fauna, Oceanography/CTD, IAATO landing
- **GNSS:** Live device capture or 7 Antarctic presets (Drake, King George, Deception, Gerlache, Neko, Port Lockroy, Lemaire)
- **Storage:** localStorage + IndexedDB (`offlineStore`) → sync to local FastAPI `/api/observations` (DuckDB)
- **Export:** GeoJSON (QGIS/MapLibre), CSV (Python/Pandas/R), Markdown report
- **Shortcut:** `Ctrl+Enter` quick save
- **Backend Sync:** Auto-retry on connection, synced flag tracking

### **3. ObservationModal (`+ Observar`) — Public Observatory (GitHub Pages)**
- **Target:** Any citizen/tourist on public OLEA site
- **Catalog:** 40+ types across 4 groups (Fauna 🐋, Hielo 🧊, Océano/Atmósfera 🌊, Actividad Humana 🚢, Ciencia 🔬)
- **Camera:** Live capture + **"Lente" mode** (continuous AI identification via Supabase Edge Function `olea-vision` — 5s cadence, scene-change detection)
- **AI Assist:** Vision model identifies species/ice/vessels; user adopts or overrides
- **Photos:** Max 8, client-side shrink (1600px, JPEG 0.82)
- **Position:** Browser GNSS (±accuracy) or manual entry
- **Backend:** **Supabase** — photos to `olea-public-observations` bucket, records to `olea_public_observations` table (RLS: INSERT only, anon key public, vision key secret in Edge Function)
- **Status:** `PENDING_REVIEW` (Tier D) — isolated from audited PB124 chain
- **License:** `CC-BY-4.0` (configurable)

### **Common Technical Foundation**
| Feature | Implementation |
|---------|----------------|
| **Offline-First** | IndexedDB (observations + media blobs), SHA-256 file integrity, background sync |
| **Provenance** | UUID per observation, device ID, timestamp (UTC + local), sensor metadata, EXIF preservation |
| **Quality Tiers** | Tier A (instrumental), B (verified researcher), C (crew), D (community) — never auto-promoted |
| **Privacy** | 500m grid k-anonymity (k=5), 90-day media retention, consent scopes (private/shared/public) |
| **Standards** | WGS84, ISO 8601 UTC, Darwin Core compatible, CCAMLR/IAATO metadata alignment |

---

### 🌡️ Environmental & Geophysical Continuous Heatmaps

**Source:** `apps/web/src/lib/continuous-heatmap-runtime.ts`

| Heatmap | Source | Variables | SDG |
|---------|--------|-----------|-----|
| **Fauna Density (Krill)** | `fauna_krill_swarms.geojson`, `fauna_krill.geojson` | biomass_density_g_m2, school_biomass_tons | 14 |
| **Penguin Colonies** | `penguin_colonies.geojson`, Quantarctica API | population, individuals, count | 14 |
| **Cetaceans/Whales** | `whales.geojson`, `fauna_cetaceans.geojson` | individuals, pod_size, count | 14 |
| **GFW Fishing Effort** | `/api/gfw/fishing-effort-heatmap` | hours, apparent_fishing_hours | 14 |
| **Nuclear Contamination** | `nuclear_sites.geojson` | activity_bq_m3, cesium_137, tritium | 14 |
| **Seismic Concentration** | `seismic_events.geojson`, `/api/seismic/events` | magnitude, intensity | 14 |

---

## Local Setup & Full-Stack Connection

### Prerequisites

* **Node.js 24+** and **`pnpm` 11.x**
* **Git** and **`tar`** (used by the asset sync script)
* **Docker** and **Docker Compose** (recommended for FastAPI + DuckDB Spatial), or **Python 3.11+** for native execution

### 1. Clone & Configure

```sh
git clone https://github.com/juanshuertas/antarctic-maritime-observation-hub.git
cd antarctic-maritime-observation-hub
cp .env.example .env
```

```env
ENVIRONMENT=local
EXPEDITION_ID=NGRS-ANTA-2027
DUCKDB_PATH=/app/data/antarctic.duckdb
VITE_BACKEND_URL=http://localhost:8000
VITE_EXPEDITION_ID=NGRS-ANTA-2027
# Optional for hosted LLMs:
NVIDIA_API_KEY=nvapi-...
# Optional for local LLM:
OLLAMA_HOST=http://127.0.0.1:11434
```

> **Offline-First:** External API keys (AISStream, GEE, GCS) optional for local dev. Core map, DuckDB queries, cached assets work offline.

### 2. Start Backend

```sh
docker compose up --build backend
```

Verify: [http://localhost:8000/health](http://localhost:8000/health) · [http://localhost:8000/docs](http://localhost:8000/docs)

**Or native:**
```sh
cd services/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt pytest
python -m pytest tests -v
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend

```sh
git fetch origin pb124-pages
pnpm install
pnpm assets:web
pnpm dev:web
```

Open **[http://localhost:5174/](http://localhost:5174/)** — full-stack local Observatory.

---

## Verification, CI & Deployment

```sh
pnpm typecheck
pnpm build
```

* **CI:** GitHub Actions validates TS types + builds OLEA & PB124 on relevant changes ([CI Workflow](https://github.com/juanshuertas/antarctic-maritime-observation-hub/actions/workflows/ci.yml)).
* **Pages Deploy:** `main` → `pb124-pages` branch via [deploy-pages.yml](.github/workflows/deploy-pages.yml) (4 steps: fetch assets → API snapshot → build with `VITE_PUBLIC_BASE` → deploy `dist-pages-olea/`).
* **Security:** Private tokens, service accounts, field credentials **never** in version control. Share layers per declared redistribution permissions.

---

## Monorepo Scripts (Root `package.json`)

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Start OLEA frontend on `http://localhost:5174` |
| `pnpm typecheck` | Type-check `@amoh/contracts` and `@amoh/web` |
| `pnpm lint` | Run `oxlint` on `@amoh/web` |
| `pnpm build` | Type-check and build all workspace apps |
| `pnpm assets:web` | Import static assets from `origin/pb124-pages` |
| `pnpm snapshot:api` | Export frozen API responses to `public/api-static/` |
| `pnpm build:pages` | Build GitHub Pages bundle to `dist-pages-olea/` |

---

## Architecture Overview

```
pnpm Monorepo
├── packages/contracts (@amoh/contracts)  → Shared TS types
├── apps/web (@amoh/web)                   → React + Vite + MapLibre + Cesium
└── services/backend                       → FastAPI + DuckDB (spatial/AIS/science)
```

**Local Dev:** Vite (:5174) proxies `/api/*` → FastAPI (:8000) → DuckDB  
**GitHub Pages:** Static SPA + fetch shim → `api-static/*.json` default; forwards to `VITE_API_URL`/`VITE_TRAFFIC_API_URL` if set

See [Monorepo Guide](docs/MONOREPO.md) for full architecture diagrams and deployment schema.

---

## ML / AI Integration

| Component | Where | Model | Purpose |
|-----------|-------|-------|---------|
| **NVIDIA Nemotron 3 Ultra (550B)** | Backend `/api/nvidia-llm` | Hosted NIM (`integrate.api.nvidia.com`) | Grounded QA over repo index (data_index.json, MANIFESTs) — sends question + excerpts only |
| **Ollama Local LLM** | Backend `/api/local-llm` | qwen2.5:7b / llama3.1:8b (local) | Same grounding, 100% local — for unpublished expedition data |
| **Supabase Edge Function `olea-vision`** | Frontend `identifyPhoto()` | Vision model (secret in Edge Function) | Species/ice/vessel ID from field photos (1024px compressed) |
| **Ridge / Random Forest (sklearn)** | Python scripts (Khalifa collab) | Geophysical ML | Sediment thickness prediction from gravity+magnetics+bathymetry (MAE 474m, R² 0.835, blocked CV) |
| **DeepStream Import Skill** | `.claude/skills/deepstream-import-vision-model/` | HF/NGC object detection → TRT | Pipeline for importing vision models to NVIDIA DeepStream (not wired in prod) |

**Grounding Contract (both LLMs):** Model never answers from memory. If no index match → "No está en el índice" + which file to check. Response always cites source files.

---

## Documentation

- [Monorepo Architecture & Deployment](docs/MONOREPO.md)
- [Documentation Index](docs/README.md) — topic guides: principles, observatory, data sources, field operations, expeditions, passport, AI, architecture, roadmap, research, about
- [Contributing](CONTRIBUTING.md)
- [Audit & PR Plan](docs/AUDIT_ISSUES_AND_PR_PLAN.md)

---

## Authorship, Software Registration & Licensing

* **Principal Investigator & Author:** Juan Sebastián Huertas Olea (Independent Researcher, Colombia)
* **Official Software Registration:** Registered as Logical Support / Software (*Registro de Soporte Lógico – Software*) with Colombia's National Copyright Directorate (**DNDA**), Filing No. **`1-2026-209733`** (October 27, 2026).
* **License:** The source code in this repository is licensed under the **[MIT License](LICENSE)**. Third-party satellite, maritime, and geophysical datasets integrated or referenced by the observatory (including Copernicus Sentinel, IBCSO v2, AntGG2021, ADMAP-2, AISStream, IAEA MARIS, and OBIS) remain governed by their respective upstream licenses and attribution terms.

Further reading: [Monorepo Architecture](docs/MONOREPO.md) · [Documentation Index](docs/README.md)
