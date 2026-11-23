// OLEA i18n V20 — wraps React's dev JSX runtime for app sources (see vite.config.ts).
import * as runtime from 'react/jsx-dev-runtime';
import { localizeProps } from './localize-props';

type JsxDevFn = (
  type: unknown,
  props: unknown,
  key: unknown,
  isStatic: boolean,
  source?: unknown,
  self?: unknown,
) => unknown;
const base = runtime as unknown as { jsxDEV: JsxDevFn; Fragment: unknown };

export const Fragment = base.Fragment;
export function jsxDEV(
  type: unknown,
  props: unknown,
  key: unknown,
  isStatic: boolean,
  source?: unknown,
  self?: unknown,
) {
  return base.jsxDEV(type, localizeProps(type, props as Record<string, unknown>), key, isStatic, source, self);
}
