/**
 * OLEA i18n V20 — render-time catalog translation.
 *
 * - One locale store (no second selector, no DOM MutationObserver).
 * - Strings are translated when React creates elements (see ./jsx/*), using
 *   catalogs keyed by the source text that already lives in the components.
 * - Catalogs are lazy chunks: only the active locale is downloaded.
 * - Lookups are O(1) and memoised per string; misses are cached too.
 * - Changing language remounts <App/> once (main.tsx) so every view re-renders.
 */

export type Locale = 'es' | 'en' | 'ja' | 'nb' | 'zh-Hans' | 'ar';

export interface LocaleInfo {
  code: Locale;
  short: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALES: LocaleInfo[] = [
  { code: 'es', short: 'ES', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'en', short: 'EN', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ja', short: 'JA', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'nb', short: 'NB', name: 'Norwegian Bokmål', nativeName: 'Norsk bokmål', dir: 'ltr' },
  { code: 'zh-Hans', short: 'ZH', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
  { code: 'ar', short: 'AR', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];

const LOCALE_CODES = new Set<string>(LOCALES.map((l) => l.code));
const STORAGE_KEY = 'olea:locale:v20';
const LEGACY_KEYS = ['amoh:locale:v10', 'amoh-global-i18n-locale'];

type Catalog = Record<string, string>;

const catalogLoaders = import.meta.glob<Catalog>('./catalogs/*.json', { import: 'default' });

function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  if (LOCALE_CODES.has(value)) return value as Locale;
  const v = value.toLowerCase();
  if (v.startsWith('zh')) return 'zh-Hans';
  if (v === 'no' || v === 'nn' || v.startsWith('nb')) return 'nb';
  const base = v.split('-')[0];
  return LOCALE_CODES.has(base) ? (base as Locale) : null;
}

function readInitialLocale(): Locale {
  try {
    const saved = normalizeLocale(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
    for (const k of LEGACY_KEYS) {
      const legacy = normalizeLocale(localStorage.getItem(k));
      if (legacy) return legacy;
    }
  } catch {
    /* storage unavailable */
  }
  return 'es';
}

let locale: Locale = readInitialLocale();
let exact: Map<string, string> | null = null;
let templates: Array<{ re: RegExp; out: string }> = [];
let cache = new Map<string, string>();
const listeners = new Set<() => void>();
const CACHE_LIMIT = 40000;

// Dev-only diagnostics: which rendered strings have no translation yet.
const DEV = import.meta.env.DEV;
const missing = new Map<string, number>();

if (typeof window !== 'undefined') {
  (window as unknown as { __OLEA_I18N__: unknown }).__OLEA_I18N__ = {
    get locale() {
      return locale;
    },
    get size() {
      return exact?.size ?? 0;
    },
    missing,
    dumpMissing: () => [...missing.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k),
  };
}

const LETTER = /\p{L}/u;
const NUM = /-?\d+(?:[.,]\d+)*/g;

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildCatalog(cat: Catalog | null) {
  exact = null;
  templates = [];
  cache = new Map();
  if (!cat) return;
  exact = new Map();
  const tpl: Array<{ re: RegExp; out: string; weight: number }> = [];
  for (const [k, v] of Object.entries(cat)) {
    if (typeof v !== 'string' || !v) continue;
    exact.set(k, v);
    if (/\{\d+\}/.test(k)) {
      const literal = k.replace(/\{\d+\}/g, '');
      if (literal.replace(/[^\p{L}]/gu, '').length < 3) continue;
      const order: number[] = [];
      const src = k
        .split(/(\{\d+\})/)
        .map((part) => {
          const m = /^\{(\d+)\}$/.exec(part);
          if (m) {
            order.push(Number(m[1]));
            return '(.+?)';
          }
          return escapeRe(part);
        })
        .join('');
      try {
        const re = new RegExp('^' + src + '$', 'u');
        const out = v.replace(/\{(\d+)\}/g, (_, i) => {
          const pos = order.indexOf(Number(i));
          return pos >= 0 ? `\u0000${pos}\u0000` : '';
        });
        tpl.push({ re, out, weight: literal.length });
      } catch {
        /* skip malformed key */
      }
    }
  }
  templates = tpl.sort((a, b) => b.weight - a.weight).map(({ re, out }) => ({ re, out }));
}

function lookupCore(core: string): string | undefined {
  const map = exact!;
  let t = map.get(core);
  if (t !== undefined) return t;

  // Trailing punctuation variants: "Capas:" → "Capas" + ":"
  const p = /^(.*?\p{L}.*?)([\s:：·•…!?¡¿.,;)]+)$/u.exec(core);
  if (p) {
    t = map.get(p[1]);
    if (t !== undefined) return t + p[2];
  }

  // Numbers inside the string: "Barcos: 24" → "Barcos: {0}"
  const nums: string[] = [];
  const keyed = core.replace(NUM, (x) => `{${nums.push(x) - 1}}`);
  if (nums.length) {
    t = map.get(keyed);
    if (t !== undefined) return t.replace(/\{(\d+)\}/g, (_, i) => nums[Number(i)] ?? '');
  }

  // Template keys with arbitrary slots: "Capa {0} activa"
  for (const { re, out } of templates) {
    const m = re.exec(core);
    if (m) {
      return out.replace(/\u0000(\d+)\u0000/g, (_, i) => {
        const slot = m[Number(i) + 1] ?? '';
        return translateString(slot);
      });
    }
  }
  return undefined;
}

/** Translate one string into the active locale (identity when unknown). */
export function translateString(s: string): string {
  if (!exact || s.length < 2 || s.length > 3000) return s;
  const hit = cache.get(s);
  if (hit !== undefined) return hit;

  let result = s;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s)!;
  const core = m[2].includes('\n') || m[2].includes('  ') ? m[2].replace(/\s+/g, ' ') : m[2];
  if (core && LETTER.test(core)) {
    const t = lookupCore(core);
    if (t !== undefined) result = m[1] + t + m[3];
    else if (DEV && locale !== 'es') missing.set(core, (missing.get(core) ?? 0) + 1);
  }
  if (cache.size > CACHE_LIMIT) cache.clear();
  cache.set(s, result);
  return result;
}

/** Short alias for code that needs an explicit string (e.g. imperative DOM / canvas). */
export const tr = translateString;

export function isTranslating(): boolean {
  return exact !== null;
}

export function getLocale(): Locale {
  return locale;
}

export function getLocaleInfo(code: Locale = locale): LocaleInfo {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function subscribeLocale(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function applyDocumentLocale(code: Locale) {
  if (typeof document === 'undefined') return;
  const info = getLocaleInfo(code);
  const html = document.documentElement;
  html.lang = code;
  html.dataset.oleaDir = info.dir;
  // The map shell stays LTR (controls are positioned physically);
  // text direction for Arabic is handled in CSS via [data-olea-dir="rtl"].
  html.dir = 'ltr';
}

async function loadCatalog(code: Locale): Promise<Catalog | null> {
  const loader = catalogLoaders[`./catalogs/${code}.json`];
  if (!loader) return null;
  try {
    return await loader();
  } catch (err) {
    console.warn('[olea-i18n] catalog failed to load', code, err);
    return null;
  }
}

let loadToken = 0;

export async function setLocale(next: Locale): Promise<void> {
  const code = normalizeLocale(next) ?? 'es';
  const token = ++loadToken;
  const cat = await loadCatalog(code);
  if (token !== loadToken) return; // a newer request won
  locale = code;
  missing.clear();
  buildCatalog(cat);
  applyDocumentLocale(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

/** Load the saved locale's catalog before the first render. */
export async function initI18n(): Promise<void> {
  applyDocumentLocale(locale);
  const cat = await loadCatalog(locale);
  buildCatalog(cat);
}
