import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import { PROVIDER_REGISTRY } from '../lib/provider-registry';
import { SAR_PROVENANCE, SAR_SOURCE_CATALOG } from '../lib/olea-sar-layers';

export default function SourcesPage() {
  const navigate = useNavigate();
  const [filterDomain, setFilterDomain] = useState<string>('all');

  const filtered = filterDomain === 'all'
    ? PROVIDER_REGISTRY
    : PROVIDER_REGISTRY.filter((p) => p.domain === filterDomain);

  const domains = Array.from(new Set(PROVIDER_REGISTRY.map((p) => p.domain)));

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-[#142733] bg-[#071620] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/observatory')}
            className="flex items-center gap-2 text-xs font-mono text-[#8faab5] hover:text-[#58d5e3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Observatorio</span>
          </button>
          <div className="h-4 w-px bg-[#1f3947]" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white tracking-wide">
              Registro de Fuentes & Procedencia
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35c3c8]/10 text-[#35c3c8] border border-[#35c3c8]/30 font-semibold">
              SCIENTIFIC PROVENANCE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 flex flex-col gap-6">
        {/* Intro Banner */}
        <div className="p-6 rounded-2xl bg-[#081722] border border-[#1a3848] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Catálogo de Proveedores y Licencias
            </h1>
            <p className="text-sm text-[#8faab5] max-w-2xl leading-relaxed">
              AMOH no inventa datos ni simula actividad en vivo. Esta tabla define la procedencia formal,
              el estado de autenticación en backend, el nivel de latencia/frescura científica y los términos
              de citación de cada servicio integrado.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#051119] border border-[#213f4f] text-xs font-mono text-[#72e0b5]">
              <ShieldCheck className="w-4 h-4" />
              <span>Cero secretos expuestos</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilterDomain('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              filterDomain === 'all'
                ? 'bg-[#35c3c8] text-[#050e14] font-bold'
                : 'bg-[#08151d] text-[#8faab5] hover:text-white border border-[#1b3443]'
            }`}
          >
            Todos ({PROVIDER_REGISTRY.length})
          </button>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setFilterDomain(dom)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all capitalize ${
                filterDomain === dom
                  ? 'bg-[#35c3c8] text-[#050e14] font-bold'
                  : 'bg-[#08151d] text-[#8faab5] hover:text-white border border-[#1b3443]'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[#1a3848] bg-[#071620] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#183547] bg-[#051119] text-[#8faab5] font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Proveedor</th>
                  <th className="py-3.5 px-4 font-semibold">Dominio</th>
                  <th className="py-3.5 px-4 font-semibold">Conjunto de Datos</th>
                  <th className="py-3.5 px-4 font-semibold">Frescura</th>
                  <th className="py-3.5 px-4 font-semibold">Autenticación</th>
                  <th className="py-3.5 px-4 font-semibold">Licencia / Citación</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Documentación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132836]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#091e2b] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[11px] text-[#8faab5] mt-0.5 line-clamp-1">{p.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-[#102431] text-[#58d5e3] border border-[#1f4357]">
                        {p.domain}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#caf9f7] max-w-xs font-medium">
                      {p.dataset}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        p.freshness === 'LIVE' ? 'bg-[#72e0b5]/20 text-[#72e0b5] border border-[#72e0b5]/40 animate-pulse' :
                        p.freshness === 'RECENT' ? 'bg-[#35c3c8]/15 text-[#35c3c8] border border-[#35c3c8]/30' :
                        p.freshness === 'DELAYED' ? 'bg-[#ff8a4c]/15 text-[#ff8a4c] border border-[#ff8a4c]/30' :
                        p.freshness === 'PROPAGATED' ? 'bg-[#a995ff]/15 text-[#a995ff] border border-[#a995ff]/30' :
                        'bg-[#193242] text-[#8faab5]'
                      }`}>
                        {p.freshness}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-[#8faab5]">
                      <div className="flex items-center gap-1.5 text-[#72e0b5]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Configurado</span>
                      </div>
                      <div className="text-[10px] opacity-60">
                        {p.backendOnly ? 'Solo Backend' : 'Acceso Abierto'}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-white font-medium">{p.license}</div>
                      <div className="text-[10px] text-[#8faab5] line-clamp-2 mt-0.5">{p.citationNotes}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={p.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#58d5e3] hover:underline font-mono"
                      >
                        <span>API Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Radar de apertura sintética: lo que la tabla de proveedores no    */}
        {/* puede decir — los límites de la cosecha y cómo aprender a usarla. */}
        {/* ---------------------------------------------------------------- */}
        <div className="p-6 rounded-2xl bg-[#081722] border border-[#1a3848] flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">
              Radar de apertura sintética · qué se contó y qué no
            </h2>
            <p className="text-sm text-[#8faab5] max-w-3xl leading-relaxed">
              Seis capas del observatorio salen de catálogos de radar. Dicen <strong className="text-white">
              dónde miró el radar, cuándo y en qué banda</strong>; no dicen qué vio. Velocidad del hielo,
              detección de buques o vertidos exigen descargar y procesar las escenas, y eso este mapa no lo hace.
            </p>
          </div>

          <div className="rounded-xl bg-[#051119] border border-[#213f4f] p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#58d5e3] mb-3">
              Cosecha del {SAR_PROVENANCE.harvestedAt} · caja {Math.abs(SAR_PROVENANCE.box.west)}–
              {Math.abs(SAR_PROVENANCE.box.east)}° O, {Math.abs(SAR_PROVENANCE.box.north)}–
              {Math.abs(SAR_PROVENANCE.box.south)}° S
            </p>
            <ul className="flex flex-col gap-2.5">
              {SAR_PROVENANCE.missions.map((m) => (
                <li key={m.id} className="text-xs leading-relaxed">
                  <span className="text-white font-semibold">{m.label}</span>
                  <span className="text-[#8faab5]">
                    {' '}· banda {m.band} · {m.product} ·{' '}
                    <span className="font-mono text-[#72e0b5]">{m.scenes.toLocaleString('es')}</span>{' '}
                    {m.scenes === 1 ? 'escena' : 'escenas'} · {m.from} a {m.to}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-[#ff8a4c]">
              <span className="font-semibold">No contados:</span>{' '}
              <span className="text-[#8faab5]">{SAR_PROVENANCE.notCounted.join(' · ')}</span>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#8faab5]">
              Sus catálogos no son consultables sin credenciales, así que la rejilla de cobertura es una{' '}
              <strong className="text-white">cota inferior</strong>: donde el mapa dice «sin pasadas desde
              2021» hay que leer «sin pasadas de estos tres productos».
            </p>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#58d5e3] mb-3">
              Formación · de la huella del mapa a una imagen procesada
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SAR_SOURCE_CATALOG.filter((s) => s.role === 'FORMACION').map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-[#051119] border border-[#213f4f] p-3.5 hover:border-[#35c3c8]/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white leading-snug">{s.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-[#58d5e3]" />
                  </div>
                  <p className="mt-1 text-[10px] font-mono text-[#8faab5]">
                    {s.agency}{s.language ? ` · ${s.language}` : ''}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#8faab5]">{s.note}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
