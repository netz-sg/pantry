'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, ChevronDown, PackageCheck, Plus, ShoppingCart } from 'lucide-react';
import { type FormEvent, startTransition, useEffect, useId, useOptimistic, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Confirm } from '@/components/ui/confirm';
import { EmptyState } from '@/components/ui/empty-state';
import { Group } from '@/components/ui/list';
import { PageHeader } from '@/components/ui/page-header';
import { Ring } from '@/components/ui/ring';
import { unitLocale } from '@/components/pantry/shared';
import { callAction } from '@/lib/action-client';
import { AISLES, aisleLabel, classifyAisle } from '@/lib/aisles';
import { parseQuickAdd } from '@/lib/quantity';
import { cn } from '@/lib/utils';
import {
  clearCheckedShopping,
  deleteShoppingItem,
  finishShopping,
  quickAddShopping,
  restoreShoppingItem,
  setShoppingChecked,
} from '@/server/actions/shopping';
import { ShoppingItemSheet } from './item-sheet';
import { ShoppingRow } from './shopping-row';
import { isAisle, rowSeparator, type ShopItem } from './types';

type Op =
  | { type: 'check'; id: string; checked: boolean }
  | { type: 'remove'; id: string }
  | { type: 'removeChecked' }
  | { type: 'add'; item: ShopItem };

function reduce(state: ShopItem[], op: Op): ShopItem[] {
  switch (op.type) {
    case 'check':
      return state.map((s) => (s.id === op.id ? { ...s, checked: op.checked } : s));
    case 'remove':
      return state.filter((s) => s.id !== op.id);
    case 'removeChecked':
      return state.filter((s) => !s.checked);
    case 'add':
      return [...state, op.item];
  }
}

/** Wie lange ein abgehakter Eintrag an seinem Platz bleibt, bevor er nach unten rutscht. */
const LINGER_MS = 900;

export function ShoppingView({ items, initialAdd }: { items: ShopItem[]; initialAdd?: string }) {
  const t = useTranslations('shopping');
  const tc = useTranslations('common');
  const locale = unitLocale(useLocale());
  const [list, apply] = useOptimistic(items, reduce);
  const [linger, setLinger] = useState<Record<string, boolean>>({});
  const [showDone, setShowDone] = useState(true);
  const [editing, setEditing] = useState<ShopItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [text, setText] = useState(initialAdd ?? '');
  const [usedInitial, setUsedInitial] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const inputId = useId();
  const doneId = useId();

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((h) => clearTimeout(h));
  }, []);

  const open = list.filter((s) => !s.checked);
  const done = list.filter((s) => s.checked);
  const total = list.length;
  // Platzierung: kurz nach dem Tippen bleibt der Eintrag, wo er war
  const placedDone = (s: ShopItem) => linger[s.id] ?? s.checked;
  const openPlaced = list.filter((s) => !placedDone(s));
  const donePlaced = list.filter((s) => placedDone(s));

  const groups = AISLES.map((a) => ({
    aisle: a,
    rows: openPlaced.filter((s) => (isAisle(s.aisle) ? s.aisle : 'other') === a),
  })).filter((g) => g.rows.length);

  const toggle = (item: ShopItem) => {
    const next = !item.checked;
    setLinger((l) => ({ ...l, [item.id]: l[item.id] ?? item.checked }));
    const old = timers.current.get(item.id);
    if (old) clearTimeout(old);
    timers.current.set(
      item.id,
      setTimeout(() => {
        timers.current.delete(item.id);
        setLinger((l) => {
          const n = { ...l };
          delete n[item.id];
          return n;
        });
      }, LINGER_MS),
    );
    startTransition(async () => {
      apply({ type: 'check', id: item.id, checked: next });
      await callAction(setShoppingChecked(item.id, next));
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText('');
    const p = parseQuickAdd(value);
    startTransition(async () => {
      apply({
        type: 'add',
        item: {
          id: `tmp-${Date.now()}`,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          aisle: classifyAisle(p.name),
          note: p.note,
          checked: false,
          recipeId: null,
          recipeTitle: null,
        },
      });
      const res = await callAction(quickAddShopping(value));
      if (!res) setText((cur) => cur || value);
    });
    // Vorbefüllung aus der Adresse nur einmal verwenden, ohne die Seite neu aufzubauen
    if (initialAdd && !usedInitial) {
      setUsedInitial(true);
      window.history.replaceState(null, '', '/shopping');
    }
    inputRef.current?.focus();
  };

  const focusInput = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const edit = (item: ShopItem) => {
    if (item.id.startsWith('tmp-')) return;
    setEditing(item);
    setSheetOpen(true);
  };

  const remove = (item: ShopItem) => {
    setSheetOpen(false);
    startTransition(async () => {
      apply({ type: 'remove', id: item.id });
      await callAction(deleteShoppingItem(item.id), {
        success: t('deleted', { name: item.name }),
        undo: {
          label: tc('actions.undo'),
          run: () =>
            startTransition(async () => {
              apply({ type: 'add', item });
              await callAction(
                restoreShoppingItem({
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  aisle: isAisle(item.aisle) ? item.aisle : undefined,
                  note: item.note,
                  recipeId: item.recipeId,
                  checked: item.checked,
                }),
              );
            }),
        },
      });
    });
  };

  const finish = () => {
    startTransition(async () => {
      apply({ type: 'removeChecked' });
      const n = await callAction(finishShopping());
      if (n !== undefined) toast.success(t('finished', { count: n }));
    });
  };

  const clearDone = () => {
    startTransition(async () => {
      apply({ type: 'removeChecked' });
      const n = await callAction(clearCheckedShopping());
      if (n !== undefined) toast.success(t('cleared', { count: n }));
    });
  };

  const newRow = (
    <form
      onSubmit={submit}
      className={cn(
        'relative flex min-h-[3.25rem] items-center gap-3 pr-4 pl-4 focus-within:bg-fill/40',
        rowSeparator,
      )}
    >
      <span
        className="grid size-[23px] shrink-0 place-items-center rounded-full bg-tint text-on-tint"
        aria-hidden
      >
        <Plus className="size-[15px]" strokeWidth={3} />
      </span>
      <label htmlFor={inputId} className="sr-only">
        {t('newItemLabel')}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('newItem')}
        autoFocus={!!initialAdd}
        autoComplete="off"
        autoCapitalize="sentences"
        enterKeyHint="enter"
        maxLength={200}
        className="h-11 min-w-0 flex-1 bg-transparent text-body text-label outline-none placeholder:text-label-2"
      />
    </form>
  );

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={<span className="tabular">{t('summary', { open: open.length, done: done.length })}</span>}
        actions={
          <>
            {total && done.length ? (
              <Ring
                value={done.length / total}
                size={36}
                stroke={5}
                label={t('progress', { done: done.length, total })}
              />
            ) : null}
            <Button
              variant="plain"
              size="icon"
              className="text-[1.45rem]"
              onClick={focusInput}
              aria-label={t('addFocus')}
            >
              <Plus aria-hidden />
            </Button>
          </>
        }
      />

      {total === 0 ? (
        <EmptyState
          icon={<ShoppingCart />}
          title={t('emptyTitle')}
          text={t('emptyText')}
          action={
            <Link href="/plan" className={buttonVariants({ variant: 'tinted' })}>
              <CalendarDays aria-hidden /> {t('toPlan')}
            </Link>
          }
        />
      ) : null}

      {groups.map((g) => (
        <section key={g.aisle} aria-labelledby={`aisle-${g.aisle}`}>
          <h2 id={`aisle-${g.aisle}`} className="mx-5 mt-6 mb-2 text-title-2 font-bold text-tint md:mx-12">
            {aisleLabel(g.aisle, locale)}
          </h2>
          <Group>
            {g.rows.map((s) => (
              <ShoppingRow
                key={s.id}
                item={s}
                locale={locale}
                onToggle={() => toggle(s)}
                onEdit={() => edit(s)}
              />
            ))}
          </Group>
        </section>
      ))}

      {total > 0 && openPlaced.length === 0 ? (
        <div className="mx-5 mt-6 md:mx-12">
          <h2 className="text-title-2 font-bold">{t('allDoneTitle')}</h2>
          <p className="mt-1 text-subhead text-label-2">{t('allDoneText')}</p>
        </div>
      ) : null}

      <Group className={cn(total === 0 ? 'mt-2' : 'mt-3')}>{newRow}</Group>

      {donePlaced.length ? (
        <section aria-labelledby={`${doneId}-h`} className="mt-8">
          <div className="flex items-center justify-between gap-2 px-5 md:px-12">
            <h2 id={`${doneId}-h`} className="text-title-2 font-bold">
              <button
                type="button"
                onClick={() => setShowDone((v) => !v)}
                aria-expanded={showDone}
                aria-controls={doneId}
                className="-ml-1 flex min-h-11 items-center gap-1.5 rounded-lg px-1"
              >
                {t('done')}
                <span className="tabular font-semibold text-label-2">{done.length}</span>
                <ChevronDown
                  className={cn('size-5 text-label-2 transition-transform', !showDone && '-rotate-90')}
                  aria-hidden
                />
                <span className="sr-only">{showDone ? t('hideDone') : t('showDone')}</span>
              </button>
            </h2>
            <Confirm
              trigger={
                <Button variant="plain" className="h-11 px-2">
                  {t('clearDone')}
                </Button>
              }
              title={t('clearDoneTitle')}
              text={t('clearDoneText', { count: done.length })}
              confirmLabel={t('clearDone')}
              cancelLabel={tc('actions.cancel')}
              onConfirm={clearDone}
            />
          </div>
          <div id={doneId} hidden={!showDone}>
            <Group className="mt-2">
              {donePlaced.map((s) => (
                <ShoppingRow
                  key={s.id}
                  item={s}
                  locale={locale}
                  onToggle={() => toggle(s)}
                  onEdit={() => edit(s)}
                />
              ))}
            </Group>
          </div>
          <div className="mx-5 mt-4 flex flex-col gap-2 md:mx-12 md:flex-row md:items-center md:gap-4">
            <Button size="lg" onClick={finish} disabled={!done.length}>
              <PackageCheck aria-hidden /> {t('finish')}
            </Button>
            <p className="px-1 text-footnote text-label-2">{t('finishHint')}</p>
          </div>
        </section>
      ) : null}

      <ShoppingItemSheet
        item={editing}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDelete={remove}
        locale={locale}
      />
    </>
  );
}
