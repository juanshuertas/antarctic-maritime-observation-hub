"""Geodesic and polar distance utilities for AMOH.

Consolidates Haversine calculations (nautical miles and meters) and coordinate
validation into a single null-safe module suitable for Southern Ocean latitudes.
"""
from __future__ import annotations

import math

EARTH_RADIUS_NM: float = 3440.065
EARTH_RADIUS_METERS: float = 6371000.0


def validate_coordinates(lat: float | int | None, lon: float | int | None) -> tuple[float, float]:
    """Validate and convert latitude/longitude into finite floats within valid bounds.

    Raises:
        ValueError: If coordinates are None, NaN/Inf, or outside [-90, 90] / [-180, 180].
    """
    if lat is None or lon is None:
        raise ValueError("Latitude and longitude must not be None")
    try:
        lat_f = float(lat)
        lon_f = float(lon)
    except (TypeError, ValueError) as exc:
        raise ValueError("Latitude and longitude must be numeric") from exc

    if not (math.isfinite(lat_f) and math.isfinite(lon_f)):
        raise ValueError("Latitude and longitude must be finite numbers")
    if not (-90.0 <= lat_f <= 90.0):
        raise ValueError(f"Latitude {lat_f} out of range [-90, 90]")
    if not (-180.0 <= lon_f <= 180.0):
        raise ValueError(f"Longitude {lon_f} out of range [-180, 180]")
    return lat_f, lon_f


def _haversine_with_radius(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    radius: float,
) -> float:
    """Compute great-circle distance using the Haversine formula."""
    lat1_f, lon1_f = validate_coordinates(lat1, lon1)
    lat2_f, lon2_f = validate_coordinates(lat2, lon2)

    phi1 = math.radians(lat1_f)
    phi2 = math.radians(lat2_f)
    dphi = math.radians(lat2_f - lat1_f)
    dlambda = math.radians(lon2_f - lon1_f)

    a = (
        math.sin(dphi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    )
    a = min(1.0, max(0.0, a))
    return 2.0 * radius * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in nautical miles (NM)."""
    return _haversine_with_radius(lat1, lon1, lat2, lon2, EARTH_RADIUS_NM)


def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in meters (m)."""
    return _haversine_with_radius(lat1, lon1, lat2, lon2, EARTH_RADIUS_METERS)


# Backward-compatible alias used by existing callers
haversine = haversine_nm
