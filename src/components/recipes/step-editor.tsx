'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Plus, Timer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StepRow } from './form-state';

type Update = (fn: (rows: StepRow[]) => StepRow[]) => void;

/** Schritte der Zubereitung mit optionalem Timer in Minuten. */
export function StepEditor({
  rows,
  setRows,
  nextKey,
  error,
}: {
  rows: StepRow[];
  setRows: Update;
  nextKey: () => string;
  error?: string;
}) {
  const t = useTranslations('recipes.form');
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const update = (key: string, patch: Partial<StepRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (i: number, dir: -1 | 1) =>
    setRows((rs) => {
      const j = i + dir;
      if (j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  const add = () => {
    const key = nextKey();
    setRows((rs) => [...rs, { key, text: '', minutes: '' }]);
    setFocusKey(key);
  };

  return (
    <div>
      {rows.length ? (
        <ol className="grid gap-2.5">
          {rows.map((r, i) => {
            const n = i + 1;
            return (
              <li
                key={r.key}
                className="grid grid-cols-[30px_1fr] gap-2.5 rounded-[18px] bg-surface p-3 shadow-elevated"
              >
                <span
                  className="mt-2.5 grid size-[26px] place-items-center rounded-full bg-tint text-footnote font-bold text-on-tint"
                  aria-hidden
                >
                  {n}
                </span>
                <div className="grid min-w-0 gap-2">
                  <label htmlFor={`step-${r.key}`} className="sr-only">
                    {t('stepN', { n })}
                  </label>
                  <textarea
                    id={`step-${r.key}`}
                    value={r.text}
                    autoFocus={r.key === focusKey}
                    onChange={(e) => update(r.key, { text: e.target.value })}
                    placeholder={t('stepPlaceholder')}
                    maxLength={4000}
                    rows={3}
                    className="min-h-20 w-full resize-y rounded-[10px] bg-fill px-3 py-2.5 text-body leading-snug text-label outline-none placeholder:text-label-3 focus:ring-2 focus:ring-tint/50"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <label className="flex h-11 items-center gap-2 rounded-[10px] bg-fill pr-1 pl-3 text-subhead text-label-2 focus-within:ring-2 focus-within:ring-tint/50">
                      <Timer className="size-4 text-tint" aria-hidden />
                      <span className="sr-only">{t('timerFor', { n })}</span>
                      <input
                        value={r.minutes}
                        onChange={(e) => update(r.key, { minutes: e.target.value })}
                        inputMode="decimal"
                        placeholder={t('stepTimer')}
                        className="tabular h-10 w-36 bg-transparent text-body text-label outline-none placeholder:text-label-3"
                      />
                    </label>
                    <span className="flex-1" />
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={t('stepMoveUp', { n })}
                      className="grid size-11 place-items-center rounded-full text-label-2 hover:bg-fill disabled:opacity-35"
                    >
                      <ChevronUp className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === rows.length - 1}
                      aria-label={t('stepMoveDown', { n })}
                      className="grid size-11 place-items-center rounded-full text-label-2 hover:bg-fill disabled:opacity-35"
                    >
                      <ChevronDown className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                      aria-label={t('stepRemove', { n })}
                      className="grid size-11 place-items-center rounded-full text-label-2 hover:bg-red-soft hover:text-red"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
      {error ? (
        <p className="mt-1.5 px-1 text-footnote text-red" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="button" variant="tinted" onClick={add} className="mt-2.5">
        <Plus /> {t('addStep')}
      </Button>
    </div>
  );
}
