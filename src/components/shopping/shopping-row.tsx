'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Info } from 'lucide-react';
import { useId } from 'react';
import { formatQuantity, type Locale } from '@/lib/units';
import { cn } from '@/lib/utils';
import { rowSeparator, type ShopItem } from './types';

/** Zeile wie in Erinnerungen. Die ganze Zeile hakt ab, Rezept und Info liegen darüber. */
export function ShoppingRow({
  item,
  locale,
  onToggle,
  onEdit,
}: {
  item: ShopItem;
  locale: Locale;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const t = useTranslations('shopping');
  const id = useId();
  const qty = formatQuantity(item.quantity, item.unit, locale);
  return (
    <div
      className={cn(
        'group/row relative flex min-h-[3.25rem] items-start gap-3 py-2.5 pr-1 pl-4 transition-colors active:bg-fill',
        rowSeparator,
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        aria-labelledby={`${id}-name`}
        aria-describedby={qty ? `${id}-qty` : undefined}
        onClick={onToggle}
        className={cn(
          'mt-px grid size-[23px] shrink-0 place-items-center rounded-full border-[1.6px] transition-[background,border-color,transform] duration-200 outline-none active:scale-90',
          "after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-3 focus-visible:after:-outline-offset-3 focus-visible:after:outline-blue",
          item.checked ? 'border-tint bg-tint text-on-tint' : 'border-label-3 text-transparent',
        )}
      >
        <Check
          className={cn(
            'size-[15px] transition-[transform,opacity] duration-200',
            item.checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
          strokeWidth={3}
          aria-hidden
        />
      </button>
      <div className="min-w-0 flex-1">
        <span
          id={`${id}-name`}
          className={cn(
            'block text-body leading-tight break-words transition-colors',
            item.checked && 'text-label-2',
          )}
        >
          {item.name}
        </span>
        {item.recipeId && item.recipeTitle ? (
          <Link
            href={`/recipes/${item.recipeId}`}
            className="relative z-10 block max-w-full truncate text-footnote text-label-2 underline-offset-2 hover:text-tint hover:underline"
          >
            {t('forRecipe', { title: item.recipeTitle })}
          </Link>
        ) : null}
        {item.note ? <span className="block truncate text-footnote text-label-2">{item.note}</span> : null}
      </div>
      {qty ? (
        <span id={`${id}-qty`} className="tabular mt-px shrink-0 text-subhead text-label-2">
          {qty}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onEdit}
        aria-label={t('editLabel', { name: item.name })}
        className="relative z-10 -my-2.5 grid size-11 shrink-0 place-items-center rounded-full text-label-3 transition-colors hover:text-tint focus-visible:text-tint"
      >
        <Info className="size-[19px]" aria-hidden />
      </button>
    </div>
  );
}
