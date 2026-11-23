import * as maplibregl from 'maplibre-gl';
import type { Map as MlMap } from 'maplibre-gl';

type TooltipField = {
  label: string;
  keys: string[];
  format?: 'number' | 'percent' | 'km' | 'km2' | 'date' | 'text';
  suffix?: string;
  decimals?: number;
};

type TooltipConfig = {
  id: string;
  label: string;
  color: string;
  subtitle: string;
  identityKeys: string[];
  fields: TooltipField[];
  note?: string;
};

const CONFIGS: TooltipConfig[] = [
  {
    id: 'grey_zones_defense_heatmap',
    label: 'Fricción & Zonas Grises',
    color: '#f43f5e',
    subtitle: 'Índice de Fricción Oceanopolítica AMOH',
    identityKeys: [
      'name',
      'sector',
      'label',
      'zone',
      'id'
    ],
    fields: [
      {
        label: 'IFO',
        keys: [
          'oceanopolitical_friction_index',
          'polar_friction_index',
          'friction_index',
          'tension_weight'
        ],
        format: 'number',
        decimals: 1,
        suffix: ' / 100'
      },
      {
        label: 'Clasificación',
        keys: [
          'friction_class_label',
          'class',
          'category'
        ]
      },
      {
        label: 'Entorno estratégico',
        keys: ['strategic_interaction'],
        format: 'percent'
      },
      {
        label: 'Presión marítima',
        keys: ['maritime_pressure'],
        format: 'percent'
      },
      {
        label: 'Gobernanza',
        keys: ['governance_sensitivity'],
        format: 'percent'
      },
      {
        label: 'Ecosistema',
        keys: ['ecosystem_sensitivity'],
        format: 'percent'
      },
      {
        label: 'Incertidumbre',
        keys: ['information_uncertainty'],
        format: 'percent'
      },
      {
        label: 'Confianza',
        keys: [
          'model_confidence',
          'confidence',
          'data_confidence'
        ],
        format: 'percent'
      }
    ],
    note:
      'Interacción/sensibilidad espacial. No implica atribución de intención, hostilidad o incumplimiento.'
  },

  {
    id: 'polar_friction_sectors',
    label: 'Sectores Fricción Polar (PFI)',
    color: '#f59e0b',
    subtitle: 'Sector de análisis estratégico polar',
    identityKeys: [
      'name',
      'sector',
      'sector_name',
      'label',
      'id'
    ],
    fields: [
      {
        label: 'PFI',
        keys: [
          'polar_friction_index',
          'friction_index',
          'tension_weight',
          'weight'
        ],
        format: 'number',
        decimals: 1
      },
      {
        label: 'Categoría',
        keys: [
          'category',
          'class',
          'level',
          'status'
        ]
      },
      {
        label: 'Confianza',
        keys: [
          'confidence',
          'data_confidence',
          'quality'
        ],
        format: 'percent'
      },
      {
        label: 'Fecha',
        keys: [
          'date',
          'datetime',
          'timestamp',
          'year'
        ],
        format: 'date'
      }
    ],
    note:
      'Indicador exploratorio de interacción estratégica; no es una determinación jurídica ni una predicción de conflicto.'
  },

  {
    id: 'grey_zones_buffers',
    label: 'Radios & Buffers SIGINT',
    color: '#8b5cf6',
    subtitle: 'Zona analítica / buffer',
    identityKeys: [
      'name',
      'zone',
      'label',
      'id'
    ],
    fields: [
      {
        label: 'Radio',
        keys: [
          'radius_km',
          'buffer_km'
        ],
        format: 'km'
      },
      {
        label: 'Categoría',
        keys: [
          'category',
          'type',
          'class'
        ]
      },
      {
        label: 'Confianza',
        keys: [
          'confidence',
          'data_confidence'
        ],
        format: 'percent'
      },
      {
        label: 'Fecha',
        keys: [
          'date',
          'datetime',
          'timestamp'
        ],
        format: 'date'
      }
    ],
    note:
      'Visualización de zona analítica. No expone parámetros operacionales de interceptación.'
  },

  {
    id: 'fauna_density_heatmap',
    label: 'Fauna Marina (Krill)',
    color: '#22c55e',
    subtitle: 'Observación / concentración biológica',
    identityKeys: [
      'species',
      'scientific_name',
      'common_name',
      'name',
      'station',
      'id'
    ],
    fields: [
      {
        label: 'Biomasa',
        keys: [
          'biomass_density_g_m2',
          'school_biomass_tons',
          'biomass'
        ],
        format: 'number',
        decimals: 2
      },
      {
        label: 'Densidad',
        keys: [
          'density',
          'abundance'
        ],
        format: 'number',
        decimals: 2
      },
      {
        label: 'Conteo',
        keys: [
          'count',
          'individuals'
        ],
        format: 'number',
        decimals: 0
      },
      {
        label: 'Fecha',
        keys: [
          'date',
          'datetime',
          'timestamp',
          'year'
        ],
        format: 'date'
      }
    ]
  },

  {
    id: 'penguin_heatmap',
    label: 'Colonias de Pingüinos',
    color: '#c084fc',
    subtitle: 'Colonia / registro de población',
    identityKeys: [
      'colony',
      'colony_name',
      'name',
      'site',
      'species',
      'id'
    ],
    fields: [
      {
        label: 'Especie',
        keys: [
          'species',
          'scientific_name',
          'common_name'
        ]
      },
      {
        label: 'Población',
        keys: [
          'population_estimate',
          'population',
          'individuals',
          'count'
        ],
        format: 'number',
        decimals: 0
      },
      {
        label: 'Año',
        keys: [
          'year',
          'date'
        ],
        format: 'date'
      },
      {
        label: 'Fuente',
        keys: [
          'source',
          'provider',
          'agency'
        ]
      }
    ]
  },

  {
    id: 'whales_heatmap',
    label: 'Cetáceos / Ballenas',
    color: '#38bdf8',
    subtitle: 'Observación de cetáceos',
    identityKeys: [
      'species',
      'scientific_name',
      'common_name',
      'name',
      'id'
    ],
    fields: [
      {
        label: 'Especie',
        keys: [
          'species',
          'scientific_name',
          'common_name'
        ]
      },
      {
        label: 'Individuos',
        keys: [
          'individuals',
          'pod_size',
          'count'
        ],
        format: 'number',
        decimals: 0
      },
      {
        label: 'Fecha',
        keys: [
          'date',
          'datetime',
          'timestamp',
          'year'
        ],
        format: 'date'
      },
      {
        label: 'Fuente',
        keys: [
          'source',
          'provider',
          'agency'
        ]
      }
    ]
  },

  {
    id: 'gfw_fishing_effort_heatmap',
    label: 'Esfuerzo Pesquero GFW',
    color: '#ff8a4c',
    subtitle: 'Celda / observación agregada de esfuerzo',
    identityKeys: [
      'name',
      'cell_id',
      'grid_id',
      'id'
    ],
    fields: [
      {
        label: 'Horas de pesca',
        keys: [
          'apparent_fishing_hours',
          'fishing_hours',
          'hours',
          'effort'
        ],
        format: 'number',
        decimals: 2,
        suffix: ' h'
      },
      {
        label: 'Periodo',
        keys: [
          'date',
          'datetime',
          'timestamp',
          'year'
        ],
        format: 'date'
      },
      {
        label: 'Bandera / grupo',
        keys: [
          'flag',
          'flag_state',
          'group',
          'category'
        ]
      },
      {
        label: 'Fuente',
        keys: [
          'source',
          'provider'
        ]
      }
    ],
    note:
      'El heatmap representa esfuerzo agregado; no debe interpretarse por sí solo como actividad ilícita.'
  },

  {
    id: 'nuclear_contamination_heatmap',
    label: 'Residuos Nucleares',
    color: '#ff5e8a',
    subtitle: 'Sitio / muestra de radionucleidos',
    identityKeys: [
      'site',
      'station',
      'sample_id',
      'name',
      'id'
    ],
    fields: [
      {
        label: 'Radionucleido',
        keys: [
          'radionuclide',
          'isotope',
          'nuclide'
        ]
      },
      {
        label: 'Actividad',
        keys: [
          'activity_bq_m3',
          'activity',
          'concentration',
          'cesium_137',
          'cs137',
          'tritium'
        ],
        format: 'number',
        decimals: 3
      },
      {
        label: 'Fecha',
        keys: [
          'date',
          'datetime',
          'timestamp',
          'year'
        ],
        format: 'date'
      },
      {
        label: 'Fuente',
        keys: [
          'source',
          'provider',
          'agency'
        ]
      }
    ]
  },

  {
    id: 'seismic_heatmap',
    label: 'Concentración Sísmica',
    color: '#ff827d',
    subtitle: 'Evento sísmico',
    identityKeys: [
      'event_id',
      'place',
      'name',
      'id'
    ],
    fields: [
      {
        label: 'Magnitud',
        keys: [
          'magnitude',
          'mag'
        ],
        format: 'number',
        decimals: 1
      },
      {
        label: 'Profundidad',
        keys: [
          'depth_km',
          'depth'
        ],
        format: 'km'
      },
      {
        label: 'Fecha / hora',
        keys: [
          'datetime',
          'timestamp',
          'date',
          'time'
        ],
        format: 'date'
      },
      {
        label: 'Fuente',
        keys: [
          'source',
          'provider',
          'agency'
        ]
      }
    ]
  }
];

const installedMaps = new WeakMap<MlMap, () => void>();

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function firstValue(
  props: Record<string, any>,
  keys: string[]
) {
  for (const key of keys) {
    const value = props?.[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ''
    ) {
      return value;
    }
  }

  return null;
}

function formatDate(value: any) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  if (
    typeof value === 'number' &&
    value >= 1900 &&
    value <= 2100
  ) {
    return String(Math.round(value));
  }

  const text = String(value);

  if (/^\d{4}$/.test(text)) {
    return text;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleString(
    'es-CO',
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour:
        text.includes('T') ||
        text.includes(':')
          ? '2-digit'
          : undefined,
      minute:
        text.includes('T') ||
        text.includes(':')
          ? '2-digit'
          : undefined,
      hour12: false
    }
  );
}

function formatValue(
  value: any,
  field: TooltipField
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  if (field.format === 'date') {
    return formatDate(value);
  }

  if (field.format === 'percent') {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return String(value);
    }

    const pct =
      Math.abs(n) <= 1.000001
        ? n * 100
        : n;

    return `${pct.toFixed(
      field.decimals ?? 0
    )}%`;
  }

  if (
    field.format === 'number' ||
    field.format === 'km' ||
    field.format === 'km2'
  ) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return String(value);
    }

    const decimals =
      field.decimals ??
      (
        Math.abs(n) < 10
          ? 2
          : 1
      );

    const suffix =
      field.suffix ??
      (
        field.format === 'km'
          ? ' km'
          : field.format === 'km2'
            ? ' km²'
            : ''
      );

    return (
      n.toLocaleString(
        'es-CO',
        {
          maximumFractionDigits: decimals
        }
      ) +
      suffix
    );
  }

  return String(value);
}

function meaningfulFallbacks(
  props: Record<string, any>,
  used: Set<string>
) {
  const blacklist = [
    '_amoh_',
    'geometry',
    'coordinates',
    'lat',
    'latitude',
    'lon',
    'lng',
    'longitude'
  ];

  return Object.entries(props || {})
    .filter(([key, value]) => {
      if (used.has(key)) return false;

      const lower = key.toLowerCase();

      if (
        blacklist.some(
          (item) =>
            lower === item ||
            lower.startsWith(item)
        )
      ) {
        return false;
      }

      return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      );
    })
    .slice(0, 3);
}

function titleFor(
  config: TooltipConfig,
  props: Record<string, any>
) {
  const identity =
    firstValue(
      props,
      config.identityKeys
    );

  if (
    identity !== null &&
    identity !== undefined &&
    String(identity).trim()
  ) {
    return String(identity);
  }

  return config.subtitle;
}


function evidenceBadge(status: string) {
  const normalized =
    String(status || 'SIN_FUENTE').toUpperCase();

  const palette: Record<string, { bg: string; border: string; text: string }> = {
    VERIFICADO: {
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(52,211,153,0.40)',
      text: '#a7f3d0'
    },
    PARCIAL: {
      bg: 'rgba(245,158,11,0.12)',
      border: 'rgba(251,191,36,0.38)',
      text: '#fde68a'
    },
    NO_VERIFICADO: {
      bg: 'rgba(244,63,94,0.12)',
      border: 'rgba(251,113,133,0.40)',
      text: '#fecdd3'
    },
    SIN_FUENTE: {
      bg: 'rgba(100,116,139,0.14)',
      border: 'rgba(148,163,184,0.32)',
      text: '#cbd5e1'
    }
  };

  const style = palette[normalized] ?? palette.SIN_FUENTE;

  return `
    <span style="display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;border:1px solid ${style.border};background:${style.bg};color:${style.text};font-size:8px;font-weight:800;letter-spacing:.05em;">
      ${escapeHtml(normalized.replaceAll('_', ' '))}
    </span>
  `;
}

function frictionRow(label: string, value: any) {
  if (value === null || value === undefined || value === '') return '';

  return `
    <div class="amoh-heat-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function frictionSection(title: string, body: string) {
  if (!body.trim()) return '';

  return `
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);">
      <div style="margin-bottom:6px;color:#67e8f9;font-size:8px;font-weight:800;letter-spacing:.08em;">
        ${escapeHtml(title)}
      </div>
      <div class="amoh-heat-grid" style="margin-top:0;padding-top:0;border-top:0;">
        ${body}
      </div>
    </div>
  `;
}

function pctFriction(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const pct = Math.abs(n) <= 1.000001 ? n * 100 : n;
  return `${pct.toFixed(0)}%`;
}

function buildFrictionEvidenceCard(
  config: TooltipConfig,
  props: Record<string, any>,
  coord: [number, number]
) {
  const status = String(props?.evidence_status ?? 'SIN_FUENTE');

  const observed = [
    frictionRow('Tipo', props?.type ?? props?.category),
    frictionRow('Instalación / sitio', props?.facility ?? props?.site),
    frictionRow('Ámbito', props?.country ?? props?.region),
    frictionRow('Estado registrado', props?.status)
  ].join('');

  const analysis = [
    frictionRow(
      'IFO',
      props?.oceanopolitical_friction_index != null
        ? `${Number(props.oceanopolitical_friction_index).toLocaleString('es-CO',{maximumFractionDigits:1})} / 100`
        : null
    ),
    frictionRow('Clasificación', props?.friction_class_label),
    frictionRow('Entorno estratégico', pctFriction(props?.strategic_interaction)),
    frictionRow('Presión marítima', pctFriction(props?.maritime_pressure)),
    frictionRow('Gobernanza', pctFriction(props?.governance_sensitivity)),
    frictionRow('Ecosistema', pctFriction(props?.ecosystem_sensitivity)),
    frictionRow('Concurrencia', pctFriction(props?.use_diversity)),
    frictionRow('Incertidumbre', pctFriction(props?.information_uncertainty))
  ].join('');

  const evidenceConfidence = pctFriction(props?.evidence_confidence);

  const provenance = [
    frictionRow('Fuente', props?.evidence_source ?? 'No declarada en el registro'),
    frictionRow('Fecha evidencia', props?.evidence_date ? formatDate(props.evidence_date) : 'No declarada'),
    frictionRow('Confianza evidencia', evidenceConfidence ?? 'No declarada'),
    frictionRow('Tipo de procedencia', props?.evidence_source_type ?? 'NO_DECLARADA')
  ].join('');

  const reason = props?.evidence_reason
    ? `<div style="margin-top:7px;color:#8fa6b0;font-size:8px;line-height:1.45;">${escapeHtml(props.evidence_reason)}</div>`
    : '';

  const reference = props?.evidence_source_url
    ? `<div style="margin-top:5px;color:#67cbd1;font-size:8px;word-break:break-word;">REFERENCIA · ${escapeHtml(props.evidence_source_url)}</div>`
    : '';

  const withheld = `
    <div style="margin-top:9px;padding:7px 8px;border:1px solid rgba(148,163,184,.14);border-radius:8px;background:rgba(15,23,42,.24);color:#94a3b8;font-size:8px;line-height:1.45;">
      Las afirmaciones sensibles o interpretativas del registro base no se presentan como hechos en esta ficha. Se requiere procedencia, confianza y corroboración separada para su uso analítico.
    </div>
  `;

  return `
    <div class="amoh-heat-card">
      <div class="amoh-heat-eyebrow">
        <i style="background:${escapeHtml(config.color)}"></i>
        FRICCIÓN &amp; ZONAS GRISES · V5.2
      </div>

      <div class="amoh-heat-title">
        ${escapeHtml(titleFor(config, props))}
      </div>

      <div class="amoh-heat-subtitle">
        Evidencia separada de análisis derivado
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px;">
        <span style="color:#78909c;font-size:8px;letter-spacing:.06em;">ESTADO DE EVIDENCIA</span>
        ${evidenceBadge(status)}
      </div>

      ${frictionSection('REGISTRO BASE / OBSERVADO EN DATASET', observed)}
      ${frictionSection('ANÁLISIS AMOH · DERIVADO', analysis)}
      ${frictionSection('PROVENIENCIA Y VERIFICACIÓN', provenance)}

      ${reason}
      ${reference}
      ${withheld}

      <div class="amoh-heat-coord">
        ${Math.abs(coord[1]).toFixed(3)}° ${coord[1] < 0 ? 'S' : 'N'} ·
        ${Math.abs(coord[0]).toFixed(3)}° ${coord[0] < 0 ? 'W' : 'E'}
      </div>

      <div class="amoh-heat-note">
        IFO alto = mayor interacción/sensibilidad y necesidad de verificación. No constituye atribución de intención, hostilidad, infracción jurídica ni predicción de conflicto.
      </div>
    </div>
  `;
}
function buildCard(
  config: TooltipConfig,
  props: Record<string, any>,
  coord: [number, number]
) {
  
  // AMOH_FRICTION_TOOLTIP_V52
  if (config.id === 'grey_zones_defense_heatmap') {
    return buildFrictionEvidenceCard(config, props, coord);
  }
const used =
    new Set<string>();

  const rows: string[] = [];

  for (const field of config.fields) {
    let foundKey: string | null = null;
    let raw: any = null;

    for (const key of field.keys) {
      const candidate =
        props?.[key];

      if (
        candidate !== null &&
        candidate !== undefined &&
        candidate !== ''
      ) {
        foundKey = key;
        raw = candidate;
        break;
      }
    }

    if (!foundKey) continue;

    used.add(foundKey);

    const formatted =
      formatValue(
        raw,
        field
      );

    if (!formatted) continue;

    rows.push(`
      <div class="amoh-heat-row">
        <span>${escapeHtml(field.label)}</span>
        <strong>${escapeHtml(formatted)}</strong>
      </div>
    `);
  }

  if (rows.length < 3) {
    for (
      const [key, value]
      of meaningfulFallbacks(
        props,
        used
      )
    ) {
      rows.push(`
        <div class="amoh-heat-row">
          <span>${escapeHtml(
            key
              .replaceAll('_', ' ')
              .replace(/\b\w/g, (c) =>
                c.toUpperCase()
              )
          )}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `);
    }
  }

  const parentGeometry =
    props?._amoh_parent_geometry;

  const supportNote =
    parentGeometry &&
    parentGeometry !== 'Point'
      ? `
        <div class="amoh-heat-support">
          Punto de soporte visual derivado de una geometría
          ${escapeHtml(parentGeometry)}.
        </div>
      `
      : '';

  const source =
    firstValue(
      props,
      [
        'source',
        'provider',
        'agency',
        'provenance',
        'dataset'
      ]
    );

  const sourceHtml =
    source
      ? `
        <div class="amoh-heat-source">
          FUENTE · ${escapeHtml(source)}
        </div>
      `
      : '';

  const noteHtml =
    config.note
      ? `
        <div class="amoh-heat-note">
          ${escapeHtml(config.note)}
        </div>
      `
      : '';

  return `
    <div class="amoh-heat-card">
      <div class="amoh-heat-eyebrow">
        <i style="background:${escapeHtml(config.color)}"></i>
        ${escapeHtml(config.label)}
      </div>

      <div class="amoh-heat-title">
        ${escapeHtml(
          titleFor(
            config,
            props
          )
        )}
      </div>

      <div class="amoh-heat-subtitle">
        ${escapeHtml(config.subtitle)}
      </div>

      ${
        rows.length
          ? `
            <div class="amoh-heat-grid">
              ${rows.join('')}
            </div>
          `
          : ''
      }

      <div class="amoh-heat-coord">
        ${Math.abs(coord[1]).toFixed(3)}° ${coord[1] < 0 ? 'S' : 'N'}
        ·
        ${Math.abs(coord[0]).toFixed(3)}° ${coord[0] < 0 ? 'W' : 'E'}
      </div>

      ${sourceHtml}
      ${supportNote}
      ${noteHtml}
    </div>
  `;
}

function ensureStyles() {
  if (
    document.getElementById(
      'amoh-heatmap-tooltip-style'
    )
  ) {
    return;
  }

  const style =
    document.createElement('style');

  style.id =
    'amoh-heatmap-tooltip-style';

  style.textContent = `
    .amoh-heatmap-tooltip {
      z-index: 1200;
      pointer-events: none;
    }

    .amoh-heatmap-tooltip .maplibregl-popup-content {
      min-width: 250px;
      max-width: 330px;
      padding: 0;
      overflow: hidden;
      color: #dff7f4;
      background: rgba(5, 18, 28, 0.97);
      border: 1px solid rgba(72, 207, 216, 0.28);
      border-radius: 13px;
      box-shadow:
        0 18px 50px rgba(0, 0, 0, 0.42),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(14px);
      font-family:
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        "Liberation Mono",
        monospace;
    }

    .amoh-heatmap-tooltip .maplibregl-popup-tip {
      border-top-color: rgba(5, 18, 28, 0.97) !important;
      border-bottom-color: rgba(5, 18, 28, 0.97) !important;
      border-left-color: rgba(5, 18, 28, 0.97) !important;
      border-right-color: rgba(5, 18, 28, 0.97) !important;
    }

    .amoh-heat-card {
      padding: 12px 13px 11px;
    }

    .amoh-heat-eyebrow {
      display: flex;
      align-items: center;
      gap: 7px;
      color: #8ea9b3;
      font-size: 9px;
      line-height: 1.2;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .amoh-heat-eyebrow i {
      width: 7px;
      height: 7px;
      flex: 0 0 auto;
      border-radius: 999px;
      box-shadow: 0 0 12px currentColor;
    }

    .amoh-heat-title {
      margin-top: 7px;
      color: #f6fbfc;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.3;
    }

    .amoh-heat-subtitle {
      margin-top: 2px;
      color: #70cfd4;
      font-size: 9px;
      line-height: 1.35;
    }

    .amoh-heat-grid {
      display: grid;
      gap: 4px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .amoh-heat-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: baseline;
      font-size: 9px;
    }

    .amoh-heat-row span {
      color: #8096a0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .amoh-heat-row strong {
      color: #e7f9f7;
      font-weight: 700;
      text-align: right;
    }

    .amoh-heat-coord,
    .amoh-heat-source,
    .amoh-heat-support,
    .amoh-heat-note {
      margin-top: 8px;
      color: #6f8791;
      font-size: 8px;
      line-height: 1.45;
    }

    .amoh-heat-source {
      color: #64cbd1;
    }

    .amoh-heat-support {
      padding-top: 7px;
      border-top: 1px dashed rgba(255, 255, 255, 0.08);
    }

    .amoh-heat-note {
      color: #b8a9af;
    }
  `;

  document.head.appendChild(
    style
  );
}

function sourceId(id: string) {
  return `amoh-runtime-points-${id}`;
}

function heatId(id: string) {
  return `amoh-runtime-heat-${id}`;
}

function hitId(id: string) {
  return `amoh-hover-hit-${id}`;
}

function firstSymbol(map: MlMap) {
  return (map.getStyle?.()?.layers ?? [])
    .find(
      (layer: any) =>
        layer.type === 'symbol'
    )
    ?.id;
}

function layerVisible(
  map: MlMap,
  id: string
) {
  if (!map.getLayer(id)) return false;

  try {
    return (
      map.getLayoutProperty(
        id,
        'visibility'
      ) !== 'none'
    );
  } catch {
    return true;
  }
}

function ensureHitLayers(
  map: MlMap
) {
  
  // AMOH_STYLE_GUARD_V521
  const style = map.getStyle?.();
  if (!style || !Array.isArray(style.layers)) {
    return;
  }
const before =
    firstSymbol(map);

  for (const config of CONFIGS) {
    const source =
      sourceId(config.id);

    const heat =
      heatId(config.id);

    const hit =
      hitId(config.id);

    if (
      !map.getSource(source) ||
      !map.getLayer(heat)
    ) {
      continue;
    }

    if (!map.getLayer(hit)) {
      try {
        map.addLayer(
          {
            id: hit,
            type: 'circle',
            source,
            layout: {
              visibility: 'none'
            },
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 8,
                4, 13,
                8, 18
              ],
              'circle-color':
                config.color,

              // Practically invisible but still queryable.
              'circle-opacity': 0.001,

              'circle-stroke-width': 0,
              'circle-stroke-opacity': 0
            }
          } as any,
          before
        );
      } catch {
        continue;
      }
    }

    const visible =
      layerVisible(
        map,
        heat
      );

    try {
      map.setLayoutProperty(
        hit,
        'visibility',
        visible
          ? 'visible'
          : 'none'
      );
    } catch {
      // non-fatal
    }

    if (visible) {
      try {
        map.moveLayer(
          hit,
          before
        );
      } catch {
        // non-fatal
      }
    }
  }

  const w = window as any;

  w.__amohHeatHoverDebug = {
    installed: true,
    hitLayers:
      CONFIGS
        .filter((config) =>
          map.getLayer(
            hitId(config.id)
          )
        )
        .map((config) => ({
          id: config.id,
          hitLayer:
            hitId(config.id),
          visible:
            layerVisible(
              map,
              hitId(config.id)
            )
        }))
  };
}

export function installHeatmapHoverTooltips(
  map: MlMap
) {
  const existing =
    installedMaps.get(map);

  if (existing) {
    return existing;
  }

  ensureStyles();

  const popup =
    new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'bottom',
      offset: 16,
      className:
        'amoh-heatmap-tooltip',
      maxWidth: '340px'
    });

  let lastKey = '';

  const sync = () => {
    ensureHitLayers(map);
  };

  const mousemove = (
    event: maplibregl.MapMouseEvent
  ) => {
    const visibleHits =
      CONFIGS
        .map((config) => ({
          config,
          layerId:
            hitId(config.id)
        }))
        .filter(
          (item) =>
            map.getLayer(
              item.layerId
            ) &&
            layerVisible(
              map,
              item.layerId
            )
        );

    if (!visibleHits.length) {
      popup.remove();
      lastKey = '';
      return;
    }

    const features =
      map.queryRenderedFeatures(
        event.point,
        {
          layers:
            visibleHits.map(
              (item) =>
                item.layerId
            )
        }
      );

    const feature =
      features?.[0];

    if (!feature) {
      popup.remove();
      lastKey = '';

      map.getCanvas().style.cursor =
        '';
      return;
    }

    const layerId =
      feature.layer?.id || '';

    const config =
      CONFIGS.find(
        (item) =>
          hitId(item.id) === layerId
      );

    if (!config) {
      popup.remove();
      lastKey = '';
      return;
    }

    const geometry =
      feature.geometry as any;

    const coord =
      geometry?.type === 'Point' &&
      validPoint(
        geometry.coordinates
      )
        ? [
            Number(
              geometry.coordinates[0]
            ),
            Number(
              geometry.coordinates[1]
            )
          ] as [number, number]
        : [
            event.lngLat.lng,
            event.lngLat.lat
          ] as [number, number];

    const props =
      (feature.properties || {}) as
        Record<string, any>;

    const key =
      `${config.id}:` +
      `${props.id ?? props.name ?? props._amoh_weight ?? ''}:` +
      `${coord[0].toFixed(5)}:${coord[1].toFixed(5)}`;

    if (lastKey !== key) {
      popup
        .setLngLat(coord)
        .setHTML(
          buildCard(
            config,
            props,
            coord
          )
        )
        .addTo(map);

      lastKey = key;
    }

    map.getCanvas().style.cursor =
      'crosshair';

    const w = window as any;

    w.__amohHeatHoverLast = {
      layer: config.id,
      label: config.label,
      properties: props,
      coordinate: coord
    };
  };

  const mouseout = () => {
    popup.remove();
    lastKey = '';

    try {
      map.getCanvas().style.cursor =
        '';
    } catch {
      // non-fatal
    }
  };

  const styledata = () => {
    sync();
  };

  const idle = () => {
    sync();
  };

  map.on(
    'mousemove',
    mousemove
  );

  map.on(
    'mouseout',
    mouseout
  );

  map.on(
    'styledata',
    styledata
  );

  map.on(
    'idle',
    idle
  );

  sync();

  const cleanup = () => {
    popup.remove();

    map.off(
      'mousemove',
      mousemove
    );

    map.off(
      'mouseout',
      mouseout
    );

    map.off(
      'styledata',
      styledata
    );

    map.off(
      'idle',
      idle
    );

    installedMaps.delete(map);
  };

  map.once(
    'remove',
    cleanup
  );

  installedMaps.set(
    map,
    cleanup
  );

  return cleanup;
}

function validPoint(
  value: any
) {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(
      Number(value[0])
    ) &&
    Number.isFinite(
      Number(value[1])
    )
  );
}


