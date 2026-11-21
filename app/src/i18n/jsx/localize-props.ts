/**
 * Render-time localisation of element props (OLEA i18n V20).
 * Called by the app's JSX runtime wrapper for every element created in /src.
 * Only display text is touched: string children and the title / placeholder /
 * aria-label / alt attributes. Ids, keys, values, classNames and data are never changed.
 */
import { isTranslating, translateString } from '../olea-i18n';

const SKIP_TYPES = new Set(['style', 'script', 'code', 'pre', 'textarea', 'kbd', 'samp']);
const TEXT_ATTRS = ['title', 'placeholder', 'aria-label', 'alt'] as const;

type Props = Record<string, unknown> | null | undefined;

function localizeChildren(children: unknown): unknown {
  if (typeof children === 'string') return translateString(children);
  if (Array.isArray(children)) {
    let out: unknown[] | null = null;
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (typeof c === 'string') {
        const t = translateString(c);
        if (t !== c) {
          if (!out) out = children.slice();
          out[i] = t;
        }
      }
    }
    return out ?? children;
  }
  return children;
}

export function localizeProps(type: unknown, props: Props): Props {
  if (!props || !isTranslating()) return props;
  if (typeof type === 'string' && SKIP_TYPES.has(type)) return props;
  if (props.translate === 'no' || props['data-i18n'] === 'off') return props;

  let next: Record<string, unknown> | null = null;
  const children = props.children;
  if (children !== undefined && children !== null) {
    const loc = localizeChildren(children);
    if (loc !== children) {
      next = { ...props };
      next.children = loc;
    }
  }
  for (const attr of TEXT_ATTRS) {
    const v = props[attr];
    if (typeof v === 'string') {
      const t = translateString(v);
      if (t !== v) {
        if (!next) next = { ...props };
        next[attr] = t;
      }
    }
  }
  return next ?? props;
}
