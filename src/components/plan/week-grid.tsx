'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Fragment, useState, type ComponentProps } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { Check, ChevronDown, Plus, Utensils } from 'lucide-react';
import { Photo } from '@/components/ui/photo';
import { cn } from '@/lib/utils';
import {
  cellId,
  entryTitle,
  noon,
  parseCellId,
  SLOTS,
  type AddTarget,
  type BoardEntry,
  type Slot,
} from './types';

type GridProps = {
  days: string[];
  today: string;
  entries: BoardEntry[];
  onAdd: (t: AddTarget) => void;
  onEdit: (id: string) => void;
  onMove: (id: string, t: AddTarget) => void;
  className?: string;
};

/** Raster sieben Tage mal Mahlzeiten für große Bildschirme. Einträge lassen sich zwischen Zellen ziehen. */
export function WeekGrid({ days, today, entries, onAdd, onEdit, onMove, className }: GridProps) {
  const t = useTranslations('plan');
  const tc = useTranslations('common');
  const f = useFormatter();
  // Maus ab 6 Pixel Bewegung, Finger nach kurzem Halten, damit Scrollen am Tablet frei bleibt
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);
  const hasSnack = entries.some((e) => e.slot === 'snack');
  const slots: readonly Slot[] = hasSnack || snackOpen ? SLOTS : SLOTS.slice(0, 3);
  const active = activeId ? entries.find((e) => e.id === activeId) : undefined;

  const dayLong = (d: string) => f.dateTime(noon(d), { weekday: 'long', day: 'numeric', month: 'long' });
  const cellLabel = (id: UniqueIdentifier) => {
    const c = parseCellId(String(id));
    return c ? t('cell', { slot: tc(`slots.${c.slot}`), date: dayLong(c.date) }) : '';
  };
  const titleOf = (id: UniqueIdentifier) => {
    const e = entries.find((x) => x.id === id);
    return e ? (entryTitle(e) ?? t('entry.untitled')) : '';
  };

  const announcements: Announcements = {
    onDragStart: ({ active: a }) => t('dnd.start', { title: titleOf(a.id) }),
    onDragOver: ({ active: a, over }) =>
      over ? t('dnd.over', { title: titleOf(a.id), target: cellLabel(over.id) }) : undefined,
    onDragEnd: ({ active: a, over }) =>
      over ? t('dnd.end', { title: titleOf(a.id), target: cellLabel(over.id) }) : t('dnd.cancel'),
    onDragCancel: () => t('dnd.cancel'),
  };

  const onDragEnd = ({ active: a, over }: DragEndEvent) => {
    setActiveId(null);
    const target = over ? parseCellId(String(over.id)) : null;
    const e = entries.find((x) => x.id === a.id);
    if (!target || !e || (e.date === target.date && e.slot === target.slot)) return;
    onMove(e.id, target);
  };

  return (
    <section aria-label={t('gridLabel')} className={cn('px-12 pt-3', className)}>
      <DndContext
        id="plan-week"
        sensors={sensors}
        accessibility={{ announcements, screenReaderInstructions: { draggable: t('dnd.instructions') } }}
        onDragStart={({ active: a }) => setActiveId(String(a.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-[4.25rem_repeat(7,minmax(0,1fr))] gap-x-2 gap-y-2">
          <div aria-hidden />
          {days.map((d) => {
            const isToday = d === today;
            return (
              <div
                key={d}
                className="flex flex-col items-center gap-1 pb-1"
                aria-current={isToday ? 'date' : undefined}
              >
                <span
                  className={cn(
                    'text-caption font-semibold tracking-wide uppercase',
                    isToday ? 'text-tint' : 'text-label-2',
                  )}
                >
                  {f.dateTime(noon(d), { weekday: 'short' })}
                </span>
                <span
                  className={cn(
                    'tabular grid size-9 place-items-center rounded-full text-title-2 font-semibold',
                    isToday ? 'bg-tint text-on-tint' : d < today ? 'text-label-2' : 'text-label',
                  )}
                >
                  {f.dateTime(noon(d), { day: 'numeric' })}
                </span>
                <span className="sr-only">{dayLong(d)}</span>
              </div>
            );
          })}

          {slots.map((slot) => (
            <Fragment key={slot}>
              <div className="pt-3 text-footnote font-semibold text-label-2">{tc(`slots.${slot}`)}</div>
              {days.map((d) => (
                <Cell
                  key={d}
                  id={cellId(d, slot)}
                  label={t('cell', { slot: tc(`slots.${slot}`), date: dayLong(d) })}
                  addLabel={t('addTo', { slot: tc(`slots.${slot}`), date: dayLong(d) })}
                  entries={entries.filter((e) => e.date === d && e.slot === slot)}
                  isToday={d === today}
                  activeId={activeId}
                  onAdd={() => onAdd({ date: d, slot })}
                  onEdit={onEdit}
                />
              ))}
            </Fragment>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {active ? (
            <CardFace entry={active} tabIndex={-1} aria-hidden className="rotate-2 shadow-glass" />
          ) : null}
        </DragOverlay>
      </DndContext>

      {!hasSnack ? (
        <button
          type="button"
          onClick={() => setSnackOpen((o) => !o)}
          aria-expanded={snackOpen}
          className="mt-2 ml-[4.75rem] inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-footnote font-semibold text-tint hover:bg-tint-soft"
        >
          <ChevronDown className={cn('size-4 transition-transform', snackOpen && 'rotate-180')} aria-hidden />
          {snackOpen ? t('snack.hide') : t('snack.show')}
        </button>
      ) : null}
    </section>
  );
}

function Cell({
  id,
  label,
  addLabel,
  entries,
  isToday,
  activeId,
  onAdd,
  onEdit,
}: {
  id: string;
  label: string;
  addLabel: string;
  entries: BoardEntry[];
  isToday: boolean;
  activeId: string | null;
  onAdd: () => void;
  onEdit: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const empty = entries.length === 0;
  return (
    <div
      ref={setNodeRef}
      role="group"
      aria-label={label}
      className={cn(
        'group/cell flex min-h-[7.5rem] flex-col gap-1.5 rounded-[16px] p-1 transition-colors',
        isToday && 'bg-tint-soft/50',
        isOver && 'bg-tint-soft ring-2 ring-tint',
      )}
    >
      {entries.map((e) => (
        <DraggableCard key={e.id} entry={e} dimmed={activeId === e.id} onEdit={onEdit} />
      ))}
      <button
        type="button"
        onClick={onAdd}
        aria-label={addLabel}
        className={cn(
          'grid min-h-11 flex-1 place-items-center rounded-[12px] border-2 border-dashed border-separator text-label-3 transition-[color,background,opacity] hover:border-tint/40 hover:bg-tint-soft hover:text-tint focus-visible:opacity-100',
          !empty && 'opacity-0 group-hover/cell:opacity-100',
        )}
      >
        <Plus className="size-5" aria-hidden />
      </button>
    </div>
  );
}

function DraggableCard({
  entry,
  dimmed,
  onEdit,
}: {
  entry: BoardEntry;
  dimmed: boolean;
  onEdit: (id: string) => void;
}) {
  const t = useTranslations('plan');
  const title = entryTitle(entry) ?? t('entry.untitled');
  const { setNodeRef, listeners, attributes } = useDraggable({
    id: entry.id,
    disabled: entry.pending,
    attributes: { roleDescription: t('dnd.role') },
  });
  return (
    <CardFace
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      entry={entry}
      type="button"
      disabled={entry.pending}
      onClick={() => onEdit(entry.id)}
      title={t('entry.open', { title })}
      className={cn('touch-manipulation', dimmed && 'opacity-30')}
    />
  );
}

/** Kleine Karte mit Mini-Foto, Titel und Portionen. Auch als Vorschau beim Ziehen. */
function CardFace({ entry, className, ...props }: { entry: BoardEntry } & ComponentProps<'button'>) {
  const t = useTranslations('plan');
  const tc = useTranslations('common');
  const title = entryTitle(entry) ?? t('entry.untitled');
  return (
    <button
      {...props}
      className={cn(
        'relative flex w-full flex-col overflow-hidden rounded-[14px] bg-surface text-left shadow-elevated outline-offset-2 transition-[opacity,transform] hover:-translate-y-px active:scale-[0.98] disabled:opacity-60',
        entry.cooked && 'opacity-55',
        className,
      )}
    >
      {entry.recipe ? (
        <Photo path={entry.recipe.imagePath} alt="" seed={entry.recipe.title} className="h-14 w-full" />
      ) : (
        <span className="grid h-9 w-full place-items-center bg-fill text-label-2" aria-hidden>
          <Utensils className="size-4" />
        </span>
      )}
      <span className="flex flex-col gap-0.5 px-2 pt-1.5 pb-2">
        <span className="line-clamp-2 text-footnote leading-tight font-semibold break-words">{title}</span>
        <span className="tabular text-caption text-label-2">{tc('servings', { count: entry.servings })}</span>
      </span>
      {entry.cooked ? (
        <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-green text-white shadow-elevated">
          <Check className="size-3" strokeWidth={3} aria-hidden />
          <span className="sr-only">{t('entry.cooked')}</span>
        </span>
      ) : null}
    </button>
  );
}
