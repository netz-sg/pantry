import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { CommandPalette } from './command-palette';
import { TopNav } from './top-nav';
import { TabBar } from './tab-bar';

export async function AppShell({
  user,
  children,
}: {
  user: { name: string; image?: string | null };
  children: ReactNode;
}) {
  const t = await getTranslations('common.nav');
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-full focus:bg-raised focus:px-4 focus:py-2 focus:shadow-glass"
      >
        {t('skip')}
      </a>
      <TopNav user={user} />
      <main id="main" className="min-h-dvh overflow-x-clip pb-32 md:pb-20 print:!p-0">
        <div className="mx-auto w-full max-w-[1360px]">{children}</div>
      </main>
      <TabBar />
      <CommandPalette />
    </>
  );
}
