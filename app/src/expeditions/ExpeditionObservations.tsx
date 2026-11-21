import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Eye, KeyRound, Layers, LogOut, MapPin, RefreshCw } from 'lucide-react';
import {
  createPB124ResearcherSession,
  loadPB124ObservationDetail,
  loadPB124Observations,
  mediaContentUrl,
  PB124ApiError,
  PB124_EXPEDITION_ID,
  type MediaVariant,
  type PB124Media,
  type PB124Observation,
  type PB124ObservationDetail,
} from '../lib/pb124-observations';

type PageStatus = 'LOADING' | 'AUTH_REQUIRED' | 'ERROR' | 'EMPTY_REAL_DATA' | 'LOADED';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'No se pudo completar la solicitud.';
}

function availableVariant(media: PB124Media, variant: MediaVariant): boolean {
  return media.variants[variant]?.available === true;
}

function variantIntegrity(media: PB124Media, variant: MediaVariant): string {
  return media.variants[variant]?.integrity_status ?? media.integrity_status;
}

function mediaCount(observations: PB124Observation[], variant: MediaVariant): number {
  return observations.reduce(
    (total, observation) => total + observation.media.filter((item) => availableVariant(item, variant)).length,
    0,
  );
}

function ObservationGallery({
  observation,
  media,
}: {
  observation: PB124Observation;
  media: PB124Media[];
}): ReactNode {
  const images = media.filter((item) => availableVariant(item, 'original') || availableVariant(item, 'preview'));
  if (images.length === 0) {
    return <p className="text-xs text-[#8faab5]">No hay bytes de evidencia disponibles en las fuentes locales examinadas.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {images.map((item) => (
        <article key={item.media_id} className="overflow-hidden rounded-xl border border-[#183140] bg-[#050f16]">
          {availableVariant(item, 'original') ? (
            <a href={mediaContentUrl(observation, item, 'original')} target="_blank" rel="noreferrer">
              <img
                src={mediaContentUrl(observation, item, 'original')}
                alt={`Evidencia archivada ${item.capture_label ?? item.media_id}`}
                className="aspect-[4/3] w-full object-contain bg-black"
                loading="lazy"
              />
            </a>
          ) : (
            <img
              src={mediaContentUrl(observation, item, 'preview')}
              alt={`Vista previa ${item.capture_label ?? item.media_id}`}
              className="aspect-[4/3] w-full object-contain bg-black"
              loading="lazy"
            />
          )}
          <div className="space-y-1 p-3 text-[10px] text-[#9bb5be]">
            <p className="font-bold text-white">
              {availableVariant(item, 'original') ? 'ORIGINAL CANDIDATE' : 'PREVIEW'}
              {' · '}
              {variantIntegrity(item, availableVariant(item, 'original') ? 'original' : 'preview')}
            </p>
            <p className="break-all font-mono">{item.media_id}</p>
            {availableVariant(item, 'preview') && availableVariant(item, 'original') && (
              <a
                className="text-[#38bdf8] underline"
                href={mediaContentUrl(observation, item, 'preview')}
                target="_blank"
                rel="noreferrer"
              >
                Abrir preview
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function ExpeditionObservations(): ReactNode {
  const { expeditionId = PB124_EXPEDITION_ID } = useParams();
  const [status, setStatus] = useState<PageStatus>('LOADING');
  const [observations, setObservations] = useState<PB124Observation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<PB124ObservationDetail | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setStatus('LOADING');
    setError('');
    setDetail(null);
    try {
      const records = await loadPB124Observations();
      setObservations(records);
      setSelectedId((current) => records.some((record) => record.observation_id === current)
        ? current
        : records[0]?.observation_id ?? '');
      setStatus(records.length ? 'LOADED' : 'EMPTY_REAL_DATA');
    } catch (loadError) {
      setObservations([]);
      setSelectedId('');
      setStatus(loadError instanceof PB124ApiError && loadError.status === 401 ? 'AUTH_REQUIRED' : 'ERROR');
      setError(loadError instanceof PB124ApiError && loadError.status === 401
        ? 'Se requiere una sesión investigadora válida. No se muestran datos de demostración.'
        : errorMessage(loadError));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let active = true;
    const selected = observations.find((record) => record.observation_id === selectedId);
    setDetail(null);
    if (!selected || status !== 'LOADED') return () => { active = false; };
    void loadPB124ObservationDetail(selected)
      .then((loaded) => { if (active) setDetail(loaded); })
      .catch((loadError: unknown) => {
        if (!active) return;
        setStatus(loadError instanceof PB124ApiError && loadError.status === 401 ? 'AUTH_REQUIRED' : 'ERROR');
        setError(errorMessage(loadError));
      });
    return () => { active = false; };
  }, [observations, selectedId, status]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setError('');
    try {
      await createPB124ResearcherSession(apiKey);
      setApiKey('');
      await refresh();
    } catch (loginError) {
      setStatus(loginError instanceof PB124ApiError && loginError.status === 401 ? 'AUTH_REQUIRED' : 'ERROR');
      setError(loginError instanceof PB124ApiError && loginError.status === 401
        ? 'La clave investigadora no fue aceptada.'
        : errorMessage(loginError));
    } finally {
      setApiKey('');
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/observations/researcher-session', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error(`No se pudo cerrar la sesión (${response.status}).`);
      await refresh();
    } catch (logoutError) {
      setStatus('ERROR');
      setError(errorMessage(logoutError));
    }
  }

  const selected = observations.find((record) => record.observation_id === selectedId) ?? null;
  const displayedDetail = detail && detail.observation_id === selectedId ? detail : selected;
  const photoTotal = mediaCount(observations, 'original');
  const previewTotal = mediaCount(observations, 'preview');

  if (expeditionId !== PB124_EXPEDITION_ID) {
    return (
      <div className="rounded-2xl border border-[#7a3940] bg-[#1a1116] p-6 text-sm text-[#ffb3b3]">
        Esta vista real está limitada a la expedición {PB124_EXPEDITION_ID}.
      </div>
    );
  }

  return (
    <main className="space-y-5 font-mono text-[#c4d7e0]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1b3543] pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Layers className="h-5 w-5 text-[#00e5ff]" />
            Observaciones PB124 — {PB124_EXPEDITION_ID}
          </h2>
          <p className="mt-1 text-xs text-[#8faab5]">
            Datos reales locales y snapshots históricos separados; la conexión cloud no se presume.
          </p>
        </div>
        {status === 'LOADED' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#214357] px-3 py-2 text-xs hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#214357] px-3 py-2 text-xs hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
            </button>
          </div>
        )}
      </header>

      {status === 'AUTH_REQUIRED' && (
        <form onSubmit={(event) => void handleLogin(event)} className="max-w-xl space-y-3 rounded-2xl border border-[#4b5962] bg-[#081724] p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <KeyRound className="h-4 w-4 text-[#f0b35a]" /> Autenticación investigadora requerida
          </div>
          <p className="text-xs text-[#8faab5]">
            La clave se envía al backend local para establecer una cookie HttpOnly temporal; no se guarda en el navegador.
          </p>
          <label className="block space-y-1 text-xs">
            <span>Clave de investigador</span>
            <input
              type="password"
              autoComplete="current-password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              className="w-full rounded-lg border border-[#294352] bg-[#050f16] px-3 py-2 text-white"
              required
            />
          </label>
          {error && <p role="alert" className="text-xs text-[#ff9c9c]">{error}</p>}
          <button
            type="submit"
            disabled={loginBusy}
            className="rounded-lg bg-[#00e5ff] px-4 py-2 text-xs font-bold text-[#050e14] disabled:opacity-50"
          >
            {loginBusy ? 'Autenticando…' : 'Iniciar sesión'}
          </button>
        </form>
      )}

      {status === 'LOADING' && (
        <p role="status" className="rounded-xl border border-[#1b3543] bg-[#081724] p-5 text-xs">
          LOADING — consultando API local protegida y snapshots disponibles.
        </p>
      )}
      {status === 'ERROR' && (
        <div role="alert" className="space-y-3 rounded-xl border border-[#7a3940] bg-[#1a1116] p-5 text-xs text-[#ffb3b3]">
          <p>ERROR — {error}</p>
          <button onClick={() => void refresh()} className="rounded-lg border border-[#7a3940] px-3 py-2">
            Reintentar
          </button>
        </div>
      )}
      {status === 'EMPTY_REAL_DATA' && (
        <p role="status" className="rounded-xl border border-[#1b3543] bg-[#081724] p-5 text-xs">
          EMPTY_REAL_DATA — no hay observaciones locales ni snapshot histórico disponible. No se insertaron ejemplos.
        </p>
      )}
      {error && status === 'LOADED' && <p role="alert" className="text-xs text-[#ff9c9c]">{error}</p>}

      {status === 'LOADED' && (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#1b3543]">
            <table className="w-full min-w-[1120px] border-collapse text-left text-[11px]">
              <thead className="bg-[#0a1e2d] text-[#9bb5be]">
                <tr>
                  {['Fecha UTC', 'UUID', 'Fuente', 'Estado cloud', 'Estado local', 'Originales', 'Previews', 'Recibos', 'GNSS', 'Calidad', 'Revisión'].map((heading) => (
                    <th key={heading} className="border-b border-[#1b3543] px-3 py-2 font-bold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {observations.map((record) => (
                  <tr
                    key={record.observation_id}
                    onClick={() => setSelectedId(record.observation_id)}
                    className={`cursor-pointer border-b border-[#142836] hover:bg-[#0a1e2d] ${record.observation_id === selectedId ? 'bg-[#0a1e2d]' : ''}`}
                  >
                    <td className="whitespace-nowrap px-3 py-2">{record.utc ?? 'NOT AVAILABLE'}</td>
                    <td className="px-3 py-2 font-mono">{record.observation_id}</td>
                    <td className="px-3 py-2">{record.source_status}</td>
                    <td className="px-3 py-2">{record.cloud_status}</td>
                    <td className="px-3 py-2">{record.local_status}</td>
                    <td className="px-3 py-2">{record.media.filter((item) => availableVariant(item, 'original')).length}</td>
                    <td className="px-3 py-2">{record.media.filter((item) => availableVariant(item, 'preview')).length}</td>
                    <td className="px-3 py-2">{record.receipt_count ?? 'Not indexed'}</td>
                    <td className="px-3 py-2">
                      {record.latitude === null || record.longitude === null ? 'Not available' : `${record.latitude}, ${record.longitude}`}
                      {record.accuracy_m != null ? ` (±${record.accuracy_m} m)` : ''}
                    </td>
                    <td className="px-3 py-2">{record.quality_level ?? record.qa_qc_status ?? 'Not recorded'}</td>
                    <td className="px-3 py-2">{record.field_status ?? 'Not recorded'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-[#8faab5]">
            {observations.length} registros · {photoTotal} archivos con variante original · {previewTotal} previews · CLOUD_LIVE: 0 verificados.
          </p>

          {displayedDetail && (
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <article className="space-y-4 rounded-2xl border border-[#1b3543] bg-[#081724] p-5 lg:col-span-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#142836] pb-3">
                  <span className="text-xs font-bold text-[#00e5ff]">{displayedDetail.source_status}</span>
                  <span className="text-xs text-[#f0b35a]">{displayedDetail.local_status}</span>
                </div>
                <h3 className="break-all text-sm font-bold text-white">{displayedDetail.observation_id}</h3>
                <div className="space-y-2 text-xs">
                  <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-[#72e0b5]" /> UTC: {displayedDetail.utc ?? 'NOT AVAILABLE'}</p>
                  <p><strong>Expedición:</strong> {displayedDetail.expedition_id}</p>
                  <p><strong>Tipo:</strong> {displayedDetail.observation_type ?? displayedDetail.observer_type ?? 'Not recorded'}</p>
                  <p><strong>GNSS:</strong> {displayedDetail.latitude ?? '—'}, {displayedDetail.longitude ?? '—'} {displayedDetail.accuracy_m != null ? `(±${displayedDetail.accuracy_m} m)` : ''}</p>
                  <p><strong>Estado cloud:</strong> {displayedDetail.cloud_status}</p>
                  <p><strong>Recibos:</strong> {displayedDetail.receipt_count ?? 'No local receipt index'}</p>
                  {displayedDetail.receipt_count_source && (
                    <p><strong>Fuente de recibos:</strong> {displayedDetail.receipt_count_source}</p>
                  )}
                  {displayedDetail.record_hash && <p className="break-all"><strong>Hash del registro local:</strong> {displayedDetail.record_hash}</p>}
                </div>
                {displayedDetail.notes && <p className="border-l-2 border-[#1e3c50] pl-3 text-xs leading-relaxed">{displayedDetail.notes}</p>}
                {(displayedDetail.field_payload || displayedDetail.snapshot_fields) && (
                  <details className="rounded-lg border border-[#183140] p-3">
                    <summary className="cursor-pointer text-xs font-bold">Metadatos científicos y de captura</summary>
                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-[10px] text-[#9bb5be]">
                      {JSON.stringify(displayedDetail.field_payload ?? displayedDetail.snapshot_fields, null, 2)}
                    </pre>
                  </details>
                )}
                {displayedDetail.latitude != null && displayedDetail.longitude != null && (
                  <Link
                    to={`/map?lat=${displayedDetail.latitude}&lon=${displayedDetail.longitude}&zoom=8`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00e5ff] px-3 py-2 text-xs font-bold text-[#050e14]"
                  >
                    <Eye className="h-4 w-4" /> Ver posición en mapa OLEA
                  </Link>
                )}
                <div className="text-[10px] text-[#6e8996]">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  No se ha verificado acceso cloud ni sincronización desde este panel.
                </div>
              </article>

              <article className="space-y-3 rounded-2xl border border-[#1b3543] bg-[#081724] p-5 lg:col-span-7">
                <div>
                  <h3 className="text-sm font-bold text-white">Galería privada</h3>
                  <p className="mt-1 text-[10px] text-[#8faab5]">
                    Las imágenes se sirven desde el backend local con sesión investigadora; bytes archivados sin hash fuente aparecen como no verificados.
                  </p>
                </div>
                {detail?.observation_id === selectedId
                  ? <ObservationGallery observation={displayedDetail} media={displayedDetail.media} />
                  : <p className="text-xs text-[#8faab5]">Cargando metadatos de medios…</p>}
              </article>
            </section>
          )}
        </>
      )}
    </main>
  );
}
