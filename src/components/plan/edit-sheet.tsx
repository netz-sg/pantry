'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { BookOpen, Check, Play, Trash2, Utensils } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Photo } from '@/components/ui/photo';
import { Segmented } from '@/components/ui/segmented';
import { Sheet } from '@/components/ui/sheet';
import { Pill } from '@/components/ui/status';
import { Stepper } from '@/components/ui/stepper';
import { isValidDateKey } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { entryTitle, SLOTS, type BoardEntry, type Slot } from './types';

export type EditPatch = { date?: string; slot?: Slot; servings?: number; note?: string | null };

/** Sheet zum Bearbeiten, Verschieben, Kochen und Löschen eines Eintrags. Ersatz fürs Ziehen per Tastatur. */
export function EditSheet({
  entry,
  open,
  onOpenChange,
  onSave,
  onDelete,
  onCooked,
}: {
  entry: BoardEntry;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (patch: EditPatch) => void;
  onDelete: () => void;
  onCooked: (cooked: boolean, deduct: boolean) => void;
}) {
  const t = useTranslations('plan');
  const tc = useTranslations('common');
  const uid = useId();
  const [servings, setServings] = useState(entry.servings);
  const [slot, setSlot] = useState<Slot>(entry.slot);
  const [date, setDate] = useState(entry.date);
  const [note, setNote] = useState(entry.note ?? '');
  const [deduct, setDeduct] = useState(true);
  const title = entryTitle(entry) ?? t('entry.untitled');
  const r = entry.recipe;

  const patch: EditPatch = {
    ...(servings !== entry.servings ? { servings } : {}),
    ...(slot !== entry.slot ? { slot } : {}),
    ...(date !== entry.date && isValidDateKey(date) ? { date } : {}),
    ...(note.trim() !== (entry.note ?? '') ? { note: note.trim() || null } : {}),
  };
  const dirty = Object.keys(patch).length > 0;
  const validDate = isValidDateKey(date);

  const save = () => {
    if (dirty && validDate) onSave(patch);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('edit.title')}
      footer={
        <>
          <Button variant="destructive" className="h-11" onClick={onDelete}>
            <Trash2 /> {tc('actions.delete')}
          </Button>
          <Button className="h-11" onClick={save} disabled={!validDate}>
            {dirty ? tc('actions.save') : tc('actions.done')}
          </Button>
        </>
      }
    >
      <div className="grid gap-5">
        <div className="flex items-center gap-3">
          {r ? (
            <Photo path={r.imagePath} alt="" seed={r.title} className="size-16 shrink-0 rounded-[14px]" />
          ) : (
            <span
              className="grid size-16 shrink-0 place-items-center rounded-[14px] bg-fill text-label-2"
              aria-hidden
            >
              <Utensils className="size-6" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-body leading-tight font-semibold">{title}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-footnote text-label-2">
              {r?.totalMinutes ? <span>{tc('minutes', { count: r.totalMinutes })}</span> : null}
              {!r ? <span>{t('entry.free')}</span> : null}
              {entry.cooked ? (
                <Pill tone="ok">
                  <Check className="size-3" strokeWidth={3} aria-hidden /> {t('entry.cooked')}
                </Pill>
              ) : null}
            </p>
          </div>
        </div>

        {r ? (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/recipes/${r.id}/cook?servings=${servings}&entry=${entry.id}`}
              className={buttonVariants({ className: 'h-11' })}
            >
              <Play className="fill-current" /> {t('edit.cook')}
            </Link>
            <Link
              href={`/recipes/${r.id}?servings=${servings}`}
              className={buttonVariants({ variant: 'secondary', className: 'h-11' })}
            >
              <BookOpen /> {t('edit.toRecipe')}
            </Link>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <span className="text-body font-medium" aria-hidden>
            {t('fields.servings')}
          </span>
          <Stepper value={servings} onChange={setServings} min={1} max={50} label={t('fields.servings')} />
        </div>

        <fieldset className="grid gap-3">
          <legend className="mb-2 px-1 text-footnote font-semibold text-label-2">{t('edit.move')}</legend>
          <Segmented
            label={t('fields.slot')}
            value={slot}
            onChange={setSlot}
            items={SLOTS.map((s) => ({ value: s, label: tc(`slots.${s}`) }))}
          />
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
        </fieldset>

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

        <div className="overflow-hidden rounded-card bg-surface">
          {entry.cooked ? (
            <div className="flex min-h-[3.25rem] items-center justify-between gap-3 px-4 py-2">
              <span className="text-body">{t('edit.isCooked')}</span>
              <Button variant="plain" className="h-11" onClick={() => onCooked(false, false)}>
                {t('edit.unmark')}
              </Button>
            </div>
          ) : (
            <>
              {r ? (
                <label
                  htmlFor={`${uid}-deduct`}
                  className="flex min-h-[3.25rem] cursor-pointer items-center justify-between gap-3 px-4 py-2"
                >
                  <span className="text-body">{t('edit.deduct')}</span>
                  <Switch id={`${uid}-deduct`} checked={deduct} onChange={setDeduct} />
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (dirty && validDate) onSave(patch);
                  onCooked(true, !!r && deduct);
                }}
                className={cn(
                  'flex min-h-[3.25rem] w-full items-center gap-2 px-4 py-2 text-left text-body font-semibold text-tint transition-colors hover:bg-fill/50 active:bg-fill',
                  r && 'hairline-top',
                )}
              >
                <Check className="size-5" aria-hidden /> {t('edit.markCooked')}
              </button>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}

/** Schalter im iOS-Stil. */
function Switch({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors',
        checked ? 'bg-green' : 'bg-fill-strong',
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition-transform',
          checked && 'translate-x-5',
        )}
        aria-hidden
      />
    </button>
  );
}
