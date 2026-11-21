import { type ReactNode } from 'react';
import { Play, FileText, Map as MapIcon, Table2, ShieldCheck } from 'lucide-react';

/**
 * Resultados esperados (NG-LEX 2027–28).
 * La propuesta aún no tiene viaje ejecutado: no se muestran resultados, DOIs ni repeticiones de ruta.
 * Esta página sólo lista los productos que el proyecto se compromete a generar.
 */
const PLANNED_OUTPUTS = [
  { icon: Table2, title: 'Catálogo de observaciones de campo', desc: 'Observaciones georreferenciadas con UTC, GNSS, procedencia, permisos, incertidumbre y estado de revisión.' },
  { icon: Table2, title: 'Tabla de coincidencias AIS–satélite–campo', desc: 'Acuerdo, acuerdo parcial, desacuerdo, sin candidato, vacío de datos o evidencia insuficiente. No se fuerzan coincidencias.' },
  { icon: MapIcon, title: 'Mapas de actividad marítima y de cobertura / vacíos', desc: 'Concentración de actividad y registro de dónde las fuentes no alcanzan a ver.' },
  { icon: FileText, title: 'Protocolo reproducible y registro de incertidumbre', desc: 'Método, QA/QC y flujo de trabajo reutilizable en otros viajes.' },
  { icon: FileText, title: 'Materiales de comunicación bilingües', desc: 'Presentación para huéspedes y briefing posterior al viaje, sujetos a aprobación.' },
];

export default function ExpeditionOutputs(): ReactNode {
  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-[#1b3543] pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-[#00e5ff]" />
          <span>Resultados Esperados</span>
        </h2>
        <p className="text-xs text-[#8faab5] mt-0.5">
          Productos que la propuesta se compromete a generar. Todavía no existen resultados: no se ha realizado ningún viaje.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#1a1405] border border-[#f59e0b]/40 text-[11px] text-[#f5c46b] font-sans flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Propuesta en preparación: selección no confirmada y sin respaldo de National Geographic ni Lindblad. Observación no es causalidad; los datos de campo, DOIs y mapas aparecerán aquí sólo cuando existan y hayan sido revisados.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANNED_OUTPUTS.map((o) => (
          <div key={o.title} className="p-5 rounded-2xl border border-[#183140] bg-[#081724] space-y-2">
            <div className="flex items-center justify-between">
              <o.icon className="w-4 h-4 text-[#72e0b5]" />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f59e0b]/15 text-[#f59e0b]">Planificado</span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans">{o.title}</h3>
            <p className="text-xs text-[#8faab5] font-sans">{o.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
