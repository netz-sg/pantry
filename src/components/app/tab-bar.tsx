'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV } from './nav-items';
import { openCommandPalette } from './command-palette';
import { useScrollNav } from './use-scroll-nav';

/** Schwebende Glas-Tableiste mit Suchknopf, wie in iOS 26. Nur unter 768 Pixel. */
export function TabBar() {
  const t = useTranslations('common.nav');
  const pathname = usePathname();
  // Sobald gescrollt wird, wird die Leiste schmaler und zeigt nur Symbole, ganz oben wieder alles
  const { scrolled: compact } = useScrollNav();
  // Auf Detail- und Bearbeiten-Seiten von Rezepten übernimmt die Aktionsleiste unten, wie bei iOS
  if (/^\/recipes\/[^/]+/.test(pathname)) return null;
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 flex items-end gap-2 px-3 pb-[max(env(safe-area-inset-bottom),12px)] md:hidden">
      <nav
        aria-label={t('tabs')}
        className="glass-pill grid h-[62px] flex-1 grid-cols-5 rounded-full p-[5px] shadow-glass"
      >
        {NAV.map((n) => {
          const active = n.match(pathname);
          return (
            <Link
              key={n.key}
              href={n.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'grid place-items-center content-center gap-0.5 rounded-full text-[10px] font-semibold tracking-normal transition-colors',
                active ? 'bg-ink text-on-ink' : 'text-label/70',
              )}
            >
              <n.icon className="size-[21px]" strokeWidth={active ? 2.3 : 1.9} />
              <span
                className={cn(
                  'overflow-hidden transition-[max-height,opacity] duration-500',
                  compact ? 'max-h-0 opacity-0' : 'max-h-4 opacity-100',
                )}
              >
                {t(n.key)}
              </span>
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={openCommandPalette}
        aria-label={t('search')}
        className={cn(
          'glass-pill press grid shrink-0 place-items-center rounded-full text-label shadow-glass transition-[width,height] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          compact ? 'size-[50px]' : 'size-[62px]',
        )}
      >
        <Search className="size-[22px]" />
      </button>
    </div>
  );
}
