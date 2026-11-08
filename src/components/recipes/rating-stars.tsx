'use client';

import { useOptimistic, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { callAction } from '@/lib/action-client';
import { cn } from '@/lib/utils';
import { rateRecipe } from '@/server/actions/recipes';

/** Bewertung von 1 bis 5 Sternen. Noch einmal auf denselben Stern tippen nimmt sie zurück. */
export function RatingStars({ id, value }: { id: string; value: number | null }) {
  const t = useTranslations('recipes.detail');
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [, startTransition] = useTransition();

  const set = (n: number) => {
    const next = optimistic === n ? null : n;
    startTransition(async () => {
      setOptimistic(next);
      await callAction(rateRecipe(id, next));
    });
  };

  return (
    <div role="group" aria-label={t('rating')} className="-ml-2 flex items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => set(n)}
          aria-pressed={optimistic === n}
          aria-label={t('rate', { count: n })}
          className="grid size-11 place-items-center text-tint print:size-6"
        >
          <Star
            className={cn(
              'size-6 transition-transform active:scale-90',
              optimistic != null && n <= optimistic ? 'fill-current' : 'text-label-3',
            )}
            strokeWidth={1.8}
          />
        </button>
      ))}
    </div>
  );
}
