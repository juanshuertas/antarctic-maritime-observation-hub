import { useState } from 'react';
import { STORYMAP_CHAPTERS } from '../lib/storymap-cryosphere';
import {
  Satellite,
  Compass,
  Play,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Split,
  Info,
} from 'lucide-react';

interface CryosphereStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToPreset: (preset: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  }) => void;
  onActivateLayer?: (layerId: string) => void;
  onOpenSwipe?: () => void;
}

export default function CryosphereStoryModal({
  isOpen,
  onClose,
  onFlyToPreset,
  onActivateLayer,
  onOpenSwipe,
}: CryosphereStoryModalProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const chapter = STORYMAP_CHAPTERS[activeChapterIndex];

  if (!isOpen) return null;

  const handleSelectChapter = (index: number) => {
    setActiveChapterIndex(index);
    const target = STORYMAP_CHAPTERS[index];
    onFlyToPreset(target.cameraPreset);
    if (target.recommendedLayer && onActivateLayer) {
      onActivateLayer(target.recommendedLayer);
    }
  };

  const handleNext = () => {
    if (activeChapterIndex < STORYMAP_CHAPTERS.length - 1) {
      handleSelectChapter(activeChapterIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeChapterIndex > 0) {
      handleSelectChapter(activeChapterIndex - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#07131df2] border border-[#35c3c8]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 backdrop-blur-xl">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d2232] via-[#091b28] to-[#071420] border-b border-[#1f3947] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#35c3c8]/20 border border-[#35c3c8]/50 flex items-center justify-center text-[#35c3c8] shadow-inner">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  The Antarctic from Space · Criosfera Satelital
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#35c3c8] font-mono border border-cyan-500/30">
                  SatSchool & ArcGIS StoryMap
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Módulo educativo e interactivo de teledetección polar · Ross Slater & Morag Fotheringham
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://storymaps.arcgis.com/stories/3bccba89dad7440baaa3afc97cd1359f"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#0e2738] hover:bg-[#15354c] text-xs text-slate-300 hover:text-white border border-[#1f3947] flex items-center gap-1.5 transition-colors"
            >
              StoryMap Original <ExternalLink className="w-3 h-3 text-[#35c3c8]" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Chapter Navigation Sidebar */}
          <div className="w-full md:w-72 bg-[#061019] border-r border-[#1f3947] p-3 space-y-1.5 shrink-0">
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1">
              Capítulos Interactivos ({STORYMAP_CHAPTERS.length})
            </p>
            {STORYMAP_CHAPTERS.map((ch, idx) => {
              const isActive = idx === activeChapterIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChapter(idx)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-[#0d2a3d] border border-[#35c3c8]/80 text-white shadow-md shadow-[#35c3c8]/10'
                      : 'text-slate-400 hover:bg-[#0b1b26] hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-[#35c3c8] text-black font-bold'
                        : 'bg-[#122836] text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight line-clamp-1">
                      {ch.title.replace(/^\d+\.\s*/, '')}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {ch.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Details */}
          <div className="flex-1 p-6 space-y-5 overflow-y-auto bg-gradient-to-b from-[#07131d] to-[#040c12]">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#35c3c8] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Capítulo {activeChapterIndex + 1} de {STORYMAP_CHAPTERS.length}
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                {chapter.title}
              </h2>
              <p className="text-sm text-cyan-300 font-medium">
                {chapter.subtitle}
              </p>
            </div>

            {/* Main Summary */}
            <div className="p-4 rounded-xl bg-[#0a1e2c]/70 border border-[#1f3947] text-slate-300 text-xs sm:text-sm leading-relaxed">
              {chapter.summary}
            </div>

            {/* Scientific Context */}
            <div className="p-4 rounded-xl bg-[#091824]/50 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Info className="w-4 h-4" /> Contexto Glaciológico y Teledetección
              </div>
              <p className="leading-relaxed">{chapter.scientificContext}</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {chapter.keyMetrics.map((metric, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#0c2232] border border-[#1f3947] flex flex-col justify-between"
                >
                  <span className="text-[10px] text-slate-400 font-mono">
                    {metric.label}
                  </span>
                  <span className="text-sm font-bold text-white mt-1">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Satellite Sensors */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Sensores & Constelaciones en Órbita Polar
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chapter.satelliteSensors.map((sensor, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#0e2738] border border-[#1f3947] text-xs font-mono text-cyan-200 flex items-center gap-1.5"
                  >
                    <Satellite className="w-3 h-3 text-[#35c3c8]" />
                    {sensor}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar (Fly to 3D preset, Swipe tool, Activate Layer) */}
            <div className="pt-3 border-t border-[#1f3947] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onFlyToPreset(chapter.cameraPreset)}
                  className="px-3.5 py-2 rounded-xl bg-[#35c3c8] hover:bg-[#28aab0] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-[#35c3c8]/20"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  Volar en Globo 3D
                </button>

                {chapter.interactiveAction && onOpenSwipe && (
                  <button
                    onClick={onOpenSwipe}
                    className="px-3.5 py-2 rounded-xl bg-[#0f2d42] hover:bg-[#163d58] text-[#35c3c8] border border-[#35c3c8]/40 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Split className="w-3.5 h-3.5" />
                    Abrir Swipe Comparador
                  </button>
                )}

                {chapter.recommendedLayer && onActivateLayer && (
                  <button
                    onClick={() => onActivateLayer(chapter.recommendedLayer!)}
                    className="px-3 py-2 rounded-xl bg-[#0e2738] hover:bg-[#16384e] text-slate-300 hover:text-white border border-[#1f3947] text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Activar Capa del Tema
                  </button>
                )}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  disabled={activeChapterIndex === 0}
                  className="p-2 rounded-lg bg-[#0d2232] hover:bg-[#15334a] disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-colors"
                  title="Capítulo Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400 px-1">
                  {activeChapterIndex + 1} / {STORYMAP_CHAPTERS.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={activeChapterIndex === STORYMAP_CHAPTERS.length - 1}
                  className="p-2 rounded-lg bg-[#0d2232] hover:bg-[#15334a] disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-colors"
                  title="Siguiente Capítulo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
