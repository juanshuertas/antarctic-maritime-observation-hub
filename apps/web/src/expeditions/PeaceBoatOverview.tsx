import type { ReactNode } from 'react';
import {
  Activity,
  BadgeCheck,
  Camera,
  Database,
  ExternalLink,
  GitCompare,
  MapPinned,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';

import type { Expedition } from './expeditions-data';
import PB124RouteMap from './PB124RouteMap';
import PB124VoyageTimeline from './PB124VoyageTimeline';
import {
  PB124_OFFICIAL_REFERENCE_URL,
  PB124_WAYPOINTS,
  PB124_ZONES,
  getPB124ScheduleZone,
} from '../lib/pb124-itinerary';

export default function PeaceBoatOverview({ expedition }: { expedition: Expedition }): ReactNode {
  const scheduleZone = getPB124ScheduleZone(new Date());

  return (
    <div className="space-y-6 font-mono">
      <section className="relative overflow-hidden rounded-[30px] border border-[#00B4D8]/35 bg-[#041018] shadow-[0_28px_120px_rgba(0,209,255,0.08)]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00d1ff]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#72e0b5]/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-0">
          <div className="2xl:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#72e0b5]/15 border border-[#72e0b5]/30 text-[#72e0b5] text-[10px] font-bold">
                  ACTIVE · REAL VESSEL
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#00B4D8]/15 border border-[#00B4D8]/30 text-[#00E5FF] text-[10px] font-bold">
                  METHOD PILOT
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#0d2334] border border-[#1e3b50] text-[#b9d0da] text-[10px] font-bold">
                  PB124-OLEA-2026
                </span>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#7095a3]">
                  OLEA · Shipboard Field-Observation Workflow
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl lg:text-[34px] leading-tight text-white font-bold font-sans">
                  Peace Boat 124th Global Voyage
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b9cfd8] font-sans">
                  A lightweight, offline-first methodological pilot aboard Pacific World. The research
                  adapts to the voyage — not the voyage to the research.
                </p>
              </div>

              <div className="rounded-2xl border border-[#173746] bg-[#061722]/85 p-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-bold text-[#00E5FF]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Method question
                </div>
                <p className="mt-2 text-sm text-white italic font-sans leading-relaxed">
                  “{expedition.researchQuestion}”
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-2">
              {[
                ['ITINERARY STOPS', `${PB124_WAYPOINTS.length}`],
                ['METHOD ZONES', `${PB124_ZONES.length}`],
                ['GOOD OBS TARGET', '3–5'],
                ['VESSEL SYSTEMS', 'NONE'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#15303f] bg-[#071722] p-3">
                  <div className="text-[9px] uppercase tracking-[0.13em] text-[#668693]">{label}</div>
                  <div className="mt-1 text-sm font-bold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={PB124_OFFICIAL_REFERENCE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#214d5c] bg-[#0b2633] px-4 py-2 text-[10px] font-bold text-[#a8dfe8] transition hover:border-[#00d1ff] hover:text-white"
              >
                Official voyage reference
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#315342] bg-[#0b2219] px-4 py-2 text-[10px] font-bold text-[#72e0b5]">
                <ShieldCheck className="w-3.5 h-3.5" />
                No vessel-system dependency
              </div>
            </div>
          </div>

          <div className="2xl:col-span-7 border-t 2xl:border-t-0 2xl:border-l border-[#15303f] bg-[#020a10]/70 p-3 sm:p-4">
            <PB124RouteMap variant="overview" />
          </div>
        </div>
      </section>

      <PB124VoyageTimeline variant="overview" />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          ['Platform', expedition.shipPlatform || 'Pacific World'],
          ['Field contributor', expedition.primaryFieldContributor || 'Meri Joyce'],
          ['Research admin', expedition.researchAdmin || 'Juan Sebastian Huertas Olea'],
          ['Published schedule window', scheduleZone ? `Zone ${scheduleZone.code} · ${scheduleZone.title}` : 'Outside voyage schedule window'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[#183140] bg-gradient-to-br from-[#081724] to-[#06131c] p-4"
          >
            <span className="text-[9px] text-[#7895a2] uppercase tracking-[0.14em] block">{label}</span>
            <strong className="mt-1 block text-xs text-white font-sans leading-snug">{value}</strong>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 p-5 sm:p-6 rounded-3xl bg-[#081724] border border-[#183140]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#00E5FF] font-bold text-xs uppercase tracking-[0.12em]">
                <MapPinned className="w-4 h-4" />
                Itinerary intelligence
              </div>
              <p className="mt-1 text-[11px] text-[#7895a2] font-sans">
                Ten methodological zones overlay the published itinerary. Alerts are observation guidance — not environmental warnings.
              </p>
            </div>
            <Radio className="w-4 h-4 text-[#f0b35a]" />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PB124_ZONES.map((zone) => (
              <div
                key={zone.id}
                className={`rounded-2xl border p-3 ${
                  zone.id === scheduleZone?.id
                    ? 'border-[#6c5224] bg-[#251b0d]'
                    : 'border-[#142c3a] bg-[#06131c]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold text-[#6f919d]">ZONE {zone.code}</span>
                  {zone.id === scheduleZone?.id && (
                    <span className="rounded-full border border-[#f0b35a]/30 bg-[#f0b35a]/10 px-2 py-0.5 text-[8px] font-bold text-[#f0b35a]">
                      SCHEDULE WINDOW
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] font-bold text-white">{zone.title}</div>
                <div className="mt-1 text-[9px] text-[#728f9a]">{zone.subtitle}</div>
                <div className="mt-2 text-[9px] font-bold text-[#f0b35a]">{zone.alertTitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 space-y-5">
          <div className="p-5 rounded-3xl bg-[#081724] border border-[#183140] space-y-4">
            <div className="flex items-center gap-2 text-[#72e0b5] font-bold text-xs uppercase tracking-[0.12em]">
              <ShieldCheck className="w-4 h-4" />
              What PB124 is
            </div>
            <ul className="space-y-2.5 text-xs text-[#b7cbd4] font-sans">
              <li>• A methodological pilot aboard a real moving passenger vessel.</li>
              <li>• Opportunistic smartphone field observation with explicit Field Mode.</li>
              <li>• Offline-first capture, original photo evidence, hashes and provenance.</li>
              <li>• Approximately 3–5 high-quality observations are enough for the pilot.</li>
            </ul>
          </div>

          <div className="p-5 rounded-3xl bg-[#081724] border border-[#183140] space-y-4">
            <div className="flex items-center gap-2 text-[#f0b35a] font-bold text-xs uppercase tracking-[0.12em]">
              <ShieldCheck className="w-4 h-4" />
              Scientific restraint
            </div>
            <ul className="space-y-2.5 text-xs text-[#b7cbd4] font-sans">
              <li>• Published itinerary is reference only — never observed vessel position.</li>
              <li>• No pollution-detection or causal claim from a visual observation alone.</li>
              <li>• No public real-time vessel tracker.</li>
              <li>• No Peace Boat endorsement claim is implied.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 rounded-3xl border border-[#183140] bg-[#06131c] p-5 sm:p-6">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#6f919d]">
            Field-participation design
          </div>
          <div className="mt-1 text-sm font-bold text-white">
            Low burden for Meri · no rigid sampling duty
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[#91aab4] font-sans">
            The interface treats every zone alert as optional guidance. There is no requirement to observe
            in every zone, no daily quota, and no expectation that Peace Boat changes route or operations.
            A few well-documented observations are more useful than high-volume capture.
          </p>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              ['3–5', 'good observations total'],
              ['PHONE', 'primary field tool'],
              ['0', 'ship-system dependencies'],
              ['OFF', 'background tracking'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#15303f] bg-[#071722] p-3">
                <div className="text-sm font-black text-[#72e0b5]">{value}</div>
                <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#668693]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 rounded-3xl border border-[#584a28] bg-[#20190c] p-5 sm:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f0b35a]">
            Prompt philosophy
          </div>
          <div className="mt-2 text-sm font-bold text-white">Opportunity, not obligation</div>
          <p className="mt-2 text-xs leading-relaxed text-[#c5b998] font-sans">
            Alerts suggest when a new observation may add methodological value. They never represent
            environmental danger, a mandatory task, or a live instruction to the vessel.
          </p>
        </div>
      </section>

      <section className="p-5 sm:p-6 rounded-3xl bg-[#06131c] border border-[#183140]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#6f919d]">PB124 data lineage</div>
            <div className="mt-1 text-sm font-bold text-white">From phone evidence to reviewable scientific provenance</div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
            {[
              [Smartphone, 'Phone'],
              [Database, 'IndexedDB'],
              [Camera, 'Evidence'],
              [Activity, 'Sync'],
              [GitCompare, 'Review'],
              [BadgeCheck, 'Passport'],
            ].map(([Icon, label]: any) => (
              <div key={label} className="min-w-[84px] p-3 rounded-xl bg-[#071722] border border-[#15303f] text-[#9fb8c3]">
                <Icon className="w-4 h-4 mx-auto mb-1 text-[#00E5FF]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
