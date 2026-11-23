import { useState, type ReactNode } from 'react';
import { Bot, X, Sparkles, Send, ShieldAlert, ThermometerSnowflake, Anchor } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  expeditionTitle: string;
}

interface Message {
  sender: 'user' | 'pythia';
  text: string;
  time: string;
  tag?: string;
}

const DEFAULT_QA: { prompt: string; answer: string; tag: string }[] = [
  {
    prompt: '¿Cuáles son las distancias mínimas a fauna silvestre según el STA?',
    answer:
      'Bajo las directrices del Protocolo de Madrid y recomendaciones SCAR: pingüinos aislados mínimo 5 metros; colonias reproductivas / pingüineras mínimo 15 metros; focas de Weddell y elefantes marinos mínimo 50 metros; leopardos marinos mínimo 50 metros (mantener guardia en zodiacs); embarcaciones respecto a cetáceos mínimo 100 metros. Regla de oro: NUNCA interponerse entre un animal y el agua o su nido.',
    tag: 'FAUNA & STA',
  },
  {
    prompt: '¿Qué hacer si un sensor de batería de smartphone cae a sub-cero en cubierta?',
    answer:
      'El frío extremo bajo 0°C acelera la resistencia interna de celdas Li-Ion. Procedimiento AMOH: 1) El Android Field Node conmutará automáticamente a perfil ECO (muestreo a 0.1Hz). 2) Guarde el dispositivo en el bolsillo térmico interior de la capa 2 contra el calor corporal. 3) Conecte un power bank precalentado antes de que caiga del 20% para evitar el bloqueo del circuito de gestión de energía (PMIC).',
    tag: 'DISPOSITIVOS & FRÍO',
  },
  {
    prompt: '¿Cuál es la política para sobrevuelos con drones en la XIII Expedición?',
    answer:
      'En la Expedición PAC, NINGÚN dron puede volar sin la autorización expresa del Oficial de Seguridad y el Coordinador Ambiental del buque (FLIGHT AUTHORIZATION: APPROVED). No está permitido volar sobre colonias de aves, dentro de áreas ASPA sin permiso específico, o con rachas de viento superiores a 18 nudos.',
    tag: 'DRONES & BIOSEGURIDAD',
  },
  {
    prompt: '¿Qué regla aplica si las condiciones meteorológicas empeoran durante el muestreo?',
    answer:
      'Aplica la regla UX y operacional rectora de AMOH: "SAFETY OVERRIDES SCIENTIFIC SCHEDULE". Si el viento sostenido supera los 35 nudos, la visibilidad es menor a 2 km, o el Oficial de Cubierta ordena STOP/RETURN, la sesión se aborta de inmediato. Ninguna meta científica justifica arriesgar la integridad humana.',
    tag: 'SEGURIDAD OPERACIONAL',
  },
];

export default function ExpeditionPythiaModal({ isOpen, onClose, expeditionTitle }: Props): ReactNode {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'pythia',
      text: `Hola, soy Pythia PAC — Asistente de Operaciones Científicas Antárticas para la ${expeditionTitle}. Puedes consultarme sobre normativas del Tratado Antártico, protocolos de bioseguridad, calibración de sensores en frío extremo y checklist pre-antártico.`,
      time: 'Ahora',
      tag: 'PAC ASISTENTE',
    },
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const match = DEFAULT_QA.find((item) =>
      item.prompt.toLowerCase().includes(q.toLowerCase().slice(0, 15))
    );

    const pythiaResponse: Message = {
      sender: 'pythia',
      text: match
        ? match.answer
        : `[Consulta Procesada para ${expeditionTitle}]: Con base en las directrices del Protocolo al Tratado Antártico sobre Protección del Medio Ambiente y el plan operativo de la Comisión Colombiana del Océano, proceda verificando la lista de chequeo de la fase activa y confirme con el Oficial de Cubierta cualquier duda operacional en tiempo real.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: match ? match.tag : 'PROTOCOLO PAC',
    };

    setMessages((prev) => [...prev, userMsg, pythiaResponse]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#091824] border border-[#00e5ff]/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#edf5f5] font-mono">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1b3543] bg-[#0c2233] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff]/50 flex items-center justify-center text-[#00e5ff]">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide font-sans">
                  Pythia PAC — Asistente de Operaciones Polares
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 font-bold">
                  MODO DE REFERENCIA
                </span>
              </div>
              <p className="text-[11px] text-[#8faab5]">
                Conocimiento operacional, Tratado Antártico y soporte de sensores de campo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8faab5] hover:text-white hover:bg-[#183140] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Safety Guardrail Warning */}
        <div className="px-5 py-2.5 bg-[#f59e0b]/10 border-b border-[#f59e0b]/30 flex items-start gap-2.5 text-[11px] text-[#f59e0b]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>ADVERTENCIA OPERACIONAL:</strong> Pythia PAC es una herramienta de asistencia y consulta científica.
            <strong> NO</strong> sustituye las órdenes del Oficial de Seguridad del buque, las instrucciones de la CCO ni los procedimientos de emergencia de la Armada.
          </span>
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-5 py-2 bg-[#071520] border-b border-[#152936] flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-[#8faab5] text-[10px] font-bold uppercase shrink-0">Consultas Rápidas:</span>
          {DEFAULT_QA.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="px-2.5 py-1 rounded-lg bg-[#0e2738] hover:bg-[#13344b] border border-[#1f3f52] hover:border-[#00e5ff]/50 text-[#c7dbe6] whitespace-nowrap transition-colors text-[10px]"
            >
              {item.tag}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#8faab5]">
                {msg.sender === 'pythia' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                    <span className="text-[#00e5ff] font-bold">Pythia PAC</span>
                    {msg.tag && (
                      <span className="px-1.5 py-0.2 rounded bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 text-[9px]">
                        {msg.tag}
                      </span>
                    )}
                  </>
                ) : (
                  <span>Investigador</span>
                )}
                <span>· {msg.time}</span>
              </div>
              <div
                className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#00e5ff]/20 border border-[#00e5ff]/40 text-white rounded-tr-none'
                    : 'bg-[#0f2838] border border-[#213f50] text-[#e0ecf2] rounded-tl-none font-sans'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1b3543] bg-[#0c2233]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pregunta a Pythia sobre el protocolo PAC, bioseguridad, equipo..."
              className="flex-1 bg-[#06141e] border border-[#1b3543] focus:border-[#00e5ff] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#5a7b8c] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#00e5ff] text-[#050e14] font-bold hover:bg-[#33ebff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#698897]">
            <span className="flex items-center gap-1">
              <ThermometerSnowflake className="w-3 h-3 text-[#00e5ff]" />
              Contexto activo: Protocolo AMOH v1.1-PAC
            </span>
            <span className="flex items-center gap-1">
              <Anchor className="w-3 h-3 text-[#72e0b5]" />
              Base de conocimiento offline integrada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
