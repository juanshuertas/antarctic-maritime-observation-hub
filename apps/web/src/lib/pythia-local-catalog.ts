interface CatalogSource {
  id: string;
  title: string;
  organization?: string;
  url?: string;
  landing?: string;
  variables?: string[];
  role?: string;
  status?: string;
  training_gate?: string;
}

interface Catalog {
  sources: CatalogSource[];
}

const SYNONYMS: Record<string, string[]> = {
  pesca: ['fishing', 'fisheries', 'gfw', 'ccamlr'],
  pesquero: ['fishing', 'fisheries', 'gfw'],
  fauna: ['biodiversity', 'obis', 'species'],
  biodiversidad: ['biodiversity', 'obis', 'species'],
  oceano: ['ocean', 'argo', 'soccom'],
  oceanografia: ['ocean', 'argo', 'soccom'],
  oceanograficas: ['ocean', 'argo', 'soccom'],
  corriente: ['ocean', 'argo', 'soccom'],
  corrientes: ['ocean', 'argo', 'soccom'],
  estacion: ['station', 'argo', 'usgs'],
  estaciones: ['station', 'argo', 'usgs'],
  sismica: ['seismic', 'usgs'],
  terremoto: ['earthquake', 'usgs'],
  gravedad: ['gravity', 'antgg'],
  geofisica: ['gravity', 'antgg'],
  hielo: ['ice', 'antarctic'],
  buque: ['vessel', 'ais', 'gfw', 'webcam'],
};

function tokens(text: string): string[] {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
}

export async function searchPythiaCatalog(question: string): Promise<CatalogSource[]> {
  const url = `${import.meta.env.BASE_URL}data/catalog/olea/open_science_sources_v3.json`;
  const response = await fetch(url, { cache: 'force-cache', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Catálogo HTTP ${response.status}`);
  const catalog: Catalog = await response.json();
  if (!Array.isArray(catalog?.sources)) throw new Error('Catálogo científico inválido');
  const words = tokens(question);
  const expanded = new Set(words.flatMap(word => [word, ...(SYNONYMS[word] ?? [])]));
  return catalog.sources
    .filter(source => source.id && source.title && (source.url || source.landing))
    .map(source => {
      const title = tokens(`${source.id} ${source.title}`);
      const body = tokens(`${source.organization ?? ''} ${source.role ?? ''} ${source.variables?.join(' ') ?? ''} ${source.training_gate ?? ''}`);
      const score = [...expanded].reduce((sum, term) => sum + (title.includes(term) ? 3 : 0) + (body.includes(term) ? 1 : 0), 0);
      return { source, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.source);
}
