
import duckdb
import math
from typing import List, Dict, Any
from datetime import datetime, timedelta

class EnvironmentalService:
    """
    Simula la integración con NASA Earthdata.
    En un entorno real, este servicio llamaría a las APIs de NASA (como MODIS o AMSR2).
    """
    def __init__(self, db_conn: duckdb.DuckDBPyConnection):
        self.db = db_conn

    def get_context(self, lat: float, lon: float, utc: datetime) -> Dict[str, Any]:
        # Simulación de datos basados en coordenadas antárticas
        # En producción: fetch de NASA Earthdata API

        # Ejemplo: El hielo es más probable al sur (-60 lat)
        sea_ice_conc = 0.8 if lat < -65 else (0.2 if lat < -60 else 0.0)

        # Ejemplo: Zonas de alta clorofila (frentes polares)
        chlorophyll = 1.5 if (-62 < lat < -58) and (-65 < lon < -50) else 0.3

        # Temperatura superficial del mar (SST)
        sst = -1.5 if lat < -65 else 1.0

        return {
            "sea_ice_concentration": sea_ice_conc, # 0.0 to 1.0
            "chlorophyll_mg_m3": chlorophyll,
            "sst_celsius": sst,
            "source": "NASA_Simulated_Earthdata"
        }

    def correlate_vessel_with_environment(self, mmsi: str) -> List[Dict[str, Any]]:
        data = self.db.execute("""
            SELECT utc, latitude, longitude
            FROM ais_vessels
            WHERE mmsi = ?
            ORDER BY utc ASC
        """, [mmsi]).fetchall()

        correlations = []
        for utc, lat, lon in data:
            context = self.get_context(lat, lon, utc)
            correlations.append({
                "utc": str(utc),
                "lat": lat,
                "lon": lon,
                "env": context
            })
        return correlations
