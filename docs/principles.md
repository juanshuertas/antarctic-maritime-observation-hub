# Project status & scientific principles

> Maturity of each capability, data states, and the Observation ≠ Causation principle.  
> Part of the [AMOH documentation](README.md).

## 🚧 Project status

AMOH is currently an:

```text
ACTIVE RESEARCH PROTOTYPE
```

Not every provider, API or module described in this repository is necessarily enabled in every installation.

Availability depends on:

- API access;
- licenses;
- credentials;
- permissions;
- data-provider policies;
- Internet availability;
- field-network availability;
- scientific datasets;
- local configuration.

AMOH explicitly distinguishes between real observations, delayed information, historical records, simulations and demonstration data.

---

## 🟢 Data states

| State | Meaning |
|---|---|
| `LIVE` | Current according to the provider and its declared latency |
| `DELAYED` | Recent information that is not real-time |
| `RECENT` | Recent observation inside a defined period |
| `HISTORICAL` | Historical record |
| `STALE` | Older than its expected refresh window |
| `OFFLINE` | Provider or connection unavailable |
| `SIMULATION` | Model-generated result |
| `DEMO` | Synthetic demonstration data |
| `UNREVIEWED` | Submitted evidence not yet scientifically reviewed |
| `UNDER_REVIEW` | Evidence currently under review |
| `VALIDATED` | Scientifically reviewed under a defined workflow |
| `REJECTED` | Reviewed and rejected |
| `NOT_CONFIGURED` | Adapter exists but its provider is not configured |

AMOH must never present `DEMO`, `SIMULATION`, historical or unavailable data as `LIVE`.

---

## 🔬 Scientific principle

AMOH follows one essential rule:

> **Observation ≠ Causation**

Spatial or temporal coincidence between:

- a vessel;
- AIS activity;
- a satellite detection;
- fishing activity;
- a whale sighting;
- sea-ice variation;
- a field observation;
- an environmental anomaly;

does **not automatically demonstrate**:

- causality;
- environmental impact;
- illegal activity;
- intent;
- responsibility.

AMOH supports investigation and evidence reconciliation.

It does not manufacture conclusions.
