import { Image as ImageIcon, MapPin, Camera } from 'lucide-react';

const PHOTOS = [
  {
    id: 'ph-01',
    title: 'Desprendimiento Glaciar en Bahía Paraíso',
    loc: "64°49'S, 62°52'W",
    date: '2026-02-14',
    photographer: 'Equipo AMOH / BIO Hespérides'
  },
  {
    id: 'ph-02',
    title: 'Avistamiento de Megaptera novaeangliae (Ballena Jorobada)',
    loc: 'Estrecho de Gerlache',
    date: '2026-02-18',
    photographer: 'Dra. Elena Vasquez'
  },
  {
    id: 'ph-03',
    title: "Base O'Higgins bajo ventisca catabática",
    loc: 'Península Antártica',
    date: '2026-01-28',
    photographer: 'Dr. J.S. Huertas'
  },
  {
    id: 'ph-04',
    title: 'Lanzamiento de Planeador Submarino Webb Slocum',
    loc: 'Isla Adelaida / Rothera',
    date: '2026-02-09',
    photographer: 'Misión AMOH-BAS'
  }
];

export default function PassportGallery() {
  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-[#1b3543] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-[#00e5ff]" />
            <span>Galería de Imágenes de Campo</span>
          </h1>
          <p className="text-xs text-[#8faab5] mt-1">
            Registro fotográfico de operaciones, fauna marina, glaciares y estaciones de investigación.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-[#213f4f] bg-[#0c1824] text-[#00e5ff] text-xs font-bold">
          {PHOTOS.length} Registros Fotográficos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PHOTOS.map((ph) => (
          <div
            key={ph.id}
            className="rounded-3xl border border-[#1b3543] bg-[#0a1520] overflow-hidden shadow-xl space-y-3 hover:border-[#00e5ff]/50 transition-all"
          >
            <div className="h-52 bg-gradient-to-br from-[#0c2235] via-[#081524] to-[#040c14] flex flex-col items-center justify-center text-[#00e5ff]/60 border-b border-[#162734]">
              <Camera className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-xs text-[#8faab5]">{ph.title}</span>
            </div>
            <div className="p-4 space-y-1 text-xs">
              <h3 className="font-bold text-white text-sm">{ph.title}</h3>
              <div className="flex items-center justify-between text-[11px] text-[#6e8996] pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>{ph.loc}</span>
                </span>
                <span>{ph.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
