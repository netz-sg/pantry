'use client';

import { useTranslations } from 'next-intl';
import { useOptimistic, useState, useTransition } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { callAction } from '@/lib/action-client';
import {
  addPlanEntry,
  deletePlanEntry,
  markPlanEntryCooked,
  restorePlanEntry,
  updatePlanEntry,
} from '@/server/actions/plan';
import { AddSheet, type AddSubmit } from './add-sheet';
import { DayView } from './day-view';
import { EditSheet, type EditPatch } from './edit-sheet';
import type { AddTarget, BoardEntry, RecipeOption, Slot } from './types';
import { WeekGrid } from './week-grid';

type Change =
  | { type: 'add'; entry: BoardEntry }
  | { type: 'patch'; id: string; patch: Partial<BoardEntry> }
  | { type: 'remove'; id: string };

function reduce(list: BoardEntry[], c: Change): BoardEntry[] {
  if (c.type === 'add') return [...list, c.entry];
  if (c.type === 'remove') return list.filter((e) => e.id !== c.id);
  return list.map((e) => (e.id === c.id ? { ...e, ...c.patch } : e));
}

/** Wochenplan mit Raster am Desktop und Tagesansicht am Handy. Hält die optimistische Anzeige. */
export function PlanBoard({
  start,
  days,
  today,
  entries,
  recipes,
  initialDay,
  initialAdd,
}: {
  start: string;
  days: string[];
  today: string;
  entries: BoardEntry[];
  recipes: RecipeOption[];
  initialDay: string;
  initialAdd: AddTarget | null;
}) {
  const t = useTranslations('plan');
  const tc = useTranslations('common');
  const [list, apply] = useOptimistic(entries, reduce);
  const [, startTransition] = useTransition();
  const [day, setDay] = useState(initialDay);
  const [add, setAdd] = useState<{ open: boolean; target: AddTarget; key: number }>({
    open: !!initialAdd,
    target: initialAdd ?? { date: initialDay, slot: 'dinner' },
    key: 0,
  });
  const [edit, setEdit] = useState<{ id: string | null; open: boolean; n: number }>({
    id: null,
    open: false,
    n: 0,
  });
  const editing = edit.id ? list.find((e) => e.id === edit.id) : undefined;
  const openEdit = (id: string) => setEdit((s) => ({ id, open: true, n: s.n + 1 }));
  const closeEdit = () => setEdit((s) => ({ ...s, open: false }));

  // Gewählten Tag in der Adresse halten, ohne die Seite neu zu laden
  const syncUrl = (d: string) => window.history.replaceState(null, '', `/plan?week=${start}&day=${d}`);

  const selectDay = (d: string) => {
    setDay(d);
    syncUrl(d);
  };

  const openAdd = (target: AddTarget) => setAdd((a) => ({ open: true, target, key: a.key + 1 }));
  const closeAdd = (open: boolean) => {
    setAdd((a) => ({ ...a, open }));
    if (!open && window.location.search.includes('add=')) syncUrl(day);
  };

  const submitAdd = ({ input, recipe }: AddSubmit) =>
    startTransition(async () => {
      apply({
        type: 'add',
        entry: {
          id: `temp-${Date.now()}`,
          date: input.date,
          slot: input.slot,
          recipeId: input.recipeId ?? null,
          title: input.title ?? null,
          servings: input.servings,
          note: input.note ?? null,
          cooked: false,
          recipe: recipe
            ? {
                id: recipe.id,
                title: recipe.title,
                imagePath: recipe.imagePath,
                servings: recipe.servings,
                totalMinutes: recipe.totalMinutes,
              }
            : null,
          pending: true,
        },
      });
      await callAction(addPlanEntry(input), { success: t('add.added') });
    });

  const move = (id: string, target: AddTarget) =>
    startTransition(async () => {
      apply({ type: 'patch', id, patch: target });
      await callAction(updatePlanEntry(id, target));
    });

  const save = (id: string, patch: EditPatch) =>
    startTransition(async () => {
      apply({ type: 'patch', id, patch });
      await callAction(updatePlanEntry(id, patch));
    });

  const restore = (e: BoardEntry) =>
    startTransition(async () => {
      apply({ type: 'add', entry: { ...e, id: `temp-${Date.now()}`, pending: true } });
      await callAction(
        restorePlanEntry({
          date: e.date,
          slot: e.slot,
          recipeId: e.recipeId,
          title: e.title,
          servings: e.servings,
          note: e.note,
          cooked: e.cooked,
        }),
      );
    });

  const remove = (e: BoardEntry) => {
    closeEdit();
    startTransition(async () => {
      apply({ type: 'remove', id: e.id });
      await callAction(deletePlanEntry(e.id), {
        success: t('edit.deleted'),
        undo: { label: tc('actions.undo'), run: () => restore(e) },
      });
    });
  };

  const setCooked = (e: BoardEntry, cooked: boolean, deduct: boolean) => {
    closeEdit();
    startTransition(async () => {
      apply({ type: 'patch', id: e.id, patch: { cooked } });
      if (cooked) await callAction(markPlanEntryCooked(e.id, deduct), { success: t('edit.cookedDone') });
      else await callAction(updatePlanEntry(e.id, { cooked: false }));
    });
  };

  const empty = list.length === 0;
  const planFirst = (slot: Slot = 'dinner') => openAdd({ date: day, slot });

  return (
    <>
      {empty ? (
        <div className="mx-5 mt-3 flex flex-col gap-4 rounded-hero border border-separator bg-surface p-6 md:mx-12 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-tint-soft text-tint"
              aria-hidden
            >
              <CalendarPlus className="size-6" />
            </span>
            <div>
              <h2 className="text-title-2 font-bold">{t('empty.title')}</h2>
              <p className="mt-1 max-w-prose text-subhead text-label-2">{t('empty.text')}</p>
            </div>
          </div>
          <Button size="lg" onClick={() => planFirst()}>
            {t('empty.action')}
          </Button>
        </div>
      ) : null}

      <WeekGrid
        days={days}
        today={today}
        entries={list}
        onAdd={openAdd}
        onEdit={openEdit}
        onMove={move}
        className="max-lg:hidden"
      />
      <DayView
        days={days}
        today={today}
        entries={list}
        day={day}
        onDay={selectDay}
        onAdd={openAdd}
        onEdit={openEdit}
        hideList={empty}
        className="lg:hidden"
      />

      <AddSheet
        key={add.key}
        open={add.open}
        onOpenChange={closeAdd}
        target={add.target}
        recipes={recipes}
        onSubmit={submitAdd}
      />
      {editing ? (
        <EditSheet
          key={`${editing.id}-${edit.n}`}
          entry={editing}
          open={edit.open}
          onOpenChange={(o) => {
            if (!o) closeEdit();
          }}
          onSave={(patch) => save(editing.id, patch)}
          onDelete={() => remove(editing)}
          onCooked={(cooked, deduct) => setCooked(editing, cooked, deduct)}
        />
      ) : null}
    </>
  );
}
