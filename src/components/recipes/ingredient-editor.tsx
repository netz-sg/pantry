'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, ClipboardPaste, GripVertical, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { UNITS, type Locale } from '@/lib/units';
import { cn } from '@/lib/utils';
import { emptyIngredient, parsePasted, type IngRow } from './form-state';
import { Switch } from './switch';

const CUSTOM = '__custom';
const control =
  'h-11 min-w-0 rounded-[10px] bg-fill px-3 text-body text-label placeholder:text-label-3 outline-none focus:ring-2 focus:ring-tint/50 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red/60';

type Update = (fn: (rows: IngRow[]) => IngRow[]) => void;

/** Zutatenliste im Formular. Ziehen, Pfeil-Knöpfe, Einfügen aus Text. */
export function IngredientEditor({
  rows,
  setRows,
  nextKey,
  error,
}: {
  rows: IngRow[];
  setRows: Update;
  nextKey: () => string;
  error?: string;
}) {
  const t = useTranslations('recipes.form');
  const tc = useTranslations('common.actions');
  const locale = useLocale();
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const pos = (id: UniqueIdentifier) => rows.findIndex((r) => r.key === id) + 1;
  const groups = [...new Set(rows.map((r) => r.groupName.trim()).filter(Boolean))];

  const update = (key: string, patch: Partial<IngRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));
  const move = (key: string, dir: -1 | 1) =>
    setRows((rs) => {
      const i = rs.findIndex((r) => r.key === key);
      const j = i + dir;
      return i < 0 || j < 0 || j >= rs.length ? rs : arrayMove(rs, i, j);
    });
  const add = () => {
    const key = nextKey();
    // Neue Zeile übernimmt die Gruppe der letzten Zeile
    const last = rows[rows.length - 1];
    setRows((rs) => [...rs, { ...emptyIngredient(key), groupName: last?.groupName ?? '' }]);
    setFocusKey(key);
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setRows((rs) =>
      arrayMove(
        rs,
        rs.findIndex((r) => r.key === active.id),
        rs.findIndex((r) => r.key === over.id),
      ),
    );
  };
  const applyPaste = () => {
    const parsed = parsePasted(pasteText, nextKey, locale);
    if (parsed.length) {
      setRows((rs) => [...rs.filter((r) => r.name.trim() || r.amount.trim()), ...parsed]);
      toast.success(t('pasteDone', { count: parsed.length }));
    }
    setPasteText('');
    setPasteOpen(false);
  };

  return (
    <div>
      {rows.length ? (
        <DndContext
          id="ingredient-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            screenReaderInstructions: { draggable: t('dnd.instructions') },
            announcements: {
              onDragStart: ({ active }) => t('dnd.picked', { from: pos(active.id) }),
              onDragOver: ({ over }) => (over ? t('dnd.over', { to: pos(over.id) }) : undefined),
              onDragEnd: ({ over }) => (over ? t('dnd.dropped', { to: pos(over.id) }) : t('dnd.cancelled')),
              onDragCancel: () => t('dnd.cancelled'),
            },
          }}
        >
          <SortableContext items={rows.map((r) => r.key)} strategy={verticalListSortingStrategy}>
            <ol className="overflow-hidden rounded-card bg-surface shadow-elevated">
              {rows.map((r, i) => (
                <IngredientRow
                  key={r.key}
                  row={r}
                  index={i}
                  count={rows.length}
                  autoFocus={r.key === focusKey}
                  update={(p) => update(r.key, p)}
                  remove={() => remove(r.key)}
                  move={(d) => move(r.key, d)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="rounded-card bg-surface p-4 text-subhead text-label-2 shadow-elevated">
          {t('noIngredientsYet')}
        </p>
      )}
      <datalist id="ingredient-groups">
        {groups.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>
      {error ? (
        <p className="mt-1.5 px-1 text-footnote text-red" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-2.5 flex flex-wrap gap-2">
        <Button type="button" variant="tinted" onClick={add}>
          <Plus /> {t('addIngredient')}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setPasteOpen(true)}>
          <ClipboardPaste /> {t('pasteIngredients')}
        </Button>
      </div>

      <Sheet
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        title={t('pasteTitle')}
        description={t('pasteHint')}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setPasteOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button type="button" onClick={applyPaste} disabled={!pasteText.trim()}>
              {t('pasteSubmit')}
            </Button>
          </>
        }
      >
        <label htmlFor="paste-ingredients" className="sr-only">
          {t('pasteTitle')}
        </label>
        <Textarea
          id="paste-ingredients"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={t('pastePlaceholder')}
          rows={10}
          className="min-h-56"
        />
      </Sheet>
    </div>
  );
}

function IngredientRow({
  row,
  index,
  count,
  autoFocus,
  update,
  remove,
  move,
}: {
  row: IngRow;
  index: number;
  count: number;
  autoFocus: boolean;
  update: (p: Partial<IngRow>) => void;
  remove: () => void;
  move: (d: -1 | 1) => void;
}) {
  const t = useTranslations('recipes.form');
  const locale = useLocale() as Locale;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.key });
  const n = index + 1;
  const detailsId = `ing-${row.key}-more`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'relative bg-surface px-1.5 py-2 sm:px-2',
        'before:absolute before:top-0 before:right-0 before:left-12 before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden',
        isDragging && 'z-10 rounded-[14px] shadow-glass',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t('drag', { n })}
          className="grid size-11 shrink-0 cursor-grab touch-none place-items-center rounded-[10px] text-label-3 hover:text-label-2 active:cursor-grabbing"
        >
          <GripVertical className="size-5" />
        </button>
        <input
          value={row.amount}
          onChange={(e) => update({ amount: e.target.value })}
          inputMode="decimal"
          placeholder={t('amount')}
          aria-label={t('amountFor', { n })}
          className={cn(control, 'tabular w-16 px-2 text-center')}
        />
        {row.custom ? (
          <input
            value={row.unit}
            autoFocus={!row.unit}
            onChange={(e) => update({ unit: e.target.value })}
            onBlur={() => !row.unit.trim() && update({ custom: false, unit: '' })}
            placeholder={t('customUnitPlaceholder')}
            aria-label={t('unitFor', { n })}
            maxLength={24}
            className={cn(control, 'w-[5.5rem] sm:w-28')}
          />
        ) : (
          <select
            value={row.unit}
            onChange={(e) =>
              e.target.value === CUSTOM
                ? update({ custom: true, unit: '' })
                : update({ unit: e.target.value })
            }
            aria-label={t('unitFor', { n })}
            className={cn(control, 'w-[5.5rem] appearance-none pr-2 sm:w-28')}
          >
            <option value="">{t('noUnit')}</option>
            {UNITS.map((u) => (
              <option key={u.code} value={u.code}>
                {u.label[locale] ?? u.code}
              </option>
            ))}
            <option value={CUSTOM}>{t('customUnit')}</option>
          </select>
        )}
        <input
          value={row.name}
          autoFocus={autoFocus}
          onChange={(e) => update({ name: e.target.value })}
          placeholder={t('namePlaceholder')}
          aria-label={t('nameFor', { n })}
          maxLength={160}
          className={cn(
            control,
            'order-last ml-[3.125rem] w-[calc(100%-3.125rem)] sm:order-none sm:ml-0 sm:w-auto sm:flex-1',
          )}
        />
        <button
          type="button"
          onClick={() => update({ open: !row.open })}
          aria-expanded={row.open}
          aria-controls={detailsId}
          aria-label={t('moreOptions', { n })}
          className="ml-auto grid size-11 shrink-0 place-items-center rounded-full text-label-2 hover:bg-fill sm:ml-0"
        >
          <ChevronDown className={cn('size-5 transition-transform', row.open && 'rotate-180')} />
        </button>
        <button
          type="button"
          onClick={remove}
          aria-label={t('remove', { n })}
          className="grid size-11 shrink-0 place-items-center rounded-full text-label-2 hover:bg-red-soft hover:text-red"
        >
          <X className="size-5" />
        </button>
      </div>
      {row.optional || row.note || row.groupName ? (
        !row.open ? (
          <p className="mt-1 ml-[3.125rem] truncate text-footnote text-label-2">
            {[row.groupName, row.note, row.optional ? t('optional') : null].filter(Boolean).join(', ')}
          </p>
        ) : null
      ) : null}
      <div id={detailsId} hidden={!row.open} className="mt-2 ml-[3.125rem] grid gap-2 sm:grid-cols-2">
        <input
          value={row.note}
          onChange={(e) => update({ note: e.target.value })}
          placeholder={t('notePlaceholder')}
          aria-label={t('noteFor', { n })}
          maxLength={200}
          className={control}
        />
        <input
          value={row.groupName}
          onChange={(e) => update({ groupName: e.target.value })}
          placeholder={t('groupPlaceholder')}
          aria-label={t('groupFor', { n })}
          list="ingredient-groups"
          maxLength={80}
          className={control}
        />
        <div className="flex items-center gap-2 sm:col-span-2">
          <label className="flex flex-1 items-center gap-3 text-subhead">
            <Switch
              checked={row.optional}
              onCheckedChange={(v) => update({ optional: v })}
              label={t('optionalFor', { n })}
            />
            <span aria-hidden>{t('optional')}</span>
          </label>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={index === 0}
            aria-label={t('moveUp', { n })}
            className="grid size-11 place-items-center rounded-full bg-fill text-label hover:bg-fill-strong disabled:opacity-35"
          >
            <ChevronUp className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={index === count - 1}
            aria-label={t('moveDown', { n })}
            className="grid size-11 place-items-center rounded-full bg-fill text-label hover:bg-fill-strong disabled:opacity-35"
          >
            <ChevronDown className="size-5" />
          </button>
        </div>
      </div>
    </li>
  );
}
