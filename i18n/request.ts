import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
    // Get locale from cookie, fallback to default
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value as Locale | undefined;
    const locale = localeCookie && locales.includes(localeCookie) ? localeCookie : defaultLocale;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
