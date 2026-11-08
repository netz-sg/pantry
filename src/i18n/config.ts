export const LOCALES = ['de', 'en', 'zh'] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'de';
export const LOCALE_COOKIE = 'pantry.locale';
export const NAMESPACES = [
  'common',
  'auth',
  'today',
  'recipes',
  'plan',
  'shopping',
  'pantry',
  'settings',
] as const;

export function isLocale(v: unknown): v is AppLocale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

export function localeFromAcceptLanguage(header: string | null): AppLocale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(',')) {
    const tag = part.split(';')[0]!.trim().slice(0, 2).toLowerCase();
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

export const INTL_LOCALE: Record<AppLocale, string> = { de: 'de-DE', en: 'en-GB', zh: 'zh-CN' };
