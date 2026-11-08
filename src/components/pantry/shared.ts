import type { Locale } from '@/lib/units';
import { UNITS, unitLabel } from '@/lib/units';
import type { Result } from '@/server/lib/errors';

/** Locale von next-intl auf die Locale der Einheiten abbilden. */
export function unitLocale(l: string): Locale {
  return l === 'en' || l === 'zh' ? l : 'de';
}

/** Einheiten für ein Select, eine unbekannte eigene Einheit bleibt erhalten. */
export function unitOptions(locale: Locale, current?: string | null) {
  const opts = UNITS.map((u) => ({ value: u.code, label: unitLabel(u.code, locale) }));
  if (current && !UNITS.some((u) => u.code === current)) opts.push({ value: current, label: current });
  return opts;
}

/** Feldfehler aus einem Action-Ergebnis. */
export function fieldErrors<T>(res: Result<T>): Record<string, string[]> {
  return res.ok ? {} : (res.error.fieldErrors ?? {});
}

/** Text aus einem Zahlenfeld, Komma erlaubt. Leer wird null. */
export function parseNum(v: string): number | null {
  const t = v.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
