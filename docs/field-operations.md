# Field operations

> DJI/aerial observation, Field Connect, QR pairing, Android Field Node.  
> Part of the [AMOH documentation](README.md).

## 📸 DJI & aerial observations

AMOH can ingest DJI imagery and extract EXIF/XMP information.

Potential metadata:

```text
GPS latitude
GPS longitude
GPS altitude
relative altitude
pitch
roll
yaw
camera model
focal length
image width
timestamp
file hash
```

---

### Ground Sample Distance — GSD

When physical sensor width is known:

```text
GSD = (Sw × H × 100) / (Fr × ImW)
```

Where:

```text
Sw  = sensor width in mm
H   = height above terrain in metres
Fr  = focal length in mm
ImW = image width in pixels
```

Result:

```text
GSD = centimetres / pixel
```

AMOH must never invent camera sensor width.

If it cannot be reliably determined:

```text
GSD = UNAVAILABLE
```

---

## 📱 AMOH Field Connect

**AMOH Field Connect** transforms phones and tablets into voluntary observation nodes.

The PWA can capture, when supported and explicitly permitted:

- GPS;
- location accuracy;
- altitude;
- heading;
- speed;
- camera;
- photographs;
- timestamp;
- device orientation;
- motion;
- notes;
- network status.

Observations can remain local when the device loses Internet access.

---

### Offline observation states

```text
LOCAL
↓
QUEUED
↓
SYNCING
↓
SERVER_RECEIVED
↓
UNDER_REVIEW
↓
APPROVED / REJECTED
```

Failure state:

```text
FAILED
```

---

## 📲 Connecting phones by QR

Inside a ship or expedition LAN, AMOH can generate a QR pointing to the actual local address.

Correct:

```text
http://192.168.x.x:5174/
```

Incorrect:

```text
localhost
127.0.0.1
0.0.0.0
```

A backend endpoint can provide:

```text
GET /api/network-info
```

to resolve the active LAN address.

---

## 📱 Android Field Node

An optional native Android application can extend browser capabilities.

Potential technologies:

```text
Kotlin
Jetpack Compose
Fused Location Provider
SensorManager
Nearby Connections
Local encrypted storage
```

Potential sensors:

- accelerometer;
- gyroscope;
- magnetometer;
- rotation vector;
- barometer;
- ambient light;
- location;
- battery;
- network.

AMOH discovers what hardware actually exists on the device.

It does not assume every phone contains every sensor.

---

### Sensor profiles

```text
ECO
SURVEY
BURST
```

#### ECO

Battery-efficient contextual monitoring.

#### SURVEY

Moderate sampling during an active field session.

#### BURST

Short-duration higher-frequency collection when scientifically justified.

`BURST` should never remain active indefinitely.
