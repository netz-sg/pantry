'use client';

import { useEffect, useRef, useState, type TouchEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ListChecks, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { callAction } from '@/lib/action-client';
import { formatQuantity, type Locale } from '@/lib/units';
import { cn } from '@/lib/utils';
import { finishCooking } from '@/server/actions/recipes';
import { CookedSheet } from './cooked-sheet';
import { IngredientList } from './ingredient-list';
import { TimerButton, TimerTray } from './timers';
import type { ViewIngredient, ViewStep } from './types';

/** Zutaten, die im Text eines Schritts vorkommen. */
function ingredientsInStep(text: string, list: ViewIngredient[]) {
  const lower = text.toLowerCase();
  return list.filter((i) => {
    const name = i.name.toLowerCase().trim();
    if (name.length >= 3 && lower.includes(name)) return true;
    const first = name.split(/[\s,]+/)[0] ?? '';
    return first.length >= 4 && lower.includes(first);
  });
}

/** Vollbild zum Kochen. Ein Schritt pro Ansicht, Timer, Bildschirm bleibt an. */
export function CookMode({
  id,
  title,
  baseServings,
  servings,
  entry,
  ingredients,
  steps,
}: {
  id: string;
  title: string;
  baseServings: number;
  servings: number;
  entry: string | null;
  ingredients: ViewIngredient[];
  steps: ViewStep[];
}) {
  const t = useTranslations('recipes.cook');
  const tt = useTranslations('recipes.timer');
  const locale = useLocale() as Locale;
  const [index, setIndex] = useState(0);
  const [ingOpen, setIngOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [awake, setAwake] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const factor = servings / baseServings;
  const total = Math.max(steps.length, 1);
  const last = index >= total - 1;
  const step = steps[index];
  const used = step ? ingredientsInStep(step.text, ingredients) : [];

  const go = (dir: -1 | 1) => setIndex((i) => Math.min(Math.max(i + dir, 0), total - 1));

  // Pfeiltasten blättern, außer in Eingabefeldern oder offenen Dialogen
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, total - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  // Bildschirm wach halten, nach dem Zurückkehren in den Tab neu anfordern
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let stopped = false;
    const request = async () => {
      try {
        if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
        const l = await navigator.wakeLock.request('screen');
        if (stopped) {
          void l.release();
          return;
        }
        lock = l;
        setAwake(true);
        l.addEventListener('release', () => setAwake(false));
      } catch {
        /* nicht erlaubt oder nicht unterstützt, dann eben ohne */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request();
    };
    void request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    const p = e.touches[0];
    touch.current = p ? { x: p.clientX, y: p.clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    const p = e.changedTouches[0];
    touch.current = null;
    if (!start || !p) return;
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg pt-[max(env(safe-area-inset-top),12px)]">
      <header className="flex items-center gap-3 px-5 md:px-12">
        <Link
          href={`/recipes/${id}`}
          aria-label={t('close')}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-fill text-label hover:bg-fill-strong"
        >
          <X className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-footnote font-semibold text-label-2">{title}</p>
          <div
            className="mt-1.5 flex gap-1"
            role="progressbar"
            aria-label={t('progress', { current: index + 1, total })}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={index + 1}
            aria-valuetext={t('progress', { current: index + 1, total })}
          >
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i <= index ? 'bg-tint' : 'bg-fill-strong',
                )}
              />
            ))}
          </div>
        </div>
        <Button variant="secondary" onClick={() => setIngOpen(true)} className="h-11 shrink-0">
          <ListChecks /> <span className="max-sm:sr-only">{t('ingredients')}</span>
        </Button>
      </header>

      <TimerTray className="mt-3 px-5 md:px-12" />

      <main
        className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-y-auto px-5 py-6 md:px-8 md:py-10"
        // Scrollbarer Bereich muss per Tastatur erreichbar sein
        tabIndex={0}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-live="polite"
      >
        <p className="tabular text-subhead font-semibold text-tint">
          {t('progress', { current: index + 1, total })}
        </p>
        {step ? (
          <>
            <p className="mt-3 text-[1.75rem] leading-[1.3] font-semibold tracking-tight whitespace-pre-line md:text-[2.25rem]">
              {step.text}
            </p>
            {step.timerSeconds ? (
              <div className="mt-6">
                <TimerButton
                  timerKey={`${id}:${step.id}`}
                  seconds={step.timerSeconds}
                  label={tt('stepLabel', { n: index + 1 })}
                  size="lg"
                />
              </div>
            ) : null}
            {used.length ? (
              <section className="mt-8">
                <h2 className="text-footnote font-semibold text-label-2">{t('inThisStep')}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {used.map((i) => {
                    const q = formatQuantity(i.amount == null ? null : i.amount * factor, i.unit, locale);
                    return (
                      <li
                        key={i.id}
                        className="rounded-full bg-surface px-4 py-2 text-callout shadow-elevated"
                      >
                        {q ? <span className="tabular font-semibold">{q} </span> : null}
                        {i.name}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <div className="mt-4">
            <p className="text-title-2 leading-snug">{t('noSteps')}</p>
            <div className="mt-6">
              <IngredientList ingredients={ingredients} factor={factor} showStatus={false} large />
            </div>
          </div>
        )}
        <p className="mt-auto pt-8 text-center text-footnote text-label-2 max-md:hidden">{t('hint')}</p>
      </main>

      <footer className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 pt-2 pb-[max(env(safe-area-inset-bottom),16px)] md:px-8">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="h-14 px-5"
          aria-label={t('prev')}
        >
          <ChevronLeft className="!size-6" />
          <span className="max-sm:sr-only">{t('prev')}</span>
        </Button>
        {awake ? (
          <span className="flex items-center gap-1 text-caption text-label-3 max-sm:sr-only">
            <Sun className="size-3.5" aria-hidden /> {t('awake')}
          </span>
        ) : null}
        {last ? (
          <Button size="lg" onClick={() => setFinishOpen(true)} className="h-14 flex-1">
            {t('finish')}
          </Button>
        ) : (
          <Button size="lg" onClick={() => go(1)} className="h-14 flex-1">
            {t('next')}
            <ChevronRight className="!size-6" />
          </Button>
        )}
      </footer>

      <Sheet
        open={ingOpen}
        onOpenChange={setIngOpen}
        title={t('ingredients')}
        description={t('ingredientsFor', { servings })}
      >
        <IngredientList ingredients={ingredients} factor={factor} />
      </Sheet>

      <CookedSheet
        open={finishOpen}
        onOpenChange={setFinishOpen}
        servings={servings}
        showServings={!entry}
        title={t('finishTitle')}
        description={entry ? t('finishPlanned') : t('finishText')}
        submitLabel={t('finish')}
        onSubmit={({ servings: n, deduct }) => callAction(finishCooking(id, { servings: n, deduct, entry }))}
      />
    </div>
  );
}
