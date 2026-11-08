'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState, useTransition } from 'react';
import { Check, Search } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChipButton } from '@/components/ui/chip';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Group, RowButton } from '@/components/ui/list';
import { Photo } from '@/components/ui/photo';
import { Segmented } from '@/components/ui/segmented';
import { Sheet } from '@/components/ui/sheet';
import { Dot } from '@/components/ui/status';
import { Stepper } from '@/components/ui/stepper';
import { callAction } from '@/lib/action-client';
import { isValidDateKey } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { searchPlanRecipes } from '@/server/actions/plan';
import { SLOTS, type AddTarget, type RecipeOption, type Slot } from './types';

export type AddSubmit = {
  input: { date: string; slot: Slot; servings: number; recipeId?: string; title?: string; note?: string };
  recipe?: RecipeOption;
};

const SUGGESTIONS = ['eatOut', 'leftovers', 'takeaway'] as const;

/** Sheet zum Planen. Rezept suchen oder freien Eintrag anlegen, Tag und Mahlzeit sind vorbelegt. */
export function AddSheet({
  open,
  onOpenChange,
  target,
  recipes: initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  target: AddTarget;
  recipes: RecipeOption[];
  onSubmit: (s: AddSubmit) => void;
}) {
  const t = useTranslations('plan');
  const tc = useTranslations('common');
  const uid = useId();
  const [mode, setMode] = useState<'recipe' | 'free'>('recipe');
  const [date, setDate] = useState(target.date);
  const [slot, setSlot] = useState<Slot>(target.slot);
  const [servings, setServings] = useState(2);
  const [servingsTouched, setServingsTouched] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState(initial);
  const [selected, setSelected] = useState<RecipeOption | null>(null);
  const [freeTitle, setFreeTitle] = useState('');
  const [note, setNote] = useState('');
  const [searching, startSearch] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const req = useRef(0);

  const search = (value: string) => {
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const n = ++req.current;
      startSearch(async () => {
        const res = await callAction(searchPlanRecipes(value));
        if (res && n === req.current) setResults(res);
      });
    }, 220);
  };

  const pick = (r: RecipeOption) => {
    setSelected((s) => (s?.id === r.id ? null : r));
    if (!servingsTouched) setServings(r.servings);
  };

  const validDate = isValidDateKey(date);
  const canSubmit = validDate && (mode === 'recipe' ? !!selected : freeTitle.trim().length > 0);

  const submit = () => {
    if (!canSubmit) return;
    const base = { date, slot, servings, note: note.trim() || undefined };
    if (mode === 'recipe' && selected)
      onSubmit({ input: { ...base, recipeId: selected.id }, recipe: selected });
    else onSubmit({ input: { ...base, title: freeTitle.trim() } });
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('add.title')}
      wide
      footer={
        <>
          <Button variant="secondary" className="h-11" onClick={() => onOpenChange(false)}>
            {tc('actions.cancel')}
          </Button>
          <Button className="h-11" onClick={submit} disabled={!canSubmit}>
            {t('add.submit')}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="grid gap-4"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <Field label={t('fields.date')} htmlFor={`${uid}-date`}>
            <Input
              id={`${uid}-date`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              aria-invalid={!validDate}
            />
          </Field>
          <div className="grid gap-1.5">
            <span className="px-1 text-footnote font-semibold text-label-2" aria-hidden>
              {t('fields.servings')}
            </span>
            <div>
              <Stepper
                value={servings}
                min={1}
                max={50}
                label={t('fields.servings')}
                onChange={(v) => {
                  setServings(v);
                  setServingsTouched(true);
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-1.5">
          <span className="px-1 text-footnote font-semibold text-label-2">{t('fields.slot')}</span>
          <Segmented
            label={t('fields.slot')}
            value={slot}
            onChange={setSlot}
            items={SLOTS.map((s) => ({ value: s, label: tc(`slots.${s}`) }))}
          />
        </div>

        <Segmented
          label={t('add.mode')}
          value={mode}
          onChange={setMode}
          items={[
            { value: 'recipe', label: t('add.tabRecipe') },
            { value: 'free', label: t('add.tabFree') },
          ]}
        />

        {mode === 'recipe' ? (
          <div className="grid gap-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-label-2"
                aria-hidden
              />
              <Input
                type="search"
                value={q}
                onChange={(e) => search(e.target.value)}
                placeholder={t('add.searchPlaceholder')}
                aria-label={t('add.search')}
                className="pl-9"
                enterKeyHint="search"
              />
            </div>
            <div
              aria-live="polite"
              aria-busy={searching}
              className={cn('transition-opacity', searching && 'opacity-60')}
            >
              {results.length ? (
                <Group inset={false} className="shadow-none">
                  {results.map((r) => {
                    const on = selected?.id === r.id;
                    return (
                      <RowButton
                        key={r.id}
                        onClick={() => pick(r)}
                        indent="none"
                        className={cn(on && 'bg-tint-soft hover:bg-tint-soft')}
                        icon={
                          <Photo
                            path={r.imagePath}
                            alt=""
                            seed={r.title}
                            className="size-12 rounded-[10px]"
                          />
                        }
                        title={<span className="font-semibold">{r.title}</span>}
                        subtitle={
                          <span className="flex items-center gap-1.5">
                            {r.totalMinutes ? <span>{tc('minutes', { count: r.totalMinutes })}</span> : null}
                            {r.ingredientCount ? (
                              <span className="flex items-center gap-1">
                                <Dot tone={r.missingCount ? 'warn' : 'ok'} />
                                {r.missingCount
                                  ? t('add.missing', { count: r.missingCount })
                                  : t('add.allThere')}
                              </span>
                            ) : null}
                          </span>
                        }
                        end={
                          on ? (
                            <span className="grid size-6 place-items-center rounded-full bg-tint text-on-tint">
                              <Check className="size-4" strokeWidth={3} aria-hidden />
                              <span className="sr-only">{t('add.selected')}</span>
                            </span>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </Group>
              ) : (
                <div className="rounded-card bg-surface px-5 py-8 text-center">
                  <p className="text-subhead text-label-2">{q ? t('add.noResults') : t('add.noRecipes')}</p>
                  <Link
                    href="/recipes/new"
                    className={buttonVariants({ variant: 'tinted', className: 'mt-3 h-11' })}
                  >
                    {t('add.newRecipe')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <Field label={t('add.freeTitle')} htmlFor={`${uid}-title`}>
              <Input
                id={`${uid}-title`}
                value={freeTitle}
                onChange={(e) => setFreeTitle(e.target.value)}
                placeholder={t('add.freePlaceholder')}
                maxLength={120}
                autoComplete="off"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <ChipButton
                  key={s}
                  active={freeTitle === t(`add.suggest.${s}`)}
                  onClick={() => setFreeTitle(t(`add.suggest.${s}`))}
                >
                  {t(`add.suggest.${s}`)}
                </ChipButton>
              ))}
            </div>
          </div>
        )}

        <Field label={t('fields.note')} htmlFor={`${uid}-note`}>
          <Textarea
            id={`${uid}-note`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('fields.notePlaceholder')}
            maxLength={500}
            className="min-h-16"
          />
        </Field>
        <button type="submit" hidden aria-hidden tabIndex={-1} />
      </form>
    </Sheet>
  );
}
