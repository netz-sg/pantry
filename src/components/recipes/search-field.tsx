'use client';

import { useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Suchfeld, das die Suche in die Adresse schreibt. Funktioniert auch ohne JavaScript als Formular. */
export function SearchField({ initial, className }: { initial: string; className?: string }) {
  const t = useTranslations('recipes.search');
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(initial);
  const [prev, setPrev] = useState(initial);
  const [pushed, setPushed] = useState(initial);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Von außen geänderte Suche übernehmen, z. B. nach „Filter zurücksetzen“
  if (initial !== prev) {
    setPrev(initial);
    if (initial !== pushed) setValue(initial);
  }

  const push = (v: string) => {
    const q = v.trim();
    setPushed(q);
    const p = new URLSearchParams(sp.toString());
    if (q) p.set('q', q);
    else p.delete('q');
    const qs = p.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const onChange = (v: string) => {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(v), 300);
  };

  return (
    <form
      role="search"
      action={pathname}
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        push(value);
      }}
      className={cn('relative', className)}
    >
      <label htmlFor="recipe-search" className="sr-only">
        {t('label')}
      </label>
      <Search
        className={cn(
          'pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-label-2',
          pending && 'animate-pulse',
        )}
        aria-hidden
      />
      <input
        id="recipe-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('placeholder')}
        autoComplete="off"
        enterKeyHint="search"
        className="h-11 w-full rounded-[12px] bg-fill pr-11 pl-10 text-body outline-none placeholder:text-label-2 focus:ring-2 focus:ring-tint/50 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('clear')}
          className="absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center text-label-2"
        >
          <span className="grid size-[18px] place-items-center rounded-full bg-label-3 text-surface">
            <X className="size-3" strokeWidth={3} />
          </span>
        </button>
      ) : null}
    </form>
  );
}
