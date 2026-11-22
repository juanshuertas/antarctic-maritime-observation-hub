# AI & forecasting

> Pythia, AI analysis, Brier weighting, forecast rings, MiroFish.  
> Part of the [AMOH documentation](README.md).

## 🧠 Pythia

**Pythia** is AMOH's local analytical intelligence layer.

Target local endpoint:

```text
http://localhost:8088
```

Possible local inference environment:

```text
Ollama
llama3.1
qwen3
```

---

### Swarm Council

AMOH currently explores four analytical roles.

#### 🧊 Ice Navigator

Focus:

- sea ice;
- cryosphere;
- route context;
- navigational environment.

#### 🐋 Marine Biologist

Focus:

- biodiversity;
- whales;
- krill;
- ecosystem context.

#### 🚢 Naval Strategist

Focus:

- maritime patterns;
- AIS;
- logistics;
- route activity.

This role is intended for non-operational analytical context.

#### 🔎 Skeptic

Focus:

- uncertainty;
- contradictory evidence;
- weak assumptions;
- false positives.

---

## ⚠️ AI Analysis

Every Pythia result should be clearly identified as:

```text
AI ANALYSIS
```

Relevant outputs should be able to expose:

```text
evidence IDs
source
time
location
assumptions
limitations
```

Artificial intelligence does not replace scientific validation.

---

## 📈 Brier weighting

For verifiable probabilistic forecasts:

```text
BS_i = (1/N) × Σ(f_i,t - o_t)²
```

Agent weight:

```text
W_i = (1 - BS_i)² / Σ(1 - BS_j)²
```

Tests should include:

```text
perfect prediction
poor prediction
equal agents
missing data
single agent
```

---

## 🔮 Forecast Rings

Experimental horizons:

```text
24H
1W
1M
1Y
```

Every Forecast Ring should expose:

```text
SIMULATION
generated_at
model
horizon
assumptions
evidence
limitations
```

A simulation must never be presented as an observation.

---

## 🐟 MiroFish

AMOH can connect with **MiroFish** as a prospective simulation engine.

Workflow:

```text
01 / Ontology Generation
02 / Graph Construction
03 / Parallel Simulation
04 / Report Generation
05 / Deep Interaction
```

AMOH should connect through an adapter rather than unnecessarily reimplementing the existing engine.
