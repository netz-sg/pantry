'use client';

import { useLocale, useTranslations } from 'next-intl';
import { CircleCheck } from 'lucide-react';
import { Pill } from '@/components/ui/status';
import { formatQuantity, type Locale } from '@/lib/units';
import { cn } from '@/lib/utils';
import { groupIngredients, scaleStatus, type ViewIngredient } from './types';

/** Zutaten gruppiert, mit skalierten Mengen und Vorratsstatus. */
export function IngredientList({
  ingredients,
  factor,
  showStatus = true,
  large,
}: {
  ingredients: ViewIngredient[];
  factor: number;
  showStatus?: boolean;
  large?: boolean;
}) {
  const t = useTranslations('recipes.detail');
  const locale = useLocale() as Locale;
  const groups = groupIngredients(ingredients);

  return (
    <div className="grid gap-4">
      {groups.map((g, gi) => (
        <div key={`${g.name ?? ''}-${gi}`}>
          {g.name ? <h3 className="mb-1.5 px-1 text-footnote font-semibold text-label-2">{g.name}</h3> : null}
          <ul className="overflow-hidden border-y border-separator">
            {g.items.map((i) => {
              const s = scaleStatus(i, factor);
              const qty = formatQuantity(i.amount == null ? null : i.amount * factor, i.unit, locale);
              return (
                <li
                  key={i.id}
                  className={cn(
                    'relative flex items-center gap-3 px-1 py-2.5',
                    'before:absolute before:top-0 before:right-0 before:left-1 before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden',
                    large ? 'min-h-[3.75rem] text-title-2' : 'min-h-[3.25rem]',
                  )}
                >
                  <span
                    className={cn(
                      'tabular shrink-0 font-semibold',
                      large ? 'w-28' : 'w-[76px] text-[0.97rem]',
                    )}
                  >
                    {qty}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className={large ? '' : 'text-body'}>{i.name}</span>
                    {i.optional ? (
                      <span className="ml-1.5 text-footnote text-label-2">{t('optional')}</span>
                    ) : null}
                    {i.note ? (
                      <span
                        className={cn('mt-0.5 block text-label-2', large ? 'text-callout' : 'text-footnote')}
                      >
                        {i.note}
                      </span>
                    ) : null}
                  </span>
                  {showStatus ? (
                    <StatusMark status={s.status} missing={s.missingAmount} unit={i.unit} locale={locale} />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function StatusMark({
  status,
  missing,
  unit,
  locale,
}: {
  status: ViewIngredient['status'];
  missing: number | null;
  unit: string | null;
  locale: Locale;
}) {
  const t = useTranslations('recipes.detail');
  if (status === 'ok') {
    return (
      <span className="shrink-0 text-green print:hidden">
        <CircleCheck className="size-[22px]" aria-hidden />
        <span className="sr-only">{t('have')}</span>
      </span>
    );
  }
  if (status === 'missing')
    return (
      <Pill tone="warn" className="shrink-0 print:hidden">
        {t('missing')}
      </Pill>
    );
  if (status === 'partial') {
    return (
      <Pill tone="warn" className="shrink-0 print:hidden">
        {missing != null
          ? t('missingAmount', { amount: formatQuantity(missing, unit, locale) })
          : t('missing')}
      </Pill>
    );
  }
  return <span className="shrink-0 text-footnote text-label-3 print:hidden">{t('notInPantry')}</span>;
}
