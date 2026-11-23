// OLEA i18n V20 — wraps React's automatic JSX runtime for app sources (see vite.config.ts).
import * as runtime from 'react/jsx-runtime';
import { localizeProps } from './localize-props';

type JsxFn = (type: unknown, props: unknown, key?: unknown) => unknown;
const base = runtime as unknown as { jsx: JsxFn; jsxs: JsxFn; Fragment: unknown };

export const Fragment = base.Fragment;
export function jsx(type: unknown, props: unknown, key?: unknown) {
  return base.jsx(type, localizeProps(type, props as Record<string, unknown>), key);
}
export function jsxs(type: unknown, props: unknown, key?: unknown) {
  return base.jsxs(type, localizeProps(type, props as Record<string, unknown>), key);
}
