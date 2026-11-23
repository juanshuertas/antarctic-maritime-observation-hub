import { useMemo } from 'react';

/**
 * AMOH — cartographic scale bar.
 * Ported from OSIRIS (src/components/ScaleBar.tsx), restyled with the WOD
 * mono token for lat/lon/scale readouts.
 */
interface ScaleBarProps {
  zoom: number;
  latitude: number;
}

const SCALE_STEPS = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0002, 0.0001, 0.00005, 0.00002, 0.00001];

export function scaleFor(zoom: number, latitude: number): { barWidth: number; label: string } {
  // MapLibre uses a 512px world at zoom zero, not the 256px raster convention.
  const safeZoom = Number.isFinite(zoom) ? Math.max(0, Math.min(24, zoom)) : 0;
  const safeLatitude = Number.isFinite(latitude) ? Math.max(-85.051129, Math.min(85.051129, latitude)) : 0;
  const metersPerPx = (40075016.686 / 512) * Math.cos(safeLatitude * Math.PI / 180) / 2 ** safeZoom;
  const maxWidth = 100;
  const maxMeters = metersPerPx * maxWidth;
  const maxKm = maxMeters / 1000;

  let bestStep = SCALE_STEPS[SCALE_STEPS.length - 1];
  for (const step of SCALE_STEPS) {
    if (step <= maxKm) { bestStep = step; break; }
  }

  const barWidth = Math.round((bestStep * 1000) / metersPerPx);
  const label = bestStep >= 1 ? `${bestStep} km` : bestStep >= 0.001 ? `${Math.round(bestStep * 1000)} m` : `${Math.round(bestStep * 100000)} cm`;

  return { barWidth, label };
}

export default function ScaleBar({ zoom, latitude }: ScaleBarProps) {
  const scaleInfo = useMemo(() => scaleFor(zoom, latitude), [zoom, latitude]);

  return (
    <div className="flex items-center gap-1.5 pointer-events-none select-none" aria-label={`Approximate scale at map center: ${scaleInfo.label}`}>
      <div className="flex flex-col items-start">
        <div className="relative" style={{ width: scaleInfo.barWidth }}>
          <div className="absolute left-0 top-0 w-px h-[5px] opacity-50" style={{ background: 'var(--wod-text-main)' }} />
          <div className="absolute right-0 top-0 w-px h-[5px] opacity-50" style={{ background: 'var(--wod-text-main)' }} />
          <div className="mt-[4px] h-px opacity-60 w-full" style={{ background: 'var(--wod-text-main)' }} />
        </div>
      </div>
      <span className="text-[9px] tracking-widest opacity-70 leading-none" style={{ fontFamily: 'var(--wod-font-mono)', color: 'var(--wod-text-main)' }}>
        {scaleInfo.label}
      </span>
    </div>
  );
}
