// AMOH_GLOBAL_I18N_V1_1_RESUME_FIX
// Uses already-generated catalogs only. No runtime translation service.

type Locale =
  | 'es'
  | 'en'
  | 'ja'
  | 'nb'
  | 'zh-Hans'
  | 'ar';

const LOCALES: Array<{
  code: Locale;
  label: string;
}> = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: 'JA' },
  { code: 'nb', label: 'NB' },
  { code: 'zh-Hans', label: '简' },
  { code: 'ar', label: 'AR' },
];

const STORAGE_KEY =
  'amoh-global-i18n-locale';

const CATALOG_BASE =
  '/amoh-i18n/catalogs';

const catalogCache =
  new Map<Locale, Record<string, string>>();

const originalText =
  new WeakMap<Text, string>();

const originalAttrs =
  new WeakMap<
    Element,
    Map<string, string>
  >();

let currentLocale: Locale =
  (
    localStorage.getItem(
      STORAGE_KEY,
    ) as Locale | null
  ) ?? 'es';

let observer:
  MutationObserver | null =
  null;

let selectorRoot:
  HTMLDivElement | null =
  null;

function normalize(
  value: string,
): string {
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadCatalog(
  locale: Locale,
): Promise<Record<string, string>> {
  const cached =
    catalogCache.get(locale);

  if (cached) return cached;

  try {
    const response =
      await fetch(
        `${CATALOG_BASE}/${locale}.json`,
        {
          cache: 'no-store',
        },
      );

    if (!response.ok) {
      throw new Error(
        `catalog ${locale}: ${response.status}`,
      );
    }

    const payload =
      await response.json();

    const catalog =
      payload &&
      typeof payload === 'object'
        ? payload as Record<
            string,
            string
          >
        : {};

    catalogCache.set(
      locale,
      catalog,
    );

    return catalog;
  } catch (error) {
    console.warn(
      'AMOH i18n catalog load failed',
      locale,
      error,
    );

    const empty = {};
    catalogCache.set(
      locale,
      empty,
    );

    return empty;
  }
}

function rememberAttribute(
  element: Element,
  name: string,
  value: string,
): void {
  let map =
    originalAttrs.get(
      element,
    );

  if (!map) {
    map =
      new Map<string, string>();

    originalAttrs.set(
      element,
      map,
    );
  }

  if (!map.has(name)) {
    map.set(
      name,
      value,
    );
  }
}

function translateExact(
  original: string,
  catalog: Record<string, string>,
): string {
  const direct =
    catalog[original];

  if (direct) return direct;

  const compact =
    normalize(original);

  if (
    compact !== original &&
    catalog[compact]
  ) {
    return catalog[compact];
  }

  return original;
}

function applyToTextNode(
  node: Text,
  catalog: Record<string, string>,
): void {
  const value =
    node.nodeValue ?? '';

  if (!value.trim()) return;

  if (
    node.parentElement?.closest(
      '[data-amoh-i18n-ui]',
    )
  ) {
    return;
  }

  if (
    !originalText.has(node)
  ) {
    originalText.set(
      node,
      value,
    );
  }

  const original =
    originalText.get(node) ??
    value;

  const leading =
    original.match(/^\s*/)?.[0] ??
    '';

  const trailing =
    original.match(/\s*$/)?.[0] ??
    '';

  const core =
    original.trim();

  if (!core) return;

  const translated =
    translateExact(
      core,
      catalog,
    );

  node.nodeValue =
    `${leading}${translated}${trailing}`;
}

function applyToElementAttrs(
  element: Element,
  catalog: Record<string, string>,
): void {
  if (
    element.closest(
      '[data-amoh-i18n-ui]',
    )
  ) {
    return;
  }

  for (
    const name of [
      'placeholder',
      'aria-label',
      'title',
      'alt',
    ]
  ) {
    const current =
      element.getAttribute(
        name,
      );

    if (!current?.trim()) {
      continue;
    }

    rememberAttribute(
      element,
      name,
      current,
    );

    const original =
      originalAttrs
        .get(element)
        ?.get(name) ??
      current;

    element.setAttribute(
      name,
      translateExact(
        original,
        catalog,
      ),
    );
  }
}

function walk(
  root: Node,
  catalog: Record<string, string>,
): void {
  if (
    root.nodeType ===
    Node.TEXT_NODE
  ) {
    applyToTextNode(
      root as Text,
      catalog,
    );

    return;
  }

  if (
    root.nodeType !==
      Node.ELEMENT_NODE &&
    root.nodeType !==
      Node.DOCUMENT_FRAGMENT_NODE &&
    root.nodeType !==
      Node.DOCUMENT_NODE
  ) {
    return;
  }

  if (
    root.nodeType ===
    Node.ELEMENT_NODE
  ) {
    applyToElementAttrs(
      root as Element,
      catalog,
    );
  }

  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT |
        NodeFilter.SHOW_ELEMENT,
    );

  let node:
    Node | null =
    walker.currentNode;

  while (node) {
    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {
      applyToTextNode(
        node as Text,
        catalog,
      );
    } else if (
      node.nodeType ===
      Node.ELEMENT_NODE
    ) {
      applyToElementAttrs(
        node as Element,
        catalog,
      );
    }

    node =
      walker.nextNode();
  }
}

function restoreOriginals(
  root: Node,
): void {
  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT |
        NodeFilter.SHOW_ELEMENT,
    );

  let node:
    Node | null =
    walker.currentNode;

  while (node) {
    if (
      node.nodeType ===
      Node.TEXT_NODE
    ) {
      const original =
        originalText.get(
          node as Text,
        );

      if (
        original !== undefined
      ) {
        (
          node as Text
        ).nodeValue =
          original;
      }
    } else if (
      node.nodeType ===
      Node.ELEMENT_NODE
    ) {
      const attrs =
        originalAttrs.get(
          node as Element,
        );

      if (attrs) {
        for (
          const [
            name,
            value,
          ] of attrs
        ) {
          (
            node as Element
          ).setAttribute(
            name,
            value,
          );
        }
      }
    }

    node =
      walker.nextNode();
  }
}

function localeDirection(
  locale: Locale,
): 'ltr' | 'rtl' {
  return locale === 'ar'
    ? 'rtl'
    : 'ltr';
}

async function applyLocale(
  locale: Locale,
): Promise<void> {
  currentLocale =
    locale;

  localStorage.setItem(
    STORAGE_KEY,
    locale,
  );

  document.documentElement.lang =
    locale;

  document.documentElement.dir =
    localeDirection(
      locale,
    );

  if (!document.body) {
    return;
  }

  restoreOriginals(
    document.body,
  );

  const catalog =
    await loadCatalog(
      locale,
    );

  if (locale !== 'es') {
    walk(
      document.body,
      catalog,
    );
  }

  updateSelectorLabel();

  document.dispatchEvent(
    new CustomEvent(
      'amoh:i18n-change',
      {
        detail: {
          locale,
        },
      },
    ),
  );
}

function findExistingLanguageButton():
  HTMLElement | null {
  const candidates =
    Array.from(
      document.querySelectorAll(
        'button,[role="button"]',
      ),
    ) as HTMLElement[];

  for (
    const element of candidates
  ) {
    if (
      element.closest(
        '[data-amoh-i18n-ui]',
      )
    ) {
      continue;
    }

    const text =
      normalize(
        element.textContent ??
        '',
      ).toUpperCase();

    if (
      /^(?:GB\s*)?(?:ES|EN|JA|NB|NO|AR|ZH|简|ENGLISH|ESPAÑOL)$/.test(
        text,
      ) ||
      text.includes(
        'LANG'
      ) ||
      text.includes(
        'IDIOMA'
      )
    ) {
      return element;
    }
  }

  return null;
}

function closePopover():
  void {
  selectorRoot
    ?.querySelector(
      '[data-amoh-i18n-popover]',
    )
    ?.remove();
}

function openPopover(
  anchor: HTMLElement,
): void {
  closePopover();

  const popover =
    document.createElement(
      'div',
    );

  popover.setAttribute(
    'data-amoh-i18n-popover',
    '1',
  );

  Object.assign(
    popover.style,
    {
      position: 'fixed',
      zIndex: '2147483000',
      minWidth: '150px',
      padding: '7px',
      border:
        '1px solid rgba(69,229,245,.28)',
      borderRadius: '13px',
      background:
        'rgba(2,15,24,.96)',
      boxShadow:
        '0 16px 45px rgba(0,0,0,.42)',
      backdropFilter:
        'blur(14px)',
      display: 'grid',
      gridTemplateColumns:
        'repeat(2,1fr)',
      gap: '5px',
      fontFamily:
        'Inter,system-ui,sans-serif',
    } as CSSStyleDeclaration,
  );

  const rect =
    anchor.getBoundingClientRect();

  popover.style.top =
    `${Math.min(
      window.innerHeight -
        190,
      rect.bottom + 8,
    )}px`;

  popover.style.left =
    `${Math.max(
      8,
      Math.min(
        window.innerWidth -
          166,
        rect.right - 150,
      ),
    )}px`;

  for (
    const item of LOCALES
  ) {
    const button =
      document.createElement(
        'button',
      );

    button.type =
      'button';

    button.textContent =
      item.label;

    Object.assign(
      button.style,
      {
        border:
          item.code ===
          currentLocale
            ? '1px solid #66efff'
            : '1px solid rgba(120,200,215,.18)',
        borderRadius: '9px',
        background:
          item.code ===
          currentLocale
            ? 'rgba(52,221,240,.14)'
            : 'rgba(255,255,255,.035)',
        color: '#e9feff',
        padding: '8px',
        cursor: 'pointer',
      } as CSSStyleDeclaration,
    );

    button.addEventListener(
      'click',
      () => {
        closePopover();

        void applyLocale(
          item.code,
        );
      },
    );

    popover.appendChild(
      button,
    );
  }

  (
    selectorRoot ??
    document.body
  ).appendChild(
    popover,
  );
}

function updateSelectorLabel():
  void {
  const anchor =
    selectorRoot
      ?.querySelector(
        '[data-amoh-i18n-anchor]',
      ) as HTMLElement | null;

  if (anchor) {
    const label =
      LOCALES.find(
        (item) =>
          item.code ===
          currentLocale,
      )?.label ??
      currentLocale;

    anchor.textContent =
      label;
  }
}

function installSelector():
  void {
  if (
    selectorRoot ||
    !document.body
  ) {
    return;
  }

  selectorRoot =
    document.createElement(
      'div',
    );

  selectorRoot.setAttribute(
    'data-amoh-i18n-ui',
    '1',
  );

  selectorRoot.style.display =
    'contents';

  document.body.appendChild(
    selectorRoot,
  );

  const existing =
    findExistingLanguageButton();

  let anchor:
    HTMLElement;

  if (existing) {
    anchor =
      existing;

    anchor.setAttribute(
      'data-amoh-i18n-anchor',
      '1',
    );
  } else {
    const button =
      document.createElement(
        'button',
      );

    button.type =
      'button';

    button.setAttribute(
      'data-amoh-i18n-anchor',
      '1',
    );

    Object.assign(
      button.style,
      {
        position: 'fixed',
        top: '14px',
        right: '78px',
        zIndex: '2147482000',
        border:
          '1px solid rgba(64,220,239,.28)',
        borderRadius: '999px',
        background:
          'rgba(2,18,28,.92)',
        color: '#e9feff',
        padding: '8px 12px',
        cursor: 'pointer',
      } as CSSStyleDeclaration,
    );

    selectorRoot.appendChild(
      button,
    );

    anchor =
      button;
  }

  anchor.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPopover(
        anchor,
      );
    },
    true,
  );

  updateSelectorLabel();
}

export function installGlobalI18nResumeV11():
  void {
  const start =
    () => {
      installSelector();

      void applyLocale(
        currentLocale,
      );

      observer?.disconnect();

      observer =
        new MutationObserver(
          (mutations) => {
            void loadCatalog(
              currentLocale,
            ).then(
              (catalog) => {
                for (
                  const mutation of mutations
                ) {
                  for (
                    const added of
                      Array.from(
                        mutation.addedNodes,
                      )
                  ) {
                    if (
                      currentLocale !==
                      'es'
                    ) {
                      walk(
                        added,
                        catalog,
                      );
                    }
                  }

                  if (
                    mutation.type ===
                    'attributes' &&
                    mutation.target
                      instanceof
                      Element &&
                    currentLocale !==
                      'es'
                  ) {
                    applyToElementAttrs(
                      mutation.target,
                      catalog,
                    );
                  }
                }
              },
            );
          },
        );

      observer.observe(
        document.body,
        {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: [
            'placeholder',
            'aria-label',
            'title',
            'alt',
          ],
        },
      );

      (
        window as any
      ).__amohGlobalI18nV11 = {
        getLocale:
          () =>
            currentLocale,
        setLocale:
          (
            locale: Locale,
          ) =>
            applyLocale(
              locale,
            ),
        locales:
          LOCALES.map(
            (item) =>
              item.code,
          ),
        reload:
          () =>
            applyLocale(
              currentLocale,
            ),
      };
    };

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      start,
      {
        once: true,
      },
    );
  } else {
    start();
  }
}
