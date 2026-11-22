import { ExternalLink, FileText } from 'lucide-react';

export default function Credits() {
  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col gap-12" style={{ color: 'var(--amoh-text)', fontFamily: 'var(--amoh-font-ui)', backgroundColor: 'var(--amoh-bg-ocean)', minHeight: '100vh' }}>
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-4">Credits & Licenses</h1>
        <p className="text-lg opacity-60" style={{ color: 'var(--amoh-text-secondary)' }}>
          AMOH — Antarctic Maritime Observation Hub
        </p>
      </header>

      <section className="flex flex-col gap-6 p-8 rounded-3xl border shadow-2xl" style={{ borderColor: 'var(--amoh-border)', backgroundColor: 'var(--amoh-surface)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">AMOH Original Code & Platform Architecture</h2>
          <p className="text-sm opacity-80 mb-6" style={{ color: 'var(--amoh-text-secondary)' }}>
            Author & Lead Scientist: <strong className="text-white">Juan Sebastián Huertas Olea</strong> · © 2026 All Rights Reserved
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-white/10"
              style={{ borderColor: 'var(--amoh-border)', color: 'var(--amoh-text)' }}
            >
              <FileText className="w-4 h-4 text-[#38bdf8]" /> GNU AGPL-3.0 License
            </a>
            <a
              href="https://github.com/juanshuertas/antarctic-maritime-observation-hub/blob/main/COPYRIGHT.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-white/10"
              style={{ borderColor: 'var(--amoh-border)', color: 'var(--amoh-text)' }}
            >
              <FileText className="w-4 h-4 text-[#34d399]" /> Blindaje Jurídico & Derechos de Autor
            </a>
            <a
              href="https://github.com/juanshuertas/antarctic-maritime-observation-hub/blob/main/CITATION.cff"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-white/10"
              style={{ borderColor: 'var(--amoh-border)', color: 'var(--amoh-text)' }}
            >
              <FileText className="w-4 h-4 text-[#f59e0b]" /> Citación Científica (CFF)
            </a>
          </div>
        </div>
      </section>

      {/* Nobel Peace Manifesto & Digital Nansen Protocol */}
      <section className="flex flex-col gap-6 p-8 rounded-3xl border shadow-2xl bg-gradient-to-br from-[#071c2b] to-[#04121b]" style={{ borderColor: '#23587a' }}>
        <div className="flex items-center justify-between border-b border-[#1b435c] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕊️</span>
            <div>
              <h2 className="text-xl font-bold text-white">
                Manifiesto por la Paz Polar & Carta Digital Nansen
              </h2>
              <p className="text-xs text-[#58d5e3] font-mono">
                Doctrina de los Tres Planos de Verdad y Diplomacia Científica Multilateral
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 font-bold">
            PATRIMONIO DE LA HUMANIDAD
          </span>
        </div>

        <p className="text-sm text-[#a4c5d6] leading-relaxed">
          AMOH fue concebido por el oceanógrafo polar y arquitecto de sistemas <strong className="text-white">Juan Sebastián Huertas Olea</strong> como un instrumento abierto e incorruptible para salvaguardar el <strong className="text-[#38bdf8]">Tratado Antártico de 1959</strong>, verificar la desnuclearización (IAEA MARIS) y desmilitarización del Océano Austral, y blindar el <strong className="text-[#f59e0b]">horizonte 2048</strong> contra la explotación minera.
        </p>

        <div className="p-4 rounded-2xl bg-[#061824] border border-[#163e57] text-xs font-mono text-[#8faab5] space-y-2">
          <div className="text-white font-bold text-[11px] uppercase tracking-wider">
            Principios Inviolables de AMOH:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-[#082233] border border-[#1d4d6b]">
              <strong className="text-[#38bdf8] block mb-0.5">1. Code Truth</strong>
              Cero censura, algoritmos abiertos y públicos.
            </div>
            <div className="p-2.5 rounded-xl bg-[#082233] border border-[#1d4d6b]">
              <strong className="text-[#34d399] block mb-0.5">2. Runtime Truth</strong>
              Cero datos ficticios ni simulación engañosa.
            </div>
            <div className="p-2.5 rounded-xl bg-[#082233] border border-[#1d4d6b]">
              <strong className="text-[#a855f7] block mb-0.5">3. Data Truth</strong>
              Soberanía de datos y procedencia inmutable.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <span className="text-xs font-mono text-[#7ea3b7]">
            Inspirado en el legado de Fridtjof Nansen (Premio Nobel de la Paz 1922).
          </span>
          <a
            href="/governance"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a6a6] to-[#0284c7] hover:from-[#35c3c8] hover:to-[#38bdf8] text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <span>Ir al Observatorio de Paz</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-center mb-4">Third Party Contributions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreditCard
            name="God's Eye View"
            description="Cartographic engine and geospatial navigation."
            link="https://github.com/bilawalsidhu/gods-eye-view"
          />
          <CreditCard
            name="Pythia"
            description="Intelligence feed and contextual synthesis."
            link="https://github.com/jangles-byte/Pythia"
          />
          <CreditCard
            name="OSIRIS"
            description="Map projection and terrain primitives."
            link="#"
          />
          <CreditCard
            name="MiroFish"
            description="Vessel simulation and density modeling."
            link="#"
          />
          <CreditCard
            name="Quantarctica"
            description="Antarctic scientific geospatial datasets."
            link="https://www.quantarctica.org/"
          />
          <CreditCard
            name="Google Earth Engine"
            description="Satellite data processing and geospatial analysis."
            link="https://earthengine.google.com/"
          />
        </div>
      </section>

      <footer className="mt-auto py-12 text-center opacity-70 text-xs font-mono border-t space-y-1" style={{ borderColor: 'var(--amoh-border)' }}>
        <p>© 2026 Juan Sebastián Huertas Olea. All original code licensed under the GNU AGPL-3.0.</p>
        <p>AMOH™ and brand identity elements are proprietary trademarks. Moral rights of paternity and integrity fully reserved.</p>
        <p className="opacity-60">Third-party components retain their respective licenses. See THIRD_PARTY_NOTICES.md for details.</p>
      </footer>
    </div>
  );
}

function CreditCard({ name, description, link }: { name: string; description: string; link: string }) {
  return (
    <div className="p-6 rounded-2xl border flex flex-col gap-3 transition-all hover:bg-white/5" style={{ borderColor: 'var(--amoh-border)', backgroundColor: 'var(--amoh-surface-raised)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold" style={{ color: 'var(--amoh-science)' }}>{name}</h3>
        <a href={link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ExternalLink className="w-4 h-4 opacity-60" />
        </a>
      </div>
      <p className="text-sm opacity-70" style={{ color: 'var(--amoh-text-secondary)' }}>{description}</p>
    </div>
  );
}
