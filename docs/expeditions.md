# Expeditions & science hub

> Expeditions, NGS–Lindblad concept, Colombian Antarctic Programme, Science Hub, matchups.  
> Part of the [AMOH documentation](README.md).

## 🚢 Expeditions

The `/expeditions` area converts AMOH into a continuity platform for scientific campaigns.

Core model:

```text
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
```

---

## 🟨 NGS–Lindblad Visiting Scientist research concept

AMOH includes a research workspace prepared around a proposal concept for the:

```text
NGS–Lindblad Expeditions
Visiting Scientist Program
Southern Ocean 2027–2028
```

Research concept:

> **Where and when does maritime activity concentrate along the Antarctic Peninsula, and can AIS, satellite observations and field validation help identify where closer environmental monitoring is most needed?**

Method:

```text
AIS
+
SATELLITE
+
FIELD
↓
MATCH
↓
REVIEW
↓
OUTPUT
```

Unless formally confirmed, this workspace remains:

```text
PROPOSAL
```

Its presence in AMOH does **not** imply selection, funding, endorsement or partnership by National Geographic or Lindblad Expeditions.

---

## 🇨🇴 Programa Antártico Colombiano

AMOH is also being designed to support expedition workflows related to the **Programa Antártico Colombiano — PAC**.

The architecture allows successive expedition cycles without hardcoding a single year.

Potential lifecycle:

```text
CALL
↓
APPLICATION
↓
EVALUATION
↓
SELECTION
↓
PREPARATION
↓
PRE-ANTARCTIC TRAINING
↓
MEDICAL / ADMINISTRATIVE READINESS
↓
LOGISTICS
↓
DEPLOYMENT
↓
FIELD SCIENCE
↓
RETURN
↓
REPORTING
↓
SCIENTIFIC PRODUCTS
↓
LESSONS LEARNED
↓
ARCHIVE
```

AMOH distinguishes between:

```text
PROPOSAL
SELECTED
PLANNING
READY
ACTIVE
RETURNING
REPORTING
COMPLETED
ARCHIVED
```

A proposal must never automatically appear as a completed expedition.

---

## 🔬 Science Hub

Each expedition may expose an **AMOH Science Hub** through QR.

Potential contributor types:

```text
RESEARCHER
EXPEDITION STAFF
GUEST / COMMUNITY
```

Scientific contribution workflow:

```text
SUBMIT
↓
REVIEW
↓
MATCH
↓
USE
```

No submission becomes validated science automatically.

---

## 🧪 Scientific Matchups

AMOH can reconcile:

```text
FIELD OBSERVATION
+
AIS
+
SATELLITE
+
ENVIRONMENTAL CONTEXT
```

Possible outcomes:

```text
MATCH
PARTIAL_MATCH
NO_MATCH
DATA_GAP
CONFLICT
```

A disagreement between sources is scientifically useful information and should be preserved.
