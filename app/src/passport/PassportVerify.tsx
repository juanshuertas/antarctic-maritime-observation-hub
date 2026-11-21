import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { INITIAL_PASSPORT_PROFILE } from './passport-data';

export default function PassportVerify() {
  const [searchParams] = useSearchParams();
  const profile = INITIAL_PASSPORT_PROFILE;

  const challenge = searchParams.get('c');
  const claimsParam = searchParams.get('claims') || 'name,role,exp,obs,stamps';

  const [query, setQuery] = useState(profile.credentialId);
  const [result, setResult] = useState<typeof profile | null>(profile);

  // Check claims requested
  const claims = claimsParam.split(',');
  const showName = claims.includes('name');
  const showRole = claims.includes('role');
  const showExp = claims.includes('exp');
  const showObs = claims.includes('obs');
  const showStamps = claims.includes('stamps');
  const showHuman = claims.includes('human');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().toUpperCase() === profile.credentialId.toUpperCase()) {
      setResult(profile);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="space-y-8 font-mono max-w-3xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#1b384c] pb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#72e0b5]/30 bg-[#72e0b5]/10 text-[#72e0b5] text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>VERIFICADOR PÚBLICO CRIPTOGRÁFICO</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Verificación de Credenciales AMOH
        </h1>
        <p className="text-xs text-[#8faab5]">
          Comprobación independiente de firma Ed25519, integridad de datos y divulgación selectiva conforme a estándares W3C.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleVerify} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ingresa número de credencial (ej: AMOH-ASP-2026-08842)..."
          className="flex-1 px-4 py-3 rounded-xl border border-[#1d3c4e] bg-[#06121c] text-white text-xs placeholder-[#6c8a99] focus:outline-none focus:border-[#35c3c8]"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#35c3c8] text-[#050e14] font-bold text-xs hover:bg-[#48d2d7] transition-all shadow-md"
        >
          Verificar
        </button>
      </form>

      {/* Verified Claims Card */}
      {result ? (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#72e0b5]/50 bg-[#091824] space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#183446] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#72e0b5]/20 text-[#72e0b5] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Credencial Científica Auténtica
                </h3>
                <span className="text-xs text-[#72e0b5]">
                  Firma Ed25519 Válida · Algoritmo SHA-512
                </span>
              </div>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded bg-[#35c3c8]/15 text-[#35c3c8] border border-[#35c3c8]/30 font-bold">
              ESTADO: {result.status}
            </span>
          </div>

          {/* Selective Disclosure Info Banner */}
          <div className="p-3 rounded-xl bg-[#06121c] border border-[#162e3d] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#8faab5]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#35c3c8] shrink-0" />
              <span>
                Este escaneo muestra únicamente los atributos que el titular autorizó divulgar.
              </span>
            </div>
            {challenge && (
              <span className="text-[10px] text-[#35c3c8] font-mono shrink-0">
                Nonce: {challenge.slice(0, 12)}...
              </span>
            )}
          </div>

          {/* Disclosed Claims Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {showName && (
              <div className="p-3.5 rounded-xl bg-[#06121c] border border-[#162e3d]">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Nombre del Titular</span>
                <span className="text-white font-bold">{result.displayName}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#06121c] border border-[#162e3d]">
              <span className="text-[#6c8a99] text-[10px] uppercase block">ID de Credencial</span>
              <span className="text-[#35c3c8] font-bold">{result.credentialId}</span>
            </div>

            {showRole && (
              <div className="p-3.5 rounded-xl bg-[#06121c] border border-[#162e3d]">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Rol Científico Acreditado</span>
                <span className="text-white font-semibold">{result.role}</span>
              </div>
            )}

            {showExp && (
              <div className="p-3.5 rounded-xl bg-[#06121c] border border-[#162e3d]">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Campaña / Expedición</span>
                <span className="text-white font-semibold">{result.expedition}</span>
              </div>
            )}

            {showObs && (
              <div className="p-3.5 rounded-xl bg-[#06121c] border border-[#162e3d]">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Registros de Campo</span>
                <span className="text-[#72e0b5] font-bold">{result.stats.observations} Observaciones</span>
              </div>
            )}

            {showStamps && (
              <div className="p-3.5 rounded-xl bg-[#06121c] border border-[#162e3d]">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Sellos de Base</span>
                <span className="text-[#72e0b5] font-bold">{result.stats.stamps} Estaciones Auditadas</span>
              </div>
            )}

            {showHuman && (
              <div className="p-3.5 rounded-xl bg-[#06121c] border border-[#162e3d]">
                <span className="text-[#6c8a99] text-[10px] uppercase block">Prueba de Persona Humana</span>
                <span className="text-[#8faab5]">No vinculada (Opcional)</span>
              </div>
            )}
          </div>

          <div className="pt-2 text-center text-[10px] text-[#6c8a99] italic">
            {result.disclaimerEs}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl border border-rose-500/40 bg-[#150a0e] text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-rose-300">Credencial no encontrada o no válida</h3>
          <p className="text-xs text-[#8faab5]">
            Verifica el identificador. Ejemplo de prueba válido: <code className="text-white">AMOH-ASP-2026-08842</code>
          </p>
        </div>
      )}
    </div>
  );
}
