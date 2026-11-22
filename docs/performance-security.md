# Performance & security

> Performance philosophy and metrics, security model.  
> Part of the [AMOH documentation](README.md).

## ⚡ Performance philosophy

AMOH is designed to remain lightweight.

Target home:

```text
1 MapLibre instance
1 WebGL context
minimal default layers
```

The home should not preload:

```text
full Global Fishing Watch analytics
full Quantarctica package
ArcGIS SDK
Passport bundle
Expeditions bundle
World SDK
MiroFish
large charts
art gallery
grant engine
```

These modules should be loaded when requested.

---

## 📉 Performance metrics

Development builds should monitor:

```text
initial requests
MB transferred
map ready time
time to interactive
FPS
WebGL contexts
MapLibre sources
MapLibre layers
visible entities
memory use
```

Optimization should be measured rather than assumed.

---

## 🔐 Security

AMOH follows a defensive-security model.

Application controls may include:

- parameterized SQL;
- input validation;
- XSS protection;
- restrictive CORS;
- CSRF protection where applicable;
- role-based authorization;
- rate limiting;
- Host validation;
- DNS-rebinding protection;
- signed device-pairing challenges.

---

### File uploads

Validate:

```text
MIME type
extension
size
magic bytes
safe filename
safe destination
hash
```

---

### LAN security

A local ship network is not automatically trusted.

AMOH should continue authenticating users and devices.

---

### Defensive testing

Security testing follows defensive methodologies such as OWASP WSTG against AMOH-owned or explicitly authorized environments only.
