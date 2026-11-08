'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV } from './nav-items';
import { openCommandPalette } from './command-palette';
import { Avatar } from './avatar';
import { useScrollNav } from './use-scroll-nav';

/** Schwebende Navigation oben, ab 768 Pixel. Bleibt immer sichtbar und rückt beim Scrollen zusammen. */
export function TopNav({ user }: { user: { name: string; image?: string | null } }) {
  const t = useTranslations('common.nav');
  const tc = useTranslations('common.search');
  const pathname = usePathname();
  const { scrolled, away } = useScrollNav();
  // Der Kochmodus bekommt den ganzen Bildschirm
  if (/^\/recipes\/[^/]+\/cook/.test(pathname)) return null;
  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        'group no-print pointer-events-none fixed inset-x-0 top-0 z-40 hidden px-6 transition-[padding,transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:translate-y-0 focus-within:opacity-100 md:block',
        scrolled ? 'py-2.5' : 'py-4',
        // Weiter unten gleitet sie beim Runterscrollen weg, mit Tastaturfokus bleibt sie da
        away && '-translate-y-[130%] opacity-0',
      )}
    >
      {/*
        Oben stehen Logo, Menü und Knöpfe weit verteilt über die ganze Breite.
        Beim Scrollen bleibt alles sichtbar, wird kleiner und rückt zur Mitte zusammen.
      */}
      <div
        className={cn(
          'mx-auto flex items-center justify-between gap-3 transition-[max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          scrolled ? 'max-w-[880px]' : 'max-w-[100%]',
        )}
      >
        <Link
          href="/"
          className={cn(
            'glass-pill pointer-events-auto flex items-center rounded-full font-extrabold tracking-[-0.04em] text-label shadow-glass transition-[height,padding,font-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            scrolled ? 'h-9 px-3.5 text-[1.02rem]' : 'h-10 px-4 text-[1.2rem]',
          )}
        >
          pantry
        </Link>
        <nav
          aria-label={t('main')}
          className={cn(
            'glass-pill pointer-events-auto flex items-center gap-0.5 rounded-full font-medium shadow-glass transition-[padding,font-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            scrolled ? 'p-[3px] text-[0.84rem]' : 'p-1 text-subhead',
          )}
        >
          {NAV.map((n) => {
            const active = n.match(pathname);
            return (
              <Link
                key={n.key}
                href={n.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full transition-[padding,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  scrolled ? 'px-3 py-1.5' : 'px-4 py-2',
                  active ? 'bg-ink text-on-ink' : 'text-label/75 hover:text-label',
                )}
              >
                {n.key === 'plan' ? t('planLong') : t(n.key)}
              </Link>
            );
          })}
        </nav>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label={t('search')}
            title={`${t('search')} ${tc('shortcut')}`}
            className={cn(
              'glass-pill grid place-items-center rounded-full text-label shadow-glass transition-[width,height,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-fill-strong',
              scrolled ? 'size-9' : 'size-10',
            )}
          >
            <Search className="size-[18px]" />
          </button>
          <Link
            href="/settings"
            aria-label={t('settings')}
            aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
            className={cn(
              'origin-center rounded-full ring-offset-2 ring-offset-bg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] aria-[current=page]:ring-2 aria-[current=page]:ring-tint',
              scrolled && 'scale-90',
            )}
          >
            <Avatar name={user.name} image={user.image} size={40} />
          </Link>
        </div>
      </div>
    </header>
  );
}
