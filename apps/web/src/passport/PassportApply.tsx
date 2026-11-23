import { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function PassportApply() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    pseudonym: '',
    role: 'Investigador Principal',
    institution: '',
    expedition: 'AMOH-2026-XXVII',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-8 font-mono max-w-2xl mx-auto">
      <div className="border-b border-[#1b3543] pb-6 text-center space-y-2">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#00e5ff]" />
          <span>Solicitud de Pasaporte Científico Antártico</span>
        </h1>
        <p className="text-xs text-[#8faab5]">
          Acreditación oficial para científicos, personal de base y tripulantes del Océano Austral.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl border-2 border-[#72e0b5]/50 bg-[#0a1722] text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-12 h-12 text-[#72e0b5] mx-auto" />
          <h2 className="text-lg font-bold text-white">¡Solicitud Registrada Exitosamente!</h2>
          <p className="text-xs text-[#8faab5] leading-relaxed">
            Tu número provisional es <span className="text-[#00e5ff] font-bold">AMOH-AQ-2026-PENDING</span>.
            Una vez validada tu participación en base o buque por la autoridad científica, se emitirá tu credencial criptográfica.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl border border-[#213f4f] bg-[#0a1520] space-y-4 shadow-xl">
          <div>
            <label className="text-xs text-[#6e8996] uppercase block mb-1">Nombre o Seudónimo Científico</label>
            <input
              type="text"
              required
              placeholder="Dr(a). Nombre Apellido"
              value={formData.pseudonym}
              onChange={(e) => setFormData({ ...formData, pseudonym: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#1b3543] bg-[#061019] text-white text-xs focus:outline-none focus:border-[#00e5ff]"
            />
          </div>

          <div>
            <label className="text-xs text-[#6e8996] uppercase block mb-1">Rol / Especialidad</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#1b3543] bg-[#061019] text-white text-xs focus:outline-none focus:border-[#00e5ff]"
            >
              <option>Investigador Principal</option>
              <option>Oceanógrafo / Físico Marino</option>
              <option>Biólogo de Ecosistemas / Krill</option>
              <option>Glaciólogo / Criosfera</option>
              <option>Piloto de Dron / Sensores Remotos</option>
              <option>Tripulante de Buque Científico</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#6e8996] uppercase block mb-1">Institución / Afiliación</label>
            <input
              type="text"
              required
              placeholder="Ej: INACH, BAS, USAP, Universidad, Instituto"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#1b3543] bg-[#061019] text-white text-xs focus:outline-none focus:border-[#00e5ff]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold text-xs hover:bg-[#00cce6] transition-colors shadow-lg"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
