import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Anchor, Globe } from 'lucide-react';

export default function ContextPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050e14] text-[#edf5f5] font-sans flex flex-col">
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
              Contexto Estratégico & Marco Polar
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#b7c5d8]/10 text-[#b7c5d8] border border-[#b7c5d8]/30 font-semibold">
              STRATEGIC GOVERNANCE
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Gobernanza Polar, Tratado Antártico y Oceanopolítica
          </h1>
          <p className="text-sm text-[#8faab5] max-w-2xl leading-relaxed">
            Fundamentos geopolíticos, jurídicos y estratégicos que rigen la observación marítima
            y la investigación científica en el continente blanco y el Océano Austral.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#071620] border border-[#163040]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#35c3c8]/20 text-[#35c3c8] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Sistema del Tratado Antártico (STA)</h2>
            </div>
            <p className="text-xs text-[#8faab5] leading-relaxed">
              Firmado en Washington en 1959, el Tratado Antártico consagra el continente exclusivamente
              para fines pacíficos y la libertad de investigación científica, congelando todas las
              reclamaciones de soberanía territorial (Artículo IV). AMOH se alinea con este principio
              garantizando el acceso abierto a la información ambiental.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#071620] border border-[#163040]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#72e0b5]/20 text-[#72e0b5] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Protocolo de Madrid sobre Protección Ambiental</h2>
            </div>
            <p className="text-xs text-[#8faab5] leading-relaxed">
              Designa a la Antártida como «reserva natural consagrada a la paz y a la ciencia» y prohíbe
              de manera indefinida toda actividad relacionada con los recursos minerales, excepto la
              investigación científica. Exige evaluaciones de impacto ambiental (EIA) para todas las
              expediciones y actividades turísticas u operativas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#071620] border border-[#163040]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffc845]/20 text-[#ffc845] flex items-center justify-center">
                <Anchor className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">
                Doctrina Oceanopolítica & CODENAL (Colombia en la Antártida)
              </h2>
            </div>
            <p className="text-xs text-[#8faab5] leading-relaxed">
              La proyección bioceánica y antártica de Colombia se fundamenta en la conexión oceanográfica
              entre el Pacífico Tropical Oriental y el Océano Austral (El Niño-Oscilación del Sur).
              A través del Programa Antártico Colombiano (PAC) y el Comando General de las Fuerzas Militares /
              CODENAL, se impulsa la soberanía basada en el conocimiento, la hidrografía polar y el monitoreo
              marítimo estratégico con plataformas científicas nacionales.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
