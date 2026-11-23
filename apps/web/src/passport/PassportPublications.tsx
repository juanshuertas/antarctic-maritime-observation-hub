import { FileText, ExternalLink, Award } from 'lucide-react';

const PUBLICATIONS = [
  {
    id: 'pub-01',
    title: 'Mesoscale Hydrographic Variability and Krill Swarm Dynamics in the Bransfield Strait',
    journal: 'Journal of Geophysical Research: Oceans (2026)',
    doi: '10.1029/2026JC021489',
    citations: 18,
    authors: 'Huertas, J.S., Vasquez, E., Silva, M., et al.',
    type: 'Peer-reviewed Article'
  },
  {
    id: 'pub-02',
    title: 'Sub-surface Intrusion of Modified Circumpolar Deep Water Near King George Island: Acoustic & Glider Evidence',
    journal: 'Polar Biology & Cryosphere Systems',
    doi: '10.1007/s00300-026-03412-x',
    citations: 9,
    authors: 'Huertas, J.S., Valenzuela, C., & Jenkins, S.',
    type: 'CCAMLR Working Group Report'
  },
  {
    id: 'pub-03',
    title: 'Autonomous Multi-frequency Acoustic Monitoring of Antarctic Marine Protected Areas (MPA 48.1)',
    journal: 'AMOH Open Science Monographs Vol. 4',
    doi: '10.5281/zenodo.10992482',
    citations: 14,
    authors: 'AMOH Scientific Taskforce (Lead: J.S. Huertas)',
    type: 'Technical Monograph'
  }
];

export default function PassportPublications() {
  return (
    <div className="space-y-8 font-mono">
      <div className="border-b border-[#1b3543] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#a995ff]" />
            <span>Publicaciones Científicas & Citas</span>
          </h1>
          <p className="text-xs text-[#8faab5] mt-1">
            Artículos arbitrados, monografías técnicas e informes para los grupos de trabajo de CCAMLR y SCAR.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-[#213f4f] bg-[#0c1824] text-[#a995ff] text-xs font-bold">
          41 Citas Totales
        </div>
      </div>

      <div className="space-y-4">
        {PUBLICATIONS.map((pub) => (
          <div
            key={pub.id}
            className="p-6 rounded-2xl border border-[#1b3543] bg-[#0a1520] hover:border-[#a995ff]/50 transition-all space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#162734] pb-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#a995ff]/15 text-[#a995ff] border border-[#a995ff]/30">
                {pub.type}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#72e0b5]">
                <Award className="w-3.5 h-3.5" />
                <span>{pub.citations} Citas</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white leading-snug">{pub.title}</h3>
            <p className="text-xs text-[#8faab5]">{pub.authors}</p>
            <div className="text-xs text-[#00e5ff] font-semibold">{pub.journal}</div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#6e8996] border-t border-[#122330]">
              <span>DOI: {pub.doi}</span>
              <button
                onClick={() => alert(`Visualizando DOI ${pub.doi}`)}
                className="flex items-center gap-1 text-[#00e5ff] hover:underline"
              >
                <span>Ver registro</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
