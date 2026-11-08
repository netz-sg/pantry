import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PantryView } from '@/components/pantry/pantry-view';
import { isStateFilter, type PantryEntry } from '@/components/pantry/types';
import { today } from '@/lib/dates';
import { requirePageUser } from '@/server/lib/session';
import { listLocations, listPantry } from '@/server/services/pantry';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pantry');
  return { title: t('title') };
}

type Search = {
  loc?: string | string[];
  state?: string | string[];
  q?: string | string[];
  add?: string | string[];
};

const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined);

export default async function PantryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requirePageUser();
  const sp = await searchParams;
  const state = one(sp.state);
  const add = one(sp.add);
  const locations = listLocations(user.id).map((l) => ({ id: l.id, name: l.name, kind: l.kind }));
  const items: PantryEntry[] = listPantry(user.id).map((p) => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    initialQuantity: p.initialQuantity,
    unit: p.unit,
    minQuantity: p.minQuantity,
    expiresOn: p.expiresOn,
    purchasedOn: p.purchasedOn,
    barcode: p.barcode,
    note: p.note,
    locationId: p.locationId,
    locationName: p.location?.name ?? null,
    aisle: p.food?.aisle ?? null,
    level: p.level,
    low: p.low,
    expiry: p.expiry,
  }));
  return (
    <PantryView
      items={items}
      locations={locations}
      loc={one(sp.loc)}
      state={isStateFilter(state) ? state : undefined}
      q={one(sp.q)?.slice(0, 100)}
      initialAdd={add === undefined ? undefined : add.slice(0, 120)}
      todayKey={today()}
    />
  );
}
