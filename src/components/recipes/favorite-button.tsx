'use client';

import { useOptimistic, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { callAction } from '@/lib/action-client';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/server/actions/recipes';

/** Herz als Glas-Knopf. Schaltet sofort um und gleicht danach mit dem Server ab. */
export function FavoriteButton({
  id,
  value,
  size = 'sm',
  className,
}: {
  id: string;
  value: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const t = useTranslations('recipes.favorite');
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [, startTransition] = useTransition();

  const toggle = () => {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      await callAction(toggleFavorite(id, next));
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimistic}
      aria-label={optimistic ? t('remove') : t('add')}
      className={cn(
        'no-print glass-dark relative grid place-items-center rounded-full transition-transform active:scale-90',
        "before:absolute before:-inset-1 before:content-['']",
        size === 'lg' ? 'size-10' : 'size-8',
        className,
      )}
    >
      <Heart
        className={cn(
          size === 'lg' ? 'size-5' : 'size-[17px]',
          optimistic && 'fill-[#ff8a6b] text-[#ff8a6b]',
        )}
        strokeWidth={2.2}
      />
    </button>
  );
}
