import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  TreePine,
  CheckCircle2,
  Plane,
  Eye,
  MapPin,
  ArrowLeft,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  SEED_PAC_ENVIRONMENTAL,
  type EnvironmentalCompliance,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionEnvironment(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [envData] = useState<EnvironmentalCompliance>(SEED_PAC_ENVIRONMENTAL);

  const getDroneStatusBadge = (status: EnvironmentalCompliance['droneFlightAuthorization']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>SOBREVUELO AUTORIZADO</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 text-xs font-bold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>SOLICITUD EN TRÁMITE AMBIENTAL</span>
          </span>
        );
      case 'NOT_AUTHORIZED':
        return (
          <span className="px-3 py-1 rounded-xl bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 text-xs font-bold flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            <span>VUELO ESTRICTAMENTE PROHIBIDO</span>
          </span>
        );
      case 'NOT_REQUIRED':
      default:
        return (
          <span className="px-3 py-1 rounded-xl bg-[#8faab5]/20 text-[#8faab5] text-xs font-bold">
            NO REQUERIDO
          </span>
        );
    }
  };

  const biosecurityItems: { key: keyof EnvironmentalCompliance['biosecurityChecklist']; label: string; desc: string }[] = [
    { key: 'boots', label: 'Botas de Desembarco Polar', desc: 'Aspirado de ranuras, lavado en virkon S al 1% y secado.' },
    { key: 'clothing', label: 'Vestuario Técnico y Velcros', desc: 'Inspección de semillas, esporas y restos orgánicos en bolsillos.' },
    { key: 'gearBags', label: 'Mochilas y Maletines Estancos', desc: 'Desinfección de bases y cintas de sujeción exterior.' },
    { key: 'droneCases', label: 'Estuches Peli de Dron y Sensores', desc: 'Limpieza de ruedas, cierres y precinto de bioseguridad.' },
  ];

  const standardDistances = [
    { species: 'Pingüinos en tránsito o descanso costero', min: 5, rule: 'Nunca interponerse entre el animal y la línea de costa o mar abierto.' },
    { species: 'Colonias y pingüineras activas con nidos', min: 15, rule: 'Prohibido acercamiento cercano en época de cría o muda.' },
    { species: 'Focas de Weddell, cangrejeras y elefantes marinos', min: 15, rule: 'Observación en silencio; evitar despertar animales en témpanos.' },
    { species: 'Leopardos marinos y lobos marinos antárticos', min: 50, rule: 'Comportamiento potencialmente reactivo; mantener distancia prudencial.' },
    { species: 'Cetáceos (ballenas jorobadas, rorcuales, orcas)', min: 100, rule: 'Embarcación a velocidad reducida; no cortar derrotas de nado.' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
              <TreePine className="w-3 h-3" />
              <span>PROTOCOLO DE MADRID & CUMPLIMIENTO AMBIENTAL</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Gobernanza Ambiental, Áreas Protegidas y Bioseguridad
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Gestión rigurosa de impacto ecológico conforme al Anexo V del Tratado Antártico. Autorizaciones de vuelo de dron, distancias mínimas a megafauna y desinfección cuádruple de instrumental.
          </p>
        </div>

        <Link
          to={`/expeditions/${expeditionId}/readiness`}
          className="px-3.5 py-2 rounded-xl bg-[#0d2334] border border-[#1e3b50] hover:border-[#00e5ff]/50 text-xs text-[#d8e7ee] flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>Volver a Matriz</span>
        </Link>
      </div>

      {/* Drone Authorization Card */}
      <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs text-[#8faab5] uppercase tracking-wider">
              Control Aéreo Polar
            </span>
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Plane className="w-4 h-4 text-[#00e5ff]" />
              <span>Autorización de Vuelo para Vehículos Aéreos No Tripulados (UAV / Dron)</span>
            </h3>
          </div>

          <div className="shrink-0">
            {getDroneStatusBadge(envData.droneFlightAuthorization)}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050f16] border border-[#122432] text-xs text-[#8faab5] leading-relaxed">
          <strong className="text-white">REGLA UX AMOH:</strong> El sistema cuenta con soporte para registro de datos de dron (<em>DRONE DATA CAPABLE</em>), pero
          <strong> NINGÚN VUELO PUEDE EJECUTARSE</strong> sin la confirmación oficial del permiso ambiental de la CCO y la anuencia del Capitán del buque. El software bloquea el inicio de misiones aéreas si el estado no es <code>APPROVED</code>.
        </div>
      </div>

      {/* Wildlife Approach Distances & ASPA Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Wildlife Distances */}
        <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#22c55e]" />
              <span>Distancias Mínimas Obligatorias a Fauna Silvestre</span>
            </h3>
            <span className="text-[10px] text-[#22c55e] font-bold">CÓDIGO DE ÉTICA SCAR</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {standardDistances.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#091b29] border border-[#193345] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-white">{item.species}</div>
                  <div className="text-[11px] text-[#8faab5]">{item.rule}</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-[#00e5ff]/15 text-[#00e5ff] font-mono font-bold text-xs shrink-0">
                  {item.min} m
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protected Areas ASPA / ASMA */}
        <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#f59e0b]" />
              <span>Zonas Antárticas Especialmente Protegidas (ASPA / ASMA)</span>
            </h3>
            <span className="text-[10px] text-[#f59e0b] font-bold">PROHIBIDO EL INGRESO SIN PERMISO</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {envData.aspaReferences.map((ref, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#091b29] border border-[#193345] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                    PROTEGIDO
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#10b981]">
                    CONSULTADO EN MATRIZ
                  </span>
                </div>
                <div className="font-bold text-white">{ref}</div>
                <div className="text-[11px] text-[#8faab5]">
                  Revisión obligatoria de coordenadas geográficas en el DuckDB Spatial local antes de desembarco.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biosecurity 4-Step Checklist */}
      <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
            <TreePine className="w-4 h-4 text-[#00e5ff]" />
            <span>Protocolo de Bioseguridad Cuádruple (CLEAN · DISINFECT · INSPECT · CONFIRMED)</span>
          </h3>
          <span className="text-xs text-[#8faab5]">
            Responsable: Coordinador Ambiental PAC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {biosecurityItems.map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-xl bg-[#091b29] border border-[#193345] flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-white">{item.label}</div>
                <div className="text-[11px] text-[#7195a6]">{item.desc}</div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-mono font-bold text-xs shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{envData.biosecurityChecklist[item.key]}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
