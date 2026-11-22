# Local data fabric & visualization

> Local storage model and scientific visualization rules.  
> Part of the [AMOH documentation](README.md).

## 🗄️ Local Data Fabric

AMOH uses **DuckDB Spatial** as a lightweight local geospatial analytical engine.

Connected provisioning:

```sql
INSTALL spatial;
```

Runtime:

```sql
LOAD spatial;
```

During offline field operations the extension should already be provisioned.

AMOH must not silently attempt to download it while disconnected.

---

### Vessel tracks

```sql
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
```

---

### Passport claims

```sql
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
```

---

### Forecast rings

```sql
CREATE TABLE forecast_rings (
    ring_id UUID PRIMARY KEY,
    horizon_code VARCHAR,
    confidence_score DOUBLE,
    prophecy_text TEXT,
    center_geom GEOMETRY,
    radius_meters DOUBLE
);
```

---

## 📊 Scientific visualization

AMOH follows three simple visualization rules.

### Missing data ≠ zero

Missing values should create gaps rather than artificial zero measurements.

### Tooltips preserve provenance

Relevant points and series should expose:

```text
value
unit
UTC
source
quality
evidence
```

### Evidence differs from simulation

Suggested visual language:

```text
OBSERVED      continuous
INTERPOLATED  dashed
SIMULATION    visually distinct
```
