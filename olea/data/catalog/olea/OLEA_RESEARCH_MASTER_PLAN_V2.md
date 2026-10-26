# OLEA Master Research Integration V2

## Objective

Convert OLEA from a growing collection of duplicated visual layers into one canonical, source-traceable research architecture.

Scientific flow preserved from the Khalifa proposal:

**Physical / geophysics → environment → ecology → human activity → governance**

Operationally, OLEA also separates:
- Base & Reference
- Observations & Evidence
- Derived & Intelligence

## One-shot behavior

The installer:

1. Creates the canonical research/source catalog in `C:\AMOH\research\olea_catalog` and mirrors it into the public app catalog.
2. Takes provenance snapshots of BAS, Cruising Earth and MARIS pages.
3. Uses existing local MARIS CSV holdings first and builds an Antarctic south-of-60°S GeoJSON plus WAP coverage report.
4. Downloads missing open geophysics from authoritative PANGAEA sources:
   - AntGG2021 — DOI 10.1594/PANGAEA.971238 — CC-BY-4.0.
   - ADMAP open-source transformed grids — DOI 10.1594/PANGAEA.965433 — CC-BY-4.0.
5. Keeps the raw files under `C:\AMOH\data\external\geophysics`.
6. Builds lightweight sampled GeoJSON display derivatives for MapLibre while preserving the raw grids.
7. Enriches RRS Sir David Attenborough only when an existing vessel/webcam geometry is found; coordinates are never invented.
8. Uses BAS/operator sources as authoritative webcam links and Cruising Earth only as a discovery index.
9. Reorganizes the existing Control Center into eight canonical domains without deleting the old layer definitions.
10. Adds explicit Domain / Group / Scientific Role metadata to layer detail.
11. Adds an official webcam action to vessel detail when the feature has a `live_webcam_url`.
12. Builds the main OLEA app and then the PB124 public build as a regression gate.
13. Restores all modified source files from a timestamped backup if either build fails.

## Canonical layer domains

1. Base & Reference
2. Physical Earth & Geophysics
3. Environment — Atmosphere · Ocean · Cryosphere
4. Ecology & Biodiversity
5. Human Activity & Maritime
6. Conservation & Governance
7. Observations & Evidence
8. Derived & Intelligence

## Scientific-use rule

A visible map layer is not automatically an ML feature.

Roles include:

`BASE_REFERENCE`, `PHYSICAL_PREDICTOR`, `ENVIRONMENT_STATE`, `IN_SITU_OBSERVATION`,
`FIELD_EVIDENCE`, `ECOLOGICAL_EVIDENCE`, `HUMAN_ACTIVITY_EVIDENCE`,
`MANAGEMENT_CONTEXT`, `LEGAL_CONTEXT`, `LIVE_CONTEXT`,
`CONDITIONAL_CONTEXT`, `DERIVED`, `EXPERIMENTAL_CONTEXT`.

AntGG/ADMAP remain subject to physical plausibility review and ablation.
MARIS remains conditional until its Antarctic/WAP space-time-compartment-nuclide coverage is reviewed.

## Acquisition guardrails

- Open scientific data may be downloaded automatically.
- No paid services.
- No third-party webcam image scraping/rehosting.
- Cruising Earth is discovery/reference, not the scientific data owner.
- No global MARIS bulk dump is downloaded merely because a local extract is missing; a missing scoped Antarctic extract is reported as a data gap rather than fabricating relevance.
- No scientific source file is deleted.
- No Git push is performed.
