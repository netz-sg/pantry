'use client';

import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Plus-Minus-Regler wie in iOS. */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  label,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  format?: (v: number) => string;
}) {
  const t = useTranslations('common.actions');
  return (
    <div className="flex items-center overflow-hidden rounded-[10px] bg-fill" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={t('decrease', { label })}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
        className="grid h-9 w-11 place-items-center disabled:opacity-35"
      >
        <Minus className="size-4" />
      </button>
      <span className="tabular min-w-9 text-center text-callout font-semibold" aria-live="polite">
        {format ? format(value) : value}
      </span>
      <button
        type="button"
        aria-label={t('increase', { label })}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))}
        className="grid h-9 w-11 place-items-center border-l border-separator disabled:opacity-35"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
