import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { isLocale, LOCALE_COOKIE, localeFromAcceptLanguage, NAMESPACES, type AppLocale } from './config';

export async function resolveLocale(): Promise<AppLocale> {
  const c = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(c)) return c;
  return localeFromAcceptLanguage((await headers()).get('accept-language'));
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  const entries = await Promise.all(
    NAMESPACES.map(
      async (ns) => [ns, (await import(`../../messages/${locale}/${ns}.json`)).default] as const,
    ),
  );
  return {
    locale,
    messages: Object.fromEntries(entries),
    timeZone: process.env.TZ || 'Europe/Berlin',
    onError: (e) => {
      if (process.env.NODE_ENV !== 'production') console.warn(e.message);
    },
    getMessageFallback: ({ key, namespace }) => `${namespace ? namespace + '.' : ''}${key}`,
  };
});
