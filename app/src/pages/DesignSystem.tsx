import type { ReactNode } from 'react';

const SECTION = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-white/10" style={{ color: 'var(--amoh-text)' }}>{title}</h2>
    <div className="flex flex-col gap-6">{children}</div>
  </section>
);

const COLOR_BLOCK = ({ name, hex, usage }: { name: string; hex: string; usage: string }) => (
  <div className="flex items-center gap-4 p-3 rounded-xl border bg-black/20" style={{ borderColor: 'var(--amoh-border)' }}>
    <div className="w-12 h-12 rounded-lg shadow-inner" style={{ backgroundColor: hex }} />
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ color: 'var(--amoh-text)' }}>{name}</span>
        <span className="text-[10px] font-mono opacity-50">{hex}</span>
      </div>
      <div className="text-xs opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>{usage}</div>
    </div>
  </div>
);

const TYPO_SAMPLE = ({ label, text, style }: { label: string; text: string; style: any }) => (
  <div className="flex flex-col gap-1 p-3 rounded-xl border bg-black/10" style={{ borderColor: 'var(--amoh-border)' }}>
    <span className="text-[10px] uppercase tracking-widest opacity-40">{label}</span>
    <div style={style}>{text}</div>
  </div>
);

export default function DesignSystem() {
  return (
    <div className="p-8 max-w-5xl mx-auto" style={{ color: 'var(--amoh-text)', fontFamily: 'var(--amoh-font-ui)', backgroundColor: 'var(--amoh-bg-ocean)', minHeight: '100vh' }}>
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--amoh-text)' }}>AMOH Visual System</h1>
        <p className="text-lg opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>Living Ocean Observatory — Specification Validation</p>
      </header>

      <SECTION title="Color Palette">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold opacity-50 uppercase mb-2">Surfaces</h3>
            <COLOR_BLOCK name="Abyss" hex="#080E19" usage="Maximum depth / Space background" />
            <COLOR_BLOCK name="Ocean" hex="#101626" usage="Main application background" />
            <COLOR_BLOCK name="Surface" hex="#151F32" usage="Standard panels" />
            <COLOR_BLOCK name="Raised" hex="#1C2940" usage="Elevated cards / Menus" />
            <COLOR_BLOCK name="Border" hex="#35445B" usage="Dividers and outlines" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold opacity-50 uppercase mb-2">Functional Accents</h3>
            <COLOR_BLOCK name="Science" hex="#CAF9F7" usage="Field observations / Evidence" />
            <COLOR_BLOCK name="Satellite" hex="#58D5E3" usage="GEE / Satellite analysis" />
            <COLOR_BLOCK name="Maritime" hex="#35C3C8" usage="AIS / Vessel tracks" />
            <COLOR_BLOCK name="Scenario" hex="#A995FF" usage="Pythia / Simulation" />
            <COLOR_BLOCK name="Action" hex="#FF5100" usage="Primary CTA" />
            <COLOR_BLOCK name="Conservation" hex="#D0E7C8" usage="Ecology / Protected Areas" />
          </div>
        </div>
      </SECTION>

      <SECTION title="Typography">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TYPO_SAMPLE
            label="Header Brand"
            text="AMOH"
            style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
          />
          <TYPO_SAMPLE
            label="Product Descriptor"
            text="Living Ocean Observatory"
            style={{ fontSize: '11px', fontWeight: 500, lineHeight: '16px', opacity: 0.6 }}
          />
          <TYPO_SAMPLE
            label="Panel Title"
            text="Antarctic Research"
            style={{ fontSize: '17px', fontWeight: 600, lineHeight: '24px' }}
          />
          <TYPO_SAMPLE
            label="Main Body"
            text="The ocean is a living system of evidence. We connect AIS, satellite and field data."
            style={{ fontSize: '14px', fontWeight: 400, lineHeight: '22px' }}
          />
          <TYPO_SAMPLE
            label="Technical Data"
            text="UTC 2026-09-17T14:30:00Z | -63.5000, -58.5000"
            style={{ fontSize: '13px', fontFamily: 'var(--amoh-font-data)' }}
          />
          <TYPO_SAMPLE
            label="Editorial"
            text="Sustaining What Sustains Us"
            style={{ fontSize: '40px', fontFamily: 'var(--amoh-font-editorial)', lineHeight: 1.08 }}
          />
        </div>
      </SECTION>

      <SECTION title="Components">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Buttons */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border bg-black/20" style={{ borderColor: 'var(--amoh-border)' }}>
            <h3 className="text-sm font-bold opacity-50 uppercase">Buttons</h3>
            <button className="h-[40px] px-4 rounded-[8px] font-semibold text-black bg-[#FF5100] transition-transform active:scale-95">
              Primary Action
            </button>
            <button className="h-[40px] px-4 rounded-[8px] font-semibold text-black bg-[#CAF9F7] transition-transform active:scale-95">
              Scientific Tool
            </button>
            <button className="h-[40px] px-4 rounded-[8px] font-semibold text-black bg-[#A995FF] transition-transform active:scale-95">
              Pythia Analysis
            </button>
            <button className="h-[40px] px-4 rounded-[8px] border border-white/20 text-white hover:bg-white/10 transition-colors">
              Secondary Ghost
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border bg-black/20" style={{ borderColor: 'var(--amoh-border)' }}>
            <h3 className="text-sm font-bold opacity-50 uppercase">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-green-500/30 bg-green-500/10 text-green-400">LIVE</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">DELAYED</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-blue-500/30 bg-blue-500/10 text-blue-400">HISTORICAL</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-purple-500/30 bg-purple-500/10 text-purple-400">SIMULATION</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-red-500/30 bg-red-500/10 text-red-400">OFFLINE</span>
            </div>
          </div>

          {/* Markers */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border bg-black/20" style={{ borderColor: 'var(--amoh-border)' }}>
            <h3 className="text-sm font-bold opacity-50 uppercase">Map Markers</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#CAF9F7] shadow-[0_0_8px_#CAF9F7]" />
                <span className="text-[10px] opacity-60">Field</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-white shadow-[0_0_8px_white]" />
                <span className="text-[10px] opacity-60">Station</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rotate-45 bg-[#35C3C8] shadow-[0_0_8px_#35C3C8]" />
                <span className="text-[10px] opacity-60">AIS</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[#A995FF] bg-transparent" />
                <span className="text-[10px] opacity-60">Scenario</span>
              </div>
            </div>
          </div>
        </div>
      </SECTION>
    </div>
  );
}
