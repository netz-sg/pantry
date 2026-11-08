'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { useId } from 'react';
import { Ring } from '@/components/ui/ring';
import { daysUntil } from '@/lib/dates';
import { formatQuantity, type Locale } from '@/lib/units';
import { cn } from '@/lib/utils';
import { ringColor, stepFor, type PantryEntry } from './types';

type Tone = 'bad' | 'warn' | 'neutral';

/** Ablauf als kurzer Text wie „morgen“ oder „seit gestern“, sonst ein Datum. */
export function useExpiryText(todayKey: string) {
  const t = useTranslations('pantry');
  const f = useFormatter();
  return (p: PantryEntry): { text: string; tone: Tone } | null => {
    if (p.expiresOn && p.expiry !== 'ok') {
      const d = daysUntil(p.expiresOn, todayKey);
      if (d < -1) return { text: t('expiry.expiredDays', { count: -d }), tone: 'bad' };
      if (d === -1) return { text: t('expiry.expiredYesterday'), tone: 'bad' };
      if (d === 0) return { text: t('expiry.today'), tone: 'bad' };
      if (d === 1) return { text: t('expiry.tomorrow'), tone: 'bad' };
      return { text: t('expiry.inDays', { count: d }), tone: 'warn' };
    }
    if (p.quantity <= 0) return { text: t('expiry.empty'), tone: 'warn' };
    if (p.low) return { text: t('expiry.low'), tone: 'warn' };
    if (p.expiresOn) {
      // Mittag in UTC, damit das Datum in keiner Zeitzone springt
      const date = new Date(`${p.expiresOn}T12:00:00Z`);
      const sameYear = p.expiresOn.slice(0, 4) === todayKey.slice(0, 4);
      const text = sameYear
        ? f.dateTime(date, { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
        : f.dateTime(date, { month: '2-digit', year: 'numeric', timeZone: 'UTC' });
      return { text, tone: 'neutral' };
    }
    return null;
  };
}

const toneClass: Record<Tone, string> = {
  bad: 'text-red font-semibold',
  warn: 'text-orange font-semibold',
  neutral: 'text-label-2',
};

export function PantryRow({
  item,
  locale,
  showLocation,
  expiry,
  onEdit,
  onAdjust,
}: {
  item: PantryEntry;
  locale: Locale;
  showLocation: boolean;
  expiry: { text: string; tone: Tone } | null;
  onEdit: () => void;
  onAdjust: (delta: number) => void;
}) {
  const t = useTranslations('pantry');
  const id = useId();
  const qty = formatQuantity(item.quantity, item.unit, locale);
  const step = stepFor(item.unit, item.quantity);
  const sub = [showLocation ? item.locationName : null, qty].filter(Boolean).join(', ');
  return (
    <div
      className={cn(
        'relative flex min-h-[3.25rem] items-center gap-3 py-2 pr-2 pl-4 transition-colors hover:bg-fill/50 active:bg-fill md:pr-3',
        'before:absolute before:top-0 before:right-0 before:left-[3.75rem] before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden',
      )}
    >
      <Ring value={item.level} size={34} stroke={5} color={ringColor(item)} />
      <button
        type="button"
        onClick={onEdit}
        aria-describedby={expiry ? `${id}-exp` : undefined}
        className="min-w-0 flex-1 text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-3 focus-visible:after:-outline-offset-3 focus-visible:after:outline-blue"
      >
        <span className="block truncate text-body leading-tight">{item.name}</span>
        {sub ? <span className="tabular mt-0.5 block truncate text-footnote text-label-2">{sub}</span> : null}
      </button>
      {expiry ? (
        <span id={`${id}-exp`} className={cn('tabular shrink-0 text-subhead', toneClass[expiry.tone])}>
          {expiry.text}
        </span>
      ) : null}
      <div className="relative z-10 hidden items-center md:flex" role="group" aria-label={t('stepper')}>
        <button
          type="button"
          onClick={() => onAdjust(-Math.min(step, item.quantity))}
          disabled={item.quantity <= 0}
          aria-label={t('decrease', { name: item.name })}
          className="grid size-11 place-items-center rounded-full text-label-2 transition-colors hover:text-tint disabled:opacity-35"
        >
          <span className="grid size-8 place-items-center rounded-full bg-fill">
            <Minus className="size-4" aria-hidden />
          </span>
        </button>
        <button
          type="button"
          onClick={() => onAdjust(step)}
          aria-label={t('increase', { name: item.name })}
          className="grid size-11 place-items-center rounded-full text-label-2 transition-colors hover:text-tint"
        >
          <span className="grid size-8 place-items-center rounded-full bg-fill">
            <Plus className="size-4" aria-hidden />
          </span>
        </button>
      </div>
    </div>
  );
}
