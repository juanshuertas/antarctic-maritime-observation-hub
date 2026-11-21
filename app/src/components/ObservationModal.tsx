/**
 * OBSERVAR — captura de campo del observatorio publico.
 *
 * Camara en vivo, varias fotos, identificacion asistida por modelo de vision e
 * envio directo a Supabase (tabla `olea_public_observations` + bucket privado).
 * Todo lo que entra por aqui nace como PENDING_REVIEW: no se mezcla con la
 * cadena auditada PB124.
 *
 * Sin conexion el registro no se pierde: queda en la lista local del mapa y se
 * ofrece reintentar el envio sin volver a llenar el formulario.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, MapPin, Camera, Image as ImageIcon, Sparkles, Trash2,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw, CloudUpload, Scan,
} from 'lucide-react';
import {
  identifyPhoto, shrinkImage, uploadObservationPhoto, createPublicObservation,
  type VisionResult,
} from '../lib/olea-cloud';

export interface LocalRecord {
  id: string;
  type: string;
  notes: string;
  recorded_at: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_m?: number | null;
  location_source: 'browser' | 'manual' | 'none';
  status: string;
  photo_count?: number;
  ai_summary?: string | null;
  cloud_status?: 'sent' | 'local_only';
}

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: LocalRecord) => void;
}

/** Catalogo de lo que se puede registrar en campo, agrupado por dominio. */
const CATALOG: { group: string; emoji: string; items: string[] }[] = [
  {
    group: 'Fauna', emoji: '🐋',
    items: [
      'Cetáceos (ballenas, delfines)', 'Pinnípedos (focas, lobos marinos)', 'Pingüinos',
      'Aves marinas', 'Krill o enjambre', 'Peces', 'Bentos y esponjas',
      'Fauna varada o muerta', 'Interacción fauna–buque',
    ],
  },
  {
    group: 'Hielo', emoji: '🧊',
    items: [
      'Iceberg tabular', 'Iceberg no tabular o growler', 'Banquisa / hielo marino',
      'Nilas o hielo nuevo', 'Hielo panqueque', 'Grieta o polinia',
      'Desprendimiento (calving)', 'Hielo sucio o con sedimento',
    ],
  },
  {
    group: 'Océano y atmósfera', emoji: '🌊',
    items: [
      'Estado del mar y oleaje', 'Color del agua o floración', 'Visibilidad y nubosidad',
      'Viento y mar de fondo', 'Aurora austral', 'Precipitación', 'Niebla',
    ],
  },
  {
    group: 'Actividad humana', emoji: '🚢',
    items: [
      'Buque avistado', 'Arte de pesca o actividad pesquera', 'Base, refugio o campamento',
      'Aeronave', 'Turismo o desembarco', 'Residuos o plástico',
      'Mancha de hidrocarburo', 'Ruido o molestia a fauna',
    ],
  },
  {
    group: 'Ciencia', emoji: '🔬',
    items: [
      'Lance CTD o muestreo', 'Despliegue de instrumento', 'Boya o deriva',
      'Marcaje o anillamiento', 'Nota oceanográfica general', 'Incidente o seguridad',
    ],
  },
];

const MAX_PHOTOS = 8;

interface Shot {
  id: string;
  blob: Blob;
  url: string;
}

export default function ObservationModal({ isOpen, onClose, onSave }: ObservationModalProps) {
  const [group, setGroup] = useState(CATALOG[0].group);
  const [kind, setKind] = useState(CATALOG[0].items[0]);
  const [notes, setNotes] = useState('');
  const [observer, setObserver] = useState('');

  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [source, setSource] = useState<'browser' | 'manual' | 'none'>('none');
  const [locStatus, setLocStatus] = useState('El navegador pedirá permiso. La ubicación se guarda solo si la confirmas.');
  const [locating, setLocating] = useState(false);

  const [shots, setShots] = useState<Shot[]>([]);
  const [camOpen, setCamOpen] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  const [ai, setAi] = useState<VisionResult | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  // Modo "lente": el modelo va mirando mientras apuntas, sin obturador.
  const [liveOn, setLiveOn] = useState(false);
  const [liveResult, setLiveResult] = useState<VisionResult | null>(null);
  const [liveNote, setLiveNote] = useState<string | null>(null);
  const liveBusy = useRef(false);
  const lastSig = useRef<Uint8ClampedArray | null>(null);
  const cadence = useRef(5000);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo(() => CATALOG.find((c) => c.group === group)?.items ?? [], [group]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOpen(false);
    setLiveOn(false);
    lastSig.current = null;
  };

  // La camara no puede quedar encendida si el modal se cierra.
  useEffect(() => () => stopCamera(), []);
  useEffect(() => { if (!isOpen) stopCamera(); }, [isOpen]);
  useEffect(() => () => { shots.forEach((s) => URL.revokeObjectURL(s.url)); }, [shots]);

  if (!isOpen) return null;

  const openCamera = async () => {
    setCamError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('Este navegador no da acceso a la cámara. Usa "Subir foto".');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCamError('No se pudo abrir la cámara (permiso denegado o en uso). Usa "Subir foto".');
    }
  };

  const addBlob = async (raw: Blob) => {
    if (shots.length >= MAX_PHOTOS) return;
    try {
      const { blob } = await shrinkImage(raw);
      setShots((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, blob, url: URL.createObjectURL(blob) }]);
    } catch {
      setCamError('No se pudo procesar esa imagen.');
    }
  };

  const shoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((b) => { if (b) void addBlob(b); }, 'image/jpeg', 0.92);
    // Lo que el lente venia leyendo es la identificacion de esa captura.
    if (liveResult?.ok && !ai) setAi(liveResult);
  };

  /** Firma barata de la escena (32x32 en gris) para no gastar cuota en fotogramas iguales. */
  const sceneChanged = (video: HTMLVideoElement): boolean => {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;
    ctx.drawImage(video, 0, 0, 32, 32);
    const data = ctx.getImageData(0, 0, 32, 32).data;
    const prev = lastSig.current;
    lastSig.current = data;
    if (!prev) return true;
    let diff = 0;
    for (let i = 0; i < data.length; i += 4) diff += Math.abs(data[i] - prev[i]);
    return diff / (data.length / 4) > 7; // umbral: cambio real, no ruido del sensor
  };

  const grabFrame = (maxSide: number): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video?.videoWidth) return Promise.resolve(null);
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(video.videoWidth * scale);
    c.height = Math.round(video.videoHeight * scale);
    c.getContext('2d')?.drawImage(video, 0, 0, c.width, c.height);
    return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.75));
  };

  const handleLocate = () => {
    if (!navigator.geolocation) { setLocStatus('Geolocalización no disponible en este navegador.'); return; }
    setLocating(true);
    setLocStatus('Obteniendo coordenadas GPS…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
        setAccuracy(Math.round(pos.coords.accuracy));
        setSource('browser');
        setLocStatus(`Posición fijada · precisión ±${Math.round(pos.coords.accuracy)} m`);
        setLocating(false);
      },
      () => { setLocStatus('No se pudo obtener señal GPS. Puedes escribir las coordenadas a mano.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  // El bucle no es streaming real: muestrea fotogramas. El plan gratuito de
  // Gemini ronda los 15 req/min, asi que solo manda cuando la escena cambio y
  // se frena solo si la cuota responde 429.
  useEffect(() => {
    if (!liveOn || !camOpen) return;
    let stopped = false;

    const tick = async () => {
      if (stopped || liveBusy.current) return;
      const video = videoRef.current;
      if (!video?.videoWidth || !sceneChanged(video)) return;

      const frame = await grabFrame(768);
      if (!frame || stopped) return;

      liveBusy.current = true;
      const result = await identifyPhoto({
        blob: frame,
        hintType: kind,
        lat: lat ? parseFloat(lat) : null,
        lon: lon ? parseFloat(lon) : null,
      }).catch((e) => ({ ok: false, error: e instanceof Error ? e.message : String(e) } as VisionResult));
      liveBusy.current = false;
      if (stopped) return;

      if (result.ok) {
        cadence.current = 5000;
        setLiveNote(null);
        setLiveResult(result);
      } else if (/cuota|429|quota/i.test(result.error ?? '')) {
        cadence.current = Math.min(30000, cadence.current * 2);
        setLiveNote('Cuota del modelo al limite: el lente va mas lento.');
      } else {
        setLiveNote(result.error ?? 'El lente no pudo analizar el cuadro.');
      }
    };

    const id = setInterval(() => void tick(), cadence.current);
    void tick();
    return () => { stopped = true; clearInterval(id); };
  }, [liveOn, camOpen, kind, lat, lon]);

  const runIdentify = async () => {
    if (!shots.length) return;
    setAiBusy(true);
    setAi(null);
    const result = await identifyPhoto({
      blob: shots[0].blob,
      hintType: kind,
      lat: lat ? parseFloat(lat) : null,
      lon: lon ? parseFloat(lon) : null,
    }).catch((e) => ({ ok: false, error: e instanceof Error ? e.message : String(e) } as VisionResult));
    setAi(result);
    setAiBusy(false);
  };

  const adoptAi = () => {
    if (!ai?.summary) return;
    setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n` : '') + `Identificación asistida: ${ai.summary}`);
  };

  const submit = async () => {
    if (!notes.trim() && shots.length === 0) {
      setSendError('Agrega al menos una nota o una foto.');
      return;
    }
    setSending(true);
    setSendError(null);

    const parsedLat = lat.trim() !== '' ? parseFloat(lat) : null;
    const parsedLon = lon.trim() !== '' ? parseFloat(lon) : null;
    const capturedAt = new Date().toISOString();

    let cloudStatus: 'sent' | 'local_only' = 'local_only';
    try {
      const paths: string[] = [];
      for (let i = 0; i < shots.length; i += 1) {
        paths.push(await uploadObservationPhoto(shots[i].blob, i));
      }
      await createPublicObservation({
        observation_type: kind,
        notes: notes.trim() || null,
        captured_at_utc: capturedAt,
        device_local_time: new Date().toString().slice(0, 33),
        latitude: parsedLat,
        longitude: parsedLon,
        accuracy_m: accuracy,
        location_source: parsedLat !== null ? source : 'none',
        observer_name: observer.trim() || null,
        photo_paths: paths,
        ai_identification: ai?.ok ? (ai as unknown as Record<string, unknown>) : {},
        app_metadata: { group, user_agent: navigator.userAgent.slice(0, 180), photos: paths.length },
      });
      cloudStatus = 'sent';
      setSent(true);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : String(e));
    }

    onSave({
      id: `OBS-${Date.now().toString().slice(-5)}`,
      type: kind,
      notes: notes.trim(),
      recorded_at: capturedAt,
      latitude: parsedLat,
      longitude: parsedLon,
      accuracy_m: accuracy,
      location_source: parsedLat !== null ? source : 'none',
      status: cloudStatus === 'sent' ? 'sent_pending_review' : 'local_unreviewed',
      photo_count: shots.length,
      ai_summary: ai?.summary ?? null,
      cloud_status: cloudStatus,
    });

    setSending(false);
    if (cloudStatus === 'sent') setTimeout(() => { stopCamera(); onClose(); }, 1800);
  };

  const close = () => { stopCamera(); onClose(); };

  const field = 'w-full rounded-lg bg-[#0b1921] border border-[#2c4551] px-3 py-2 text-[13px] text-[#edf5f5] outline-none focus:border-[#58d5e3]';

  return (
    <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm select-none">
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#11232d', borderColor: '#42606b', color: '#edf5f5', fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between bg-[#0b1921] shrink-0" style={{ borderColor: '#29404a' }}>
          <div className="flex items-center gap-2 min-w-0">
            <Camera className="w-5 h-5 text-[#58d5e3] shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate">Registrar observación</p>
              <p className="text-[10px] opacity-60 truncate">Entra como pendiente de revisión</p>
            </div>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-4">
          {sent && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
              <p className="text-[12px]">Observación enviada. Queda pendiente de revisión del equipo científico.</p>
            </div>
          )}

          {/* ---- tipo ---- */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5">Qué estás viendo</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {CATALOG.map((c) => (
                <button
                  key={c.group}
                  onClick={() => { setGroup(c.group); setKind(c.items[0]); }}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                    group === c.group
                      ? 'bg-[#58d5e3]/20 border-[#58d5e3]/60 text-white'
                      : 'bg-[#0b1921] border-[#2c4551] text-[#9fb4c2] hover:border-[#58d5e3]/40'
                  }`}
                >
                  <span className="mr-1">{c.emoji}</span>{c.group}
                </button>
              ))}
            </div>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${field} mt-1.5`}>
              {items.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* ---- fotos ---- */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5">
              Fotos ({shots.length}/{MAX_PHOTOS})
            </p>

            {camOpen && (
              <div className="relative rounded-lg overflow-hidden border border-[#2c4551] mb-2 bg-black">
                <video ref={videoRef} playsInline muted className="w-full max-h-64 object-contain" />
                {/* Lectura del lente sobre la propia imagen, como en una app de camara */}
                {liveOn && (
                  <div className="absolute inset-x-0 top-0 p-2">
                    <div className="rounded-lg bg-black/70 backdrop-blur-sm border border-[#58d5e3]/40 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-[#9ee9f2] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Lente activo
                        {liveBusy.current && <Loader2 className="w-3 h-3 animate-spin" />}
                      </p>
                      {liveResult?.ok ? (
                        <>
                          <p className="text-[12px] leading-snug mt-0.5">{liveResult.summary}</p>
                          {!!liveResult.labels?.length && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {liveResult.labels.slice(0, 4).map((l, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
                                  {l.label}
                                  {typeof l.confidence === 'number' ? ` ${Math.round(l.confidence * 100)}%` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-[11px] opacity-70 mt-0.5">Apunta a lo que quieras identificar…</p>
                      )}
                      {liveNote && <p className="text-[10px] text-amber-300 mt-1">{liveNote}</p>}
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2.5 p-2 bg-gradient-to-t from-black/80">
                  <button
                    onClick={() => { setLiveOn((v) => !v); setLiveResult(null); setLiveNote(null); lastSig.current = null; }}
                    className={`px-2.5 py-1.5 rounded-full border text-[11px] flex items-center gap-1 transition-colors ${
                      liveOn ? 'bg-[#58d5e3]/25 border-[#58d5e3] text-white' : 'bg-black/60 border-white/30 text-white/80'
                    }`}
                    title="Identificación continua mientras apuntas"
                  >
                    <Scan className="w-3.5 h-3.5" />{liveOn ? 'Lente activo' : 'Lente'}
                  </button>
                  <button onClick={shoot} className="w-12 h-12 rounded-full bg-white/95 border-4 border-[#58d5e3] active:scale-95 transition-transform" aria-label="Capturar" />
                  <button onClick={stopCamera} className="px-2.5 py-1.5 rounded-full bg-black/60 border border-white/30 text-[11px]">Cerrar</button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={camOpen ? shoot : openCamera}
                disabled={shots.length >= MAX_PHOTOS}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#58d5e3]/15 border border-[#58d5e3]/50 text-[12px] font-semibold text-[#9ee9f2] disabled:opacity-40"
              >
                <Camera className="w-4 h-4" />{camOpen ? 'Capturar' : 'Cámara en vivo'}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={shots.length >= MAX_PHOTOS}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0b1921] border border-[#2c4551] text-[12px] text-[#b7c5d8] disabled:opacity-40"
              >
                <ImageIcon className="w-4 h-4" />Subir foto
              </button>
              <input
                ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden
                onChange={(e) => {
                  Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - shots.length).forEach((f) => void addBlob(f));
                  e.target.value = '';
                }}
              />
            </div>
            {camError && <p className="text-[11px] text-amber-300 mt-1.5">{camError}</p>}

            {shots.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {shots.map((s) => (
                  <div key={s.id} className="relative aspect-square rounded-md overflow-hidden border border-[#2c4551]">
                    <img src={s.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setShots((p) => p.filter((x) => x.id !== s.id))}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-[#ff9c93]"
                      aria-label="Quitar foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---- identificacion asistida ---- */}
          {shots.length > 0 && (
            <div className="rounded-lg border border-[#2c4551] bg-[#0b1921] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />Identificación asistida
                </p>
                <button
                  onClick={runIdentify}
                  disabled={aiBusy}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-[11px] text-emerald-200 disabled:opacity-50"
                >
                  {aiBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {aiBusy ? 'Analizando…' : ai ? 'Reintentar' : 'Analizar foto'}
                </button>
              </div>

              {ai?.ok && (
                <div className="mt-2 text-[12px] space-y-1.5">
                  <p className="leading-relaxed">{ai.summary}</p>
                  {!!ai.labels?.length && (
                    <div className="flex flex-wrap gap-1">
                      {ai.labels.map((l, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-[#0f2b33] border border-[#2c4551] text-[10px]">
                          {l.label}
                          {l.scientific_name ? <em className="opacity-60"> · {l.scientific_name}</em> : null}
                          {typeof l.confidence === 'number' ? <span className="opacity-60"> {Math.round(l.confidence * 100)}%</span> : null}
                        </span>
                      ))}
                    </div>
                  )}
                  {ai.caveats && <p className="text-[10px] opacity-60">{ai.caveats}</p>}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button onClick={adoptAi} className="px-2 py-0.5 rounded bg-white/10 text-[11px]">Copiar a las notas</button>
                    <span className="text-[10px] opacity-50">Sugerencia del modelo · verifícala</span>
                  </div>
                </div>
              )}
              {ai && !ai.ok && (
                <p className="mt-2 text-[11px] text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {ai.error}
                </p>
              )}
              {!ai && !aiBusy && (
                <p className="mt-1.5 text-[10px] opacity-55">
                  La foto se analiza en el servidor; nunca sustituye la verificación de la persona.
                </p>
              )}
            </div>
          )}

          {/* ---- posicion ---- */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5">Posición</p>
            <button onClick={handleLocate} disabled={locating} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0b1921] border border-[#2c4551] text-[12px] disabled:opacity-50">
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4 text-[#58d5e3]" />}
              Usar mi ubicación
            </button>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input className={field} placeholder="Latitud" inputMode="decimal" value={lat}
                onChange={(e) => { setLat(e.target.value); setSource('manual'); }} />
              <input className={field} placeholder="Longitud" inputMode="decimal" value={lon}
                onChange={(e) => { setLon(e.target.value); setSource('manual'); }} />
            </div>
            <p className="text-[10px] opacity-55 mt-1">{locStatus}</p>
          </div>

          {/* ---- notas ---- */}
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5">Notas</p>
            <textarea
              className={`${field} min-h-[88px] resize-y`}
              placeholder="Qué viste, cuántos, comportamiento, condiciones…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <input className={`${field} mt-2`} placeholder="Tu nombre (opcional)" value={observer}
              onChange={(e) => setObserver(e.target.value)} maxLength={120} />
          </div>
        </div>

        {/* ---- envio ---- */}
        <div className="px-4 py-3 border-t bg-[#0b1921] shrink-0 space-y-2" style={{ borderColor: '#29404a' }}>
          {sendError && (
            <p className="text-[11px] text-[#ff9c93] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{sendError} El registro quedó guardado en este dispositivo; puedes reintentar el envío.</span>
            </p>
          )}
          <button
            onClick={submit}
            disabled={sending || sent}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-[13px] font-bold text-slate-950 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" />
              : sendError ? <RefreshCw className="w-4 h-4" />
              : <CloudUpload className="w-4 h-4" />}
            {sending ? 'Enviando…' : sent ? 'Enviada' : sendError ? 'Reintentar envío' : 'Enviar observación'}
          </button>
          <p className="text-[10px] opacity-50 leading-snug">
            Se envían las fotos, la posición si la confirmaste y tus notas. No se publican: quedan para revisión del equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
