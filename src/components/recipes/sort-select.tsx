'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpDown } from 'lucide-react';

const SORTS = ['recent', 'title', 'time', 'cooked'] as const;

/** Auswahl der Sortierung. Der Wert steht in der Adresse. */
export function SortSelect({ value }: { value: string }) {
  const t = useTranslations('recipes.sort');
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const change = (v: string) => {
    const p = new URLSearchParams(sp.toString());
    if (v === 'recent') p.delete('sort');
    else p.set('sort', v);
    const qs = p.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  return (
    <div className="relative">
      <label htmlFor="recipe-sort" className="sr-only">
        {t('label')}
      </label>
      <ArrowUpDown
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tint"
        aria-hidden
      />
      <select
        id="recipe-sort"
        value={value}
        onChange={(e) => change(e.target.value)}
        className="h-11 appearance-none rounded-[12px] bg-fill pr-4 pl-9 text-subhead font-semibold text-label outline-none focus:ring-2 focus:ring-tint/50 max-sm:w-11 max-sm:pr-0 max-sm:text-transparent"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {t(s)}
          </option>
        ))}
      </select>
    </div>
  );
}
