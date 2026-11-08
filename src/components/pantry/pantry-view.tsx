'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Package, Plus, Search, ShoppingCart } from 'lucide-react';
import { startTransition, useOptimistic, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChipLink, ChipRow } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Group, GroupLabel } from '@/components/ui/list';
import { PageHeader } from '@/components/ui/page-header';
import { callAction } from '@/lib/action-client';
import { cn } from '@/lib/utils';
import {
  addLowToShopping,
  adjustPantryQuantity,
  createPantryItem,
  deletePantryItem,
} from '@/server/actions/pantry';
import { PantryItemSheet, type SheetState } from './item-sheet';
import { PantryRow, useExpiryText } from './pantry-row';
import { unitLocale } from './shared';
import {
  matchesState,
  withQuantity,
  type PantryEntry,
  type PantryPlace,
  type PantryStateFilter,
} from './types';

type Op =
  | { type: 'adjust'; id: string; delta: number }
  | { type: 'remove'; id: string }
  | { type: 'add'; item: PantryEntry };

function reduce(state: PantryEntry[], op: Op): PantryEntry[] {
  switch (op.type) {
    case 'adjust':
      return state.map((p) => (p.id === op.id ? withQuantity(p, p.quantity + op.delta) : p));
    case 'remove':
      return state.filter((p) => p.id !== op.id);
    case 'add':
      return [...state, op.item].sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function PantryView({
  items,
  locations,
  loc,
  state,
  q,
  initialAdd,
  todayKey,
}: {
  items: PantryEntry[];
  locations: PantryPlace[];
  loc?: string;
  state?: PantryStateFilter;
  q?: string;
  initialAdd?: string;
  todayKey: string;
}) {
  const t = useTranslations('pantry');
  const tc = useTranslations('common');
  const locale = unitLocale(useLocale());
  const router = useRouter();
  const expiryText = useExpiryText(todayKey);
  const [list, apply] = useOptimistic(items, reduce);
  const [search, setSearch] = useState(q ?? '');
  const [sheet, setSheet] = useState<SheetState | null>(
    initialAdd !== undefined ? { mode: 'add', name: initialAdd } : null,
  );
  const [sheetOpen, setSheetOpen] = useState(initialAdd !== undefined);

  const activeLoc = loc && locations.some((l) => l.id === loc) ? loc : undefined;

  /** Adresse für Filter, Suche bleibt erhalten. */
  const href = (p: { loc?: string; state?: PantryStateFilter }) => {
    const sp = new URLSearchParams();
    if (p.loc) sp.set('loc', p.loc);
    if (p.state) sp.set('state', p.state);
    if (search.trim()) sp.set('q', search.trim());
    const s = sp.toString();
    return s ? `/pantry?${s}` : '/pantry';
  };

  const inLoc = activeLoc ? list.filter((p) => p.locationId === activeLoc) : list;
  const urgent = inLoc.filter((p) => matchesState(p, 'urgent')).length;
  const week = inLoc.filter((p) => matchesState(p, 'week')).length;
  const low = inLoc.filter((p) => matchesState(p, 'low')).length;
  const restockCount = list.filter((p) => p.low || p.expiry === 'expired').length;
  const needle = search.trim().toLowerCase();
  const visible = inLoc.filter(
    (p) => (!state || matchesState(p, state)) && (!needle || p.name.toLowerCase().includes(needle)),
  );

  const groups = activeLoc
    ? [{ id: activeLoc, name: null as string | null, rows: visible }]
    : [
        ...locations.map((l) => ({
          id: l.id,
          name: l.name as string | null,
          rows: visible.filter((p) => p.locationId === l.id),
        })),
        {
          id: 'none',
          name: t('noLocation') as string | null,
          rows: visible.filter((p) => !p.locationId || !locations.some((l) => l.id === p.locationId)),
        },
      ].filter((g) => g.rows.length);

  const liveQuantity =
    sheet?.mode === 'edit' ? (list.find((p) => p.id === sheet.item.id)?.quantity ?? null) : null;

  /** ?add aus der Adresse entfernen, ohne die Seite neu aufzubauen. */
  const dropAddParam = () => {
    if (initialAdd === undefined) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('add')) return;
    url.searchParams.delete('add');
    window.history.replaceState(null, '', url.pathname + url.search);
  };

  const openAdd = () => {
    setSheet({ mode: 'add', name: '' });
    setSheetOpen(true);
  };

  const openEdit = (item: PantryEntry) => {
    setSheet({ mode: 'edit', item });
    setSheetOpen(true);
  };

  const onSheetOpenChange = (o: boolean) => {
    setSheetOpen(o);
    if (!o) dropAddParam();
  };

  const adjust = (item: PantryEntry, delta: number) => {
    if (!delta) return;
    startTransition(async () => {
      apply({ type: 'adjust', id: item.id, delta });
      await callAction(adjustPantryQuantity(item.id, delta));
    });
  };

  const remove = (item: PantryEntry) => {
    setSheetOpen(false);
    startTransition(async () => {
      apply({ type: 'remove', id: item.id });
      await callAction(deletePantryItem(item.id), {
        success: t('deleted', { name: item.name }),
        undo: {
          label: tc('actions.undo'),
          run: () =>
            startTransition(async () => {
              apply({ type: 'add', item });
              await callAction(
                createPantryItem({
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  locationId: item.locationId,
                  expiresOn: item.expiresOn ?? '',
                  purchasedOn: item.purchasedOn ?? '',
                  minQuantity: item.minQuantity,
                  barcode: item.barcode ?? '',
                  note: item.note,
                }),
              );
            }),
        },
      });
    });
  };

  const restock = () => {
    startTransition(async () => {
      const n = await callAction(addLowToShopping());
      if (n === undefined) return;
      toast.success(
        t('restocked', { count: n }),
        n ? { action: { label: t('toShopping'), onClick: () => router.push('/shopping') } } : undefined,
      );
    });
  };

  const summary = locations.length
    ? t('summary', { count: list.length, places: locations.length })
    : t('summaryNoPlaces', { count: list.length });

  const segItems = [
    { href: href({ state }), label: t('all'), active: !activeLoc },
    ...locations.map((l) => ({
      href: href({ loc: l.id, state }),
      label: l.name,
      active: activeLoc === l.id,
    })),
  ];

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={<span className="tabular">{summary}</span>}
        actions={
          <Button
            variant="plain"
            size="icon"
            className="text-[1.45rem]"
            onClick={openAdd}
            aria-label={t('add')}
          >
            <Plus aria-hidden />
          </Button>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title={t('emptyTitle')}
          text={t('emptyText')}
          action={
            <Button onClick={openAdd}>
              <Plus aria-hidden /> {t('add')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="relative mx-5 mt-2 md:mx-12">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-label-2"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              aria-label={t('search')}
              autoComplete="off"
              className="h-11 w-full rounded-[12px] bg-fill pr-3 pl-10 text-body text-label outline-none placeholder:text-label-2 focus:ring-2 focus:ring-tint/50"
            />
          </div>

          {locations.length ? (
            // Chips statt Segmenten, damit lange Namen wie Vorratsschrank nicht abgeschnitten werden
            <nav aria-label={t('locations')}>
              <ChipRow className="mt-3">
                {segItems.map((s) => (
                  <ChipLink key={s.href} href={s.href} active={s.active}>
                    {s.label}
                  </ChipLink>
                ))}
              </ChipRow>
            </nav>
          ) : null}

          <nav
            aria-label={t('alerts.label')}
            className="mx-5 mt-4 grid grid-cols-2 gap-3 md:mx-12 md:max-w-xl"
          >
            <AlertTile
              tone="red"
              count={urgent}
              label={t('alerts.urgent')}
              href={href({ loc: activeLoc, state: state === 'urgent' ? undefined : 'urgent' })}
              active={state === 'urgent'}
            />
            <AlertTile
              tone="orange"
              count={week}
              label={t('alerts.week')}
              href={href({ loc: activeLoc, state: state === 'week' ? undefined : 'week' })}
              active={state === 'week'}
            />
          </nav>

          <div
            className="mt-3 flex flex-wrap items-center gap-2 px-5 md:px-12"
            role="group"
            aria-label={t('filters.label')}
          >
            <ChipLink
              href={href({ loc: activeLoc, state: state === 'low' ? undefined : 'low' })}
              active={state === 'low'}
            >
              {t('filters.low')} <span className="tabular opacity-70">{low}</span>
            </ChipLink>
            {state && state !== 'low' ? (
              <ChipLink href={href({ loc: activeLoc, state })} active>
                {t(`filters.${state}`)}
              </ChipLink>
            ) : null}
            {state ? <ChipLink href={href({ loc: activeLoc })}>{t('filters.clear')}</ChipLink> : null}
            {restockCount ? (
              <Button variant="tinted" size="sm" className="ml-auto" onClick={restock}>
                <ShoppingCart aria-hidden /> {t('restock')}
              </Button>
            ) : null}
          </div>

          {groups.length === 0 ? (
            <EmptyState icon={<Search />} title={t('noResultsTitle')} text={t('noResultsText')} />
          ) : (
            groups.map((g, i) => (
              <section key={g.id} aria-label={g.name ?? undefined}>
                {g.name ? (
                  <GroupLabel className={cn(i === 0 && 'mt-5')}>{g.name}</GroupLabel>
                ) : (
                  <div className="h-4" />
                )}
                <Group>
                  {g.rows.map((p) => (
                    <PantryRow
                      key={p.id}
                      item={p}
                      locale={locale}
                      showLocation
                      expiry={expiryText(p)}
                      onEdit={() => openEdit(p)}
                      onAdjust={(d) => adjust(p, d)}
                    />
                  ))}
                </Group>
              </section>
            ))
          )}
        </>
      )}

      <PantryItemSheet
        state={sheet}
        open={sheetOpen}
        onOpenChange={onSheetOpenChange}
        locations={locations}
        defaultLocationId={activeLoc ?? null}
        liveQuantity={liveQuantity}
        onAdjust={adjust}
        onDelete={remove}
        onCreated={dropAddParam}
        locale={locale}
      />
    </>
  );
}

function AlertTile({
  tone,
  count,
  label,
  href,
  active,
}: {
  tone: 'red' | 'orange';
  count: number;
  label: string;
  href: string;
  active: boolean;
}) {
  const filled = count > 0;
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'relative grid min-h-[92px] content-between gap-2 overflow-hidden rounded-card px-4 py-3.5 transition-[transform,box-shadow] duration-200 active:scale-[0.97]',
        filled
          ? tone === 'red'
            ? 'bg-red bg-[linear-gradient(150deg,#ff5a47,var(--red)_60%)] text-on-red shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_14px_28px_-16px_rgba(0,0,0,0.5)]'
            : 'bg-orange bg-[linear-gradient(150deg,#ffc24d,var(--orange)_60%)] text-on-orange shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_28px_-16px_rgba(0,0,0,0.4)]'
          : tone === 'red'
            ? 'bg-red-soft text-red'
            : 'bg-orange-soft text-orange',
        active && 'ring-[3px] ring-label/25 ring-offset-2 ring-offset-bg',
      )}
    >
      <b className="tabular text-[2.25rem] leading-none font-extrabold tracking-[-0.04em]">{count}</b>
      <span className="text-footnote leading-tight font-semibold">{label}</span>
    </Link>
  );
}
