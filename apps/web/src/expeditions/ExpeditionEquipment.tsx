import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Wrench,
  CheckSquare,
  Square,
  BatteryCharging,
  Cpu,
  Layers,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import {
  SEED_PAC_EQUIPMENT,
  SEED_PAC_PERSONAL_EQUIPMENT,
  type EquipmentItem,
  type PersonalEquipmentItem,
  getExpedition,
} from './expeditions-data';

export default function ExpeditionEquipment(): ReactNode {
  const { expeditionId = 'exp-pac-13' } = useParams();
  const expedition = getExpedition(expeditionId);
  const [scientificEquip] = useState<EquipmentItem[]>(SEED_PAC_EQUIPMENT);
  const [personalEquip, setPersonalEquip] = useState<PersonalEquipmentItem[]>(SEED_PAC_PERSONAL_EQUIPMENT);
  const [activeTab, setActiveTab] = useState<'SCIENTIFIC' | 'PERSONAL'>('SCIENTIFIC');

  const togglePacked = (id: string) => {
    setPersonalEquip((prev) =>
      prev.map((item) => (item.itemId === id ? { ...item, packed: !item.packed } : item))
    );
  };

  const toggleInspected = (id: string) => {
    setPersonalEquip((prev) =>
      prev.map((item) => (item.itemId === id ? { ...item, inspected: !item.inspected } : item))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091b29] border border-[#1b3543]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              <span>GESTIÓN DE EQUIPOS & CALIBRACIÓN POLAR</span>
            </span>
            <span className="text-[#8faab5] text-xs">
              Expedición: {expedition.title}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Inventario de Sensores Científicos e Indumentaria Técnica
          </h2>
          <p className="text-xs text-[#8faab5] max-w-3xl mt-1">
            Control de calibración, chequeos pre/post uso de instrumentación oceanográfica y lista de chequeo de vestuario polar de 3 capas exigido por el STA.
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

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-3 border-b border-[#1b3543] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('SCIENTIFIC')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SCIENTIFIC'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Equipos Científicos & Sensores ({scientificEquip.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PERSONAL')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PERSONAL'
              ? 'bg-[#00e5ff] text-[#050e14]'
              : 'bg-[#0a1e2b] text-[#8faab5] hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Checklist Vestuario Polar 3 Capas ({personalEquip.length})</span>
        </button>
      </div>

      {/* Scientific Equipment View */}
      {activeTab === 'SCIENTIFIC' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scientificEquip.map((eq) => (
            <div
              key={eq.equipmentId}
              className="p-5 rounded-2xl bg-[#081824] border border-[#173042] hover:border-[#22445c] transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#00e5ff] font-bold">
                      {eq.category}
                    </span>
                    <span className="text-xs text-[#4c6e80]">· {eq.serialOrAssetRef}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">{eq.name}</h3>
                </div>

                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  {eq.condition}
                </span>
              </div>

              <p className="text-xs text-[#8faab5] leading-relaxed">{eq.notes}</p>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#050f16] border border-[#112330] text-[11px] text-[#7195a6]">
                <div>
                  Ubicación: <strong className="text-white">{eq.storageLocation}</strong>
                </div>
                <div>
                  Custodio: <strong className="text-white">{eq.assignedTo.split(' ')[0]}</strong>
                </div>
                {eq.calibrationDate && (
                  <div>
                    Calibrado: <strong className="text-[#00e5ff]">{eq.calibrationDate}</strong>
                  </div>
                )}
                {eq.batteryHealthPct && (
                  <div className="flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Batería: <strong className="text-[#10b981]">{eq.batteryHealthPct}%</strong></span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#122837]">
                <span className="flex items-center gap-1.5 text-[#10b981] text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Chequeo Pre-Uso Verificado</span>
                </span>
                <span className="text-[10px] text-[#638495] font-mono">
                  Propiedad: {eq.owner}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Personal Equipment & 3 Layers Checklist */}
      {activeTab === 'PERSONAL' && (
        <div className="p-5 rounded-2xl bg-[#081824] border border-[#173042] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Checklist de Indumentaria y Equipo Personal de Terreno
              </h3>
              <p className="text-xs text-[#8faab5]">
                Regla STA: Toda prenda debe ser aspirada e inspeccionada en Punta Arenas para evitar introducción de propágulos invasores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {personalEquip.map((item) => (
              <div
                key={item.itemId}
                className="p-3.5 rounded-xl bg-[#091b29] border border-[#193345] hover:border-[#22445c] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#0c2436] text-[#00e5ff] border border-[#1d3d52] font-mono">
                      {item.layer}
                    </span>
                    <span className="font-bold text-white font-sans">{item.name}</span>
                  </div>
                  <p className="text-[11px] text-[#8faab5]">{item.notes}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={() => togglePacked(item.itemId)}
                    className="flex items-center gap-1.5 text-xs text-[#8faab5] hover:text-white transition-colors"
                  >
                    {item.packed ? (
                      <CheckSquare className="w-4 h-4 text-[#10b981]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#507283]" />
                    )}
                    <span>{item.packed ? 'Empacado' : 'Pendiente'}</span>
                  </button>

                  <button
                    onClick={() => toggleInspected(item.itemId)}
                    className="flex items-center gap-1.5 text-xs text-[#8faab5] hover:text-white transition-colors"
                  >
                    {item.inspected ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#507283]" />
                    )}
                    <span>{item.inspected ? 'Inspeccionado' : 'Sin Bio-inspección'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
