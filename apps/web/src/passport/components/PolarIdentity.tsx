import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PolarNode {
  id: string;
  name: string;
  code: string;
  cx: number;
  cy: number;
  lat: string;
  lng: string;
  officer: string;
  observationsCount: number;
  latestEvidence: string;
}

const NODES: PolarNode[] = [
  {
    id: 'st-frei',
    name: 'Base Pdte. Eduardo Frei Montalva',
    code: 'BPEF-KG-26',
    cx: 195,
    cy: 165,
    lat: '62.19° S',
    lng: '58.98° W',
    officer: 'Dr. C. Valenzuela',
    observationsCount: 28,
    latestEvidence: 'Calibración boya acústica Bahía Fildes',
  },
  {
    id: 'st-prat',
    name: 'Base Naval Capitán Arturo Prat',
    code: 'BNAP-GI-26',
    cx: 185,
    cy: 180,
    lat: '62.48° S',
    lng: '59.66° W',
    officer: 'Tte. 1° G. Morales',
    observationsCount: 19,
    latestEvidence: 'Boya oceanográfica SO-AMOH-04',
  },
  {
    id: 'st-ohiggins',
    name: "Base General Bernardo O'Higgins",
    code: 'BGBO-CL-25',
    cx: 215,
    cy: 190,
    lat: '63.32° S',
    lng: '57.90° W',
    officer: 'Cap. M. Silva',
    observationsCount: 42,
    latestEvidence: 'Lance CTD Caleta Covadonga (-0.8°C)',
  },
  {
    id: 'st-palmer',
    name: 'Palmer Research Station',
    code: 'PLMR-AN-26',
    cx: 180,
    cy: 225,
    lat: '64.77° S',
    lng: '64.05° W',
    officer: 'Dr. Sarah Jenkins',
    observationsCount: 31,
    latestEvidence: 'Sincronización LTER macrozooplancton',
  },
  {
    id: 'st-vernadsky',
    name: 'Akademik Vernadsky Station',
    code: 'VERN-GL-26',
    cx: 175,
    cy: 245,
    lat: '65.25° S',
    lng: '64.26° W',
    officer: 'Dr. Y. Polishchuk',
    observationsCount: 14,
    latestEvidence: 'Columna de ozono & magnetometría',
  },
  {
    id: 'st-rothera',
    name: 'Rothera Research Station',
    code: 'ROTH-AD-26',
    cx: 160,
    cy: 295,
    lat: '67.57° S',
    lng: '68.12° W',
    officer: 'Lt. Edward Cole',
    observationsCount: 8,
    latestEvidence: 'Telemetría planeador Webb Slocum',
  },
];

interface PolarIdentityProps {
  className?: string;
  onSelectNode?: (nodeId: string) => void;
}

export const PolarIdentity: React.FC<PolarIdentityProps> = ({
  className = '',
  onSelectNode,
}) => {
  const [activeNode, setActiveNode] = useState<PolarNode | null>(NODES[0]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* SVG Polar Map & Nodes */}
      <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring & Compass Cardinal Marks */}
          <circle cx="250" cy="250" r="235" fill="none" stroke="#214b63" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
          <circle cx="250" cy="250" r="215" fill="none" stroke="#315f78" strokeWidth="1.2" opacity="0.6" />
          <circle cx="250" cy="250" r="170" fill="none" stroke="#214b63" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="250" cy="250" r="120" fill="none" stroke="#35c3c8" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.3" />
          <circle cx="250" cy="250" r="60" fill="none" stroke="#214b63" strokeWidth="0.6" opacity="0.3" />

          {/* Coordinate Crosshairs */}
          <line x1="250" y1="20" x2="250" y2="480" stroke="#214b63" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.4" />
          <line x1="20" y1="250" x2="480" y2="250" stroke="#214b63" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.4" />

          {/* Fine measurement tick marks along outer rim */}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i * 360) / 48;
            const isMajor = i % 4 === 0;
            return (
              <line
                key={i}
                x1="250"
                y1={isMajor ? 30 : 33}
                x2="250"
                y2="38"
                stroke={isMajor ? '#35c3c8' : '#214b63'}
                strokeWidth={isMajor ? 1.2 : 0.6}
                opacity={isMajor ? 0.8 : 0.4}
                transform={`rotate(${angle} 250 250)`}
              />
            );
          })}

          {/* Antarctica Continental Outline Silhouette (Stylized Polar Stereographic Vector) */}
          <path
            d="M 230 180 
               C 210 150, 190 120, 175 140
               C 165 155, 175 180, 160 210
               C 145 240, 125 270, 140 310
               C 150 335, 180 340, 205 355
               C 240 380, 290 395, 335 375
               C 380 355, 410 320, 400 270
               C 395 240, 360 220, 345 195
               C 330 170, 305 185, 275 180
               Z"
            fill="#0b2638"
            fillOpacity="0.45"
            stroke="#35c3c8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Ice Shelf Contours (Ronne-Filchner & Ross outlines) */}
          <path
            d="M 205 355 C 230 340, 250 345, 275 365"
            fill="none"
            stroke="#72e0b5"
            strokeWidth="0.8"
            strokeDasharray="2 3"
            opacity="0.6"
          />

          {/* Expedition Track Line connecting nodes */}
          <path
            d="M 195 165 L 185 180 L 215 190 L 180 225 L 175 245 L 160 295"
            fill="none"
            stroke="#35c3c8"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            opacity="0.75"
          />

          {/* Interactive Field Nodes */}
          {NODES.map((node) => {
            const isSelected = activeNode?.id === node.id;
            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onClick={() => {
                  setActiveNode(node);
                  if (onSelectNode) onSelectNode(node.id);
                }}
              >
                {/* Node Outer Pulse when selected */}
                {isSelected && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="12"
                    fill="none"
                    stroke="#35c3c8"
                    strokeWidth="1"
                    className="animate-ping"
                    opacity="0.5"
                  />
                )}
                {/* Node Ring */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#35c3c8' : '#0b2638'}
                  stroke={isSelected ? '#ffffff' : '#72e0b5'}
                  strokeWidth={isSelected ? 2 : 1.2}
                  className="transition-all duration-200 group-hover:scale-125"
                />
              </g>
            );
          })}

          {/* South Pole Center Axis Mark */}
          <circle cx="250" cy="280" r="3" fill="#ffffff" opacity="0.8" />
          <text
            x="250"
            y="298"
            textAnchor="middle"
            fill="#8faab5"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="0.1em"
          >
            90° S POLO SUR
          </text>
        </svg>
      </div>

      {/* Node Context Card */}
      {activeNode && (
        <div className="w-full mt-3 p-3.5 rounded-2xl bg-[#091824]/90 border border-[#1d3c4e] backdrop-blur-sm text-left shadow-lg transition-all animate-fadeIn">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35c3c8] animate-pulse" />
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                {activeNode.name}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35c3c8]/15 text-[#35c3c8] border border-[#35c3c8]/30 font-semibold">
              {activeNode.code}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-[#6c8a99] block text-[9px] uppercase tracking-wider">Coordenadas</span>
              <span className="text-[#e2f1f8]">{activeNode.lat} · {activeNode.lng}</span>
            </div>
            <div>
              <span className="text-[#6c8a99] block text-[9px] uppercase tracking-wider">Evidencia Verificada</span>
              <span className="text-[#72e0b5] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                {activeNode.observationsCount} registros
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#162e3d] text-[10px] font-mono text-[#8faab5] truncate">
            <span className="text-[#35c3c8]">Última bitácora:</span> {activeNode.latestEvidence}
          </div>
        </div>
      )}
    </div>
  );
};

export default PolarIdentity;
