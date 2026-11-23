import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ExternalLink, TrendingUp } from 'lucide-react';

interface AnnualPoint {
  year: number;
  value: number;
}

interface TrendResult {
  method: string;
  slope_per_decade: number;
  confidence_interval_95_per_decade: [number, number];
  p_value_two_sided: number;
  significant_at_0_05: boolean;
  n_observations: number;
  first_year: number;
  last_year: number;
  newey_west_lags: number;
  value_at_midpoint: number;
  midpoint_year: number;
}

interface TrendProduct {
  schema_version: number;
  dataset: {
    id: string;
    title: string;
    source_url: string;
    source_sha256: string;
    classification: string;
    source_measurements: string;
    variable: string;
    units: string;
    spatial_scope: string;
    temporal_resolution: string;
    annual_aggregation: string;
    source_version: string;
  };
  trend: TrendResult;
  series: AnnualPoint[];
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; product: TrendProduct };

function isTrendProduct(value: unknown): value is TrendProduct {
  if (typeof value !== 'object' || value === null) return false;
  const product = value as Partial<TrendProduct>;
  const dataset = product.dataset;
  const trend = product.trend;
  if (!dataset || !trend || !Array.isArray(product.series)) return false;
  const interval = trend.confidence_interval_95_per_decade;
  if (!Array.isArray(interval) || interval.length !== 2 || !interval.every(Number.isFinite)) return false;
  return (
    product.schema_version === 1 &&
    typeof dataset.id === 'string' &&
    typeof dataset.title === 'string' &&
    typeof dataset.source_url === 'string' &&
    typeof dataset.source_sha256 === 'string' &&
    typeof trend.method === 'string' &&
    Number.isFinite(trend.slope_per_decade) &&
    Number.isFinite(trend.p_value_two_sided) &&
    Number.isInteger(trend.n_observations) &&
    Number.isInteger(trend.first_year) &&
    Number.isInteger(trend.last_year) &&
    Number.isInteger(trend.newey_west_lags) &&
    Number.isFinite(trend.value_at_midpoint) &&
    Number.isFinite(trend.midpoint_year) &&
    product.series.length >= 5 &&
    product.series.every(
      (point) =>
        typeof point === 'object' &&
        point !== null &&
        Number.isInteger(point.year) &&
        Number.isFinite(point.value),
    )
  );
}

function formatPValue(value: number): string {
  return value < 0.001 ? '< 0.001' : value.toFixed(3);
}

export default function EarthTrendPanel() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const path = `${import.meta.env.BASE_URL}data/gistemp-southern-hemisphere-trend.json`;

    fetch(path, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} al cargar el producto GISTEMP`);
        }
        const payload: unknown = await response.json();
        if (!isTrendProduct(payload)) {
          throw new Error('El producto GISTEMP tiene un formato no válido');
        }
        setState({ status: 'ready', product: payload });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Error desconocido';
        setState({ status: 'error', message });
      });

    return () => controller.abort();
  }, []);

  const chart = useMemo(() => {
    if (state.status !== 'ready') return null;
    const { series, trend } = state.product;
    const width = 920;
    const height = 300;
    const margin = { top: 16, right: 18, bottom: 34, left: 54 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const values = series.map((point) => point.value);
    const fitted = series.map(
      (point) => trend.value_at_midpoint + trend.slope_per_decade * ((point.year - trend.midpoint_year) / 10),
    );
    const min = Math.min(0, ...values, ...fitted);
    const max = Math.max(0, ...values, ...fitted);
    const padding = Math.max((max - min) * 0.08, 0.05);
    const low = min - padding;
    const high = max + padding;
    const x = (index: number) => margin.left + (index / (series.length - 1)) * plotWidth;
    const y = (value: number) => margin.top + ((high - value) / (high - low)) * plotHeight;
    const linePath = series
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(2)} ${y(point.value).toFixed(2)}`)
      .join(' ');
    const trendPath = `M ${x(0).toFixed(2)} ${y(fitted[0]).toFixed(2)} L ${x(series.length - 1).toFixed(2)} ${y(fitted[fitted.length - 1]).toFixed(2)}`;
    const tickValues = [low, (low + high) / 2, high];

    return { width, height, margin, plotWidth, plotHeight, linePath, trendPath, tickValues, x, y, series };
  }, [state]);

  if (state.status === 'loading') {
    return <div className="rounded-2xl border border-[#1b394b] bg-[#081824] p-8 text-sm text-[#8faab5]">Cargando producto NASA GISTEMP…</div>;
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#8a3f4f] bg-[#2b1520] p-5 text-sm text-[#ffd8df]">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div><strong>No se pudo cargar el análisis de tendencias.</strong><p className="mt-1">{state.message}</p></div>
      </div>
    );
  }

  const { dataset, trend } = state.product;
  const [ciLow, ciHigh] = trend.confidence_interval_95_per_decade;

  return (
    <section className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[#58d5e3]">
          <TrendingUp className="h-5 w-5" />
          <span className="font-mono text-[10px] font-bold tracking-[0.18em]">OLEA EARTH INTELLIGENCE · DATASET REAL</span>
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{dataset.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#9bb0b9]">
          Serie hemisférica basada en observaciones de temperatura terrestre y oceánica de NASA GISTEMP v4.
          Es una anomalía respecto a 1951–1980, no una temperatura absoluta ni una medición local de la Antártida.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pendiente lineal" value={`${trend.slope_per_decade >= 0 ? '+' : ''}${trend.slope_per_decade.toFixed(3)} °C/década`} />
        <Metric label="IC robusto del 95%" value={`${ciLow.toFixed(3)} a ${ciHigh.toFixed(3)} °C/década`} />
        <Metric label="p bilateral (HAC)" value={formatPValue(trend.p_value_two_sided)} />
        <Metric label="Años completos" value={`${trend.n_observations} · ${trend.first_year}–${trend.last_year}`} />
      </div>

      <div className="rounded-2xl border border-[#1b394b] bg-[#081824] p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Anomalía anual y tendencia OLS</h2>
            <p className="mt-1 text-xs text-[#8faab5]">Promedio de los 12 valores mensuales disponibles por año completo · °C</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[#b5c8ce]">
            <span className="flex items-center gap-2"><i className="h-0.5 w-4 bg-[#58d5e3]" />GISTEMP anual</span>
            <span className="flex items-center gap-2"><i className="h-0.5 w-4 bg-[#ffc845]" />OLS + HAC</span>
          </div>
        </div>
        {chart && (
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="img"
            aria-label={`Serie de anomalías NASA GISTEMP del hemisferio sur desde ${trend.first_year} hasta ${trend.last_year}, con tendencia lineal`}
            className="h-auto w-full overflow-visible"
          >
            {chart.tickValues.map((tick) => (
              <g key={tick}>
                <line x1={chart.margin.left} x2={chart.width - chart.margin.right} y1={chart.y(tick)} y2={chart.y(tick)} stroke={Math.abs(tick) < 1e-8 ? '#617780' : '#183241'} strokeDasharray={Math.abs(tick) < 1e-8 ? undefined : '3 5'} />
                <text x={chart.margin.left - 9} y={chart.y(tick) + 4} textAnchor="end" fill="#8faab5" fontSize="11">{tick.toFixed(1)}</text>
              </g>
            ))}
            <path d={chart.linePath} fill="none" stroke="#58d5e3" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />
            <path d={chart.trendPath} fill="none" stroke="#ffc845" strokeWidth="2.2" strokeDasharray="7 5" vectorEffect="non-scaling-stroke" />
            <text x={chart.margin.left} y={chart.height - 7} fill="#8faab5" fontSize="11">{trend.first_year}</text>
            <text x={chart.width - chart.margin.right} y={chart.height - 7} textAnchor="end" fill="#8faab5" fontSize="11">{trend.last_year}</text>
            <text x="13" y={chart.margin.top + chart.plotHeight / 2} transform={`rotate(-90 13 ${chart.margin.top + chart.plotHeight / 2})`} textAnchor="middle" fill="#8faab5" fontSize="11">Anomalía (°C)</text>
          </svg>
        )}
        <p className="mt-3 text-xs text-[#9bb0b9]">
          {trend.significant_at_0_05
            ? 'La pendiente es distinta de cero al nivel nominal del 5% bajo el modelo HAC indicado; esto no demuestra causalidad.'
            : 'La pendiente no es distinta de cero al nivel nominal del 5% bajo el modelo HAC indicado.'}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#1b394b] bg-[#081824] p-5">
          <h2 className="mb-3 text-sm font-bold text-white">Método y trazabilidad</h2>
          <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2 text-xs">
            <Term label="Método" value={trend.method} />
            <Term label="Rezagos HAC" value={`${trend.newey_west_lags} (Bartlett)`} />
            <Term label="Variable" value={dataset.variable} />
            <Term label="Unidades" value={dataset.units} />
            <Term label="Agregación anual" value={dataset.annual_aggregation} />
            <Term label="Tipo" value="DERIVED · serie observacional NASA" />
          </dl>
          <a href={dataset.source_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#58d5e3] hover:text-white">
            Fuente oficial NASA GISS <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="mt-2 break-all font-mono text-[10px] text-[#728c97]">SHA-256 {dataset.source_sha256}</p>
        </div>
        <div className="rounded-2xl border border-[#705d2e] bg-[#241e11] p-5">
          <h2 className="mb-2 text-sm font-bold text-[#ffe09a]">Alcance y limitaciones</h2>
          <p className="text-xs leading-relaxed text-[#d8c99f]">
            {dataset.spatial_scope}. La pendiente resume una serie agregada y no se debe representar como un mapa de
            cambios espaciales. La banda es un intervalo asintótico nominal del 95% con errores estándar HAC
            Newey–West; no ajusta pruebas múltiples ni es una prueba de causalidad. La tabla publicada no aporta
            incertidumbres por observación para esta serie, que no se propagan aquí.
          </p>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[#173343] bg-[#071620] p-4"><div className="text-[10px] font-mono uppercase tracking-wider text-[#8faab5]">{label}</div><div className="mt-2 text-lg font-bold text-white">{value}</div></div>;
}

function Term({ label, value }: { label: string; value: string }) {
  return <><dt className="text-[#8faab5]">{label}</dt><dd className="text-[#d4e4e8]">{value}</dd></>;
}
