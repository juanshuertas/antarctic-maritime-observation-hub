# Local agents for AMOH

The local agent runtime is installed for the project environment:

- Ollama 0.34.1
- `qwen2.5:3b`
- LangGraph
- NetworkX
- ChromaDB
- Python Ollama client

The 3B model is appropriate for the current 16 GB RAM laptop. It can summarize
records, flag missing metadata, build an evidence graph, and rank review work.
It must not infer a vessel position from a phone GPS position or claim causation.

## Authorized data channels

### Vessels

Use AISStream or an explicitly imported AIS CSV/Parquet file. Preserve MMSI,
source, license, UTC and import provenance. AIS absence is not vessel absence.

### Phones

Only an installed AMOH PWA or an explicitly authorized export may send data.
Each participant must opt in, consent separately to science and media use, and
be able to revoke consent. The app must not scan Wi-Fi, discover phones, read
MAC addresses, intercept traffic, or access ship networks without operator
authorization.

The next implementation step is an authenticated local upload queue for
consented PWA observations. Until that exists, `phone_gps` means a record
submitted through the AMOH observation API, not a discovered phone.

## Start the local model

```powershell
$env:Path = "C:\Program Files\Ollama;$env:Path"
ollama run qwen2.5:3b
```

All local processing stays on the laptop unless a remote provider is explicitly
configured. The model output is assistance for organization and review, not a
scientific measurement or automatic match decision.1