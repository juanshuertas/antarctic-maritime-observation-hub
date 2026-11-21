import {
  Check,
  ChevronRight,
  Clock3,
  Compass,
  MapPinned,
  Smartphone,
} from 'lucide-react';

import {
  PB124_ZONES,
  getPB124ScheduleZone,
  type PB124Zone,
} from '../lib/pb124-itinerary';

type Variant = 'overview' | 'map' | 'field' | 'review';

type Props = {
  variant?: Variant;
  selectedZoneId?: string | null;
  onSelectZone?: (zone: PB124Zone) => void;
  observationCount?: number;
};

const VOYAGE_START = new Date('2026-08-20T00:00:00Z').getTime();
const VOYAGE_END = new Date('2026-12-07T23:59:59Z').getTime();

function scheduleState(zone: PB124Zone, today: string) {
  if (today > zone.scheduleEnd) return 'past';
  if (today >= zone.scheduleStart && today <= zone.scheduleEnd) return 'current';
  return 'upcoming';
}

function scheduleProgress(nowMs: number) {
  const bounded = Math.max(VOYAGE_START, Math.min(VOYAGE_END, nowMs));
  return ((bounded - VOYAGE_START) / (VOYAGE_END - VOYAGE_START)) * 100;
}

export default function PB124VoyageTimeline({
  variant = 'overview',
  selectedZoneId,
  onSelectZone,
  observationCount,
}: Props) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const scheduleZone = getPB124ScheduleZone(now);
  const progress = scheduleProgress(now.getTime());
  const compact = variant === 'field';

  return (
    <section className={`rounded-[26px] border border-[#183140] bg-[#041018] ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#6e909c]">
            <Compass className="h-3.5 w-3.5 text-[#00d1ff]" />
            Published voyage timeline
          </div>
          <div className={`${compact ? 'mt-1 text-xs' : 'mt-1 text-sm'} font-bold text-white`}>
            PB124 route context · 10 methodological zones
          </div>
          <div className="mt-1 text-[9px] leading-relaxed text-[#6f8d98]">
            Schedule reference only — not live vessel progress, not telemetry, and not an observation quota.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2a4a58] bg-[#071722] px-2.5 py-1 text-[8px] font-bold text-[#9db7c1]">
            <Smartphone className="h-3 w-3 text-[#4de3ff]" />
            PHONE-FIRST
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#355547] bg-[#0a2119] px-2.5 py-1 text-[8px] font-bold text-[#72e0b5]">
            3–5 GOOD OBS · TOTAL VOYAGE
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5c4c28] bg-[#221a0b] px-2.5 py-1 text-[8px] font-bold text-[#f0b35a]">
            NO ZONE QUOTAS
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-[8px] uppercase tracking-[0.14em] text-[#668693]">
          <span>Published schedule progress</span>
          <span>{scheduleZone ? `Current reference window · Zone ${scheduleZone.code}` : 'Outside published voyage window'}</span>
        </div>

        <div className="relative h-1.5 overflow-hidden rounded-full bg-[#102633]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#00d1ff] via-[#4de3ff] to-[#f0b35a]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={`mt-4 flex gap-2 overflow-x-auto pb-2 ${compact ? 'snap-x' : ''}`}>
        {PB124_ZONES.map((zone, index) => {
          const state = scheduleState(zone, today);
          const selected = selectedZoneId === zone.id;
          const current = state === 'current';

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone?.(zone)}
              className={`group relative flex-shrink-0 text-left transition-all ${
                compact ? 'w-[190px] snap-start' : 'w-[210px]'
              } rounded-2xl border p-3 ${
                selected
                  ? 'border-[#f0b35a] bg-[#271c0c]'
                  : current
                    ? 'border-[#735725] bg-[#21180b]'
                    : state === 'past'
                      ? 'border-[#1f4653] bg-[#061722]'
                      : 'border-[#142e3a] bg-[#05131b]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[9px] font-black ${current ? 'text-[#f0b35a]' : 'text-[#71919d]'}`}>
                  Z{zone.code}
                </span>
                <span className={`inline-flex items-center gap-1 text-[8px] font-bold ${
                  current
                    ? 'text-[#f0b35a]'
                    : state === 'past'
                      ? 'text-[#72e0b5]'
                      : 'text-[#5f7d89]'
                }`}>
                  {state === 'past' ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                  {current ? 'SCHEDULE WINDOW' : state === 'past' ? 'PAST WINDOW' : 'UPCOMING'}
                </span>
              </div>

              <div className="mt-2 line-clamp-2 text-[10px] font-bold leading-snug text-white">
                {zone.title}
              </div>
              <div className="mt-1 text-[8px] leading-relaxed text-[#6f8d98]">{zone.subtitle}</div>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#142c36] pt-2">
                <span className="text-[8px] font-bold text-[#f0b35a]">{zone.alertTitle}</span>
                <ChevronRight className="h-3 w-3 text-[#52727e] transition-transform group-hover:translate-x-0.5" />
              </div>

              {index < PB124_ZONES.length - 1 && !compact && (
                <div className="pointer-events-none absolute -right-[9px] top-1/2 hidden -translate-y-1/2 xl:block">
                  <div className="h-px w-4 bg-[#244553]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-[#173746] bg-[#071722] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <MapPinned className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#00d1ff]" />
          <div className="text-[9px] leading-relaxed text-[#89a4ae]">
            <strong className="text-white">Low-burden field rule:</strong> observations are opportunistic.
            There is no requirement to observe in every zone, no daily quota, and no background tracking.
          </div>
        </div>

        {typeof observationCount === 'number' && (
          <div className="flex-shrink-0 rounded-xl border border-[#315747] bg-[#0a2119] px-3 py-1.5 text-[9px] font-bold text-[#72e0b5]">
            REAL OBSERVATIONS · {observationCount}
          </div>
        )}
      </div>
    </section>
  );
}
