import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ServiceWorker } from '@/components/app/service-worker';
import { Toaster } from '@/components/ui/toaster';
import { getSessionUser } from '@/server/lib/session';
import './globals.css';

// Hausschrift Onest, kräftig für Titel, ruhig für Text
const onest = Onest({ subsets: ['latin'], variable: '--font-onest', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Pantry', template: '%s | Pantry' },
  description: 'Rezepte, Wochenplan, Einkaufsliste und Vorrat an einem Ort.',
  applicationName: 'Pantry',
  appleWebApp: { capable: true, title: 'Pantry', statusBarStyle: 'black-translucent' },
  icons: { apple: '/icons/apple-touch-icon.png' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#080808' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const user = await getSessionUser();
  const theme = user?.theme === 'light' || user?.theme === 'dark' ? user.theme : undefined;
  return (
    <html lang={locale} data-theme={theme} className={onest.variable} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          {children}
          <Toaster />
          <ServiceWorker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
