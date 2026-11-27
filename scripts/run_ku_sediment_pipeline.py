"""Sample polar source rasters onto a common EPSG:3031 grid with GDAL 3+."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from osgeo import gdal

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "bed_m": "Dorschel_IBCSO_Bed_500m.tif",
    "tid": "Dorschel_IBCSO_TID_500m.tif",
    "gravity_mgal": "Scheinert_AntGG_GravityAnomaly_5km.tif",
    "bouguer_mgal": "Scheinert_AntGG_BouguerAnomaly_5km.tif",
    "magnetic_b_nt": "Golynsky_ADMAP-2B_MagneticAnomalySurfaceOnly_2km.tif",
    "magnetic_s_nt": "Golynsky_ADMAP-2S_MagneticAnomalySurfaceAndSatellites_5km.tif",
    "ice_speed_m_year": "Mouginot_MEaSUREs_IceSurfaceFlowSpeed_450m_QA.tif",
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, default=Path(r"C:\AMOH\data\quantarctica\v4\raw\Quantarctica4"))
    parser.add_argument("--output", type=Path, default=ROOT / "apps/web/public/data/science/ku_geophysics_3d.json")
    args = parser.parse_args()
    gdal.UseExceptions()
    sources, columns = {}, {}
    for key, name in FILES.items():
        path, = args.archive.rglob(name)
        source = gdal.Open(str(path))
        grid = gdal.Warp("", source, format="MEM", dstSRS="EPSG:3031",
                         outputBounds=(-4000000, -4000000, 4000000, 4000000),
                         width=80, height=80, resampleAlg="near", overviewLevel="NONE",
                         outputType=gdal.GDT_Float32, dstNodata=-999999)
        values = grid.GetRasterBand(1).ReadAsArray().flatten()
        columns[key] = [round(float(v), 2) if np.isfinite(v) and v != -999999 else None for v in values]
        sources[key] = {"file": name, "metadata": str(path.with_suffix(".qmd").relative_to(args.archive).as_posix()),
                        "archive": "Quantarctica 4", "sampling": "nearest native pixel"}
    columns["admap_s_only"] = [s is not None and b is None for b, s in zip(columns["magnetic_b_nt"], columns["magnetic_s_nt"])]
    doc = {"crs": "EPSG:3031", "upper_left_corner_m": [-4000000,4000000], "cell_m": 100000,
           "width":80, "height":80,"order":"row-major, north to south; pixel centers",
           "sources":sources,"columns":columns,"kind":"sampled geophysical grids",
           "validation":{"status":"unavailable","reason":"Independent seismic thickness labels required for spatial block validation."}}
    args.output.parent.mkdir(exist_ok=True, parents=True)
    encoded = json.dumps(doc, allow_nan=False, separators=(",", ":")).encode()
    args.output.write_bytes(encoded)
    print(args.output, len(encoded), hashlib.sha256(encoded).hexdigest())


if __name__ == "__main__":
    main()
