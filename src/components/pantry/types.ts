import type { ExpiryState } from '@/lib/dates';

/** Schlanker Vorratseintrag für die Oberfläche. */
export type PantryEntry = {
  id: string;
  name: string;
  quantity: number;
  initialQuantity: number | null;
  unit: string;
  minQuantity: number | null;
  expiresOn: string | null;
  purchasedOn: string | null;
  barcode: string | null;
  note: string | null;
  locationId: string | null;
  locationName: string | null;
  aisle: string | null;
  level: number;
  low: boolean;
  expiry: ExpiryState;
};

export type PantryPlace = { id: string; name: string; kind: string };

export type PantryStateFilter = 'urgent' | 'week' | 'low';

export function isStateFilter(v: unknown): v is PantryStateFilter {
  return v === 'urgent' || v === 'week' || v === 'low';
}

export function matchesState(p: PantryEntry, s: PantryStateFilter) {
  if (s === 'urgent') return p.expiry === 'expired' || p.expiry === 'soon';
  if (s === 'week') return p.expiry === 'week';
  return p.low;
}

/** Füllstand und „fast leer“ nach einer Mengenänderung neu berechnen, wie im Service. */
export function withQuantity(p: PantryEntry, quantity: number): PantryEntry {
  const q = Math.max(0, Math.round(quantity * 1000) / 1000);
  const initial = Math.max(q, p.initialQuantity ?? q);
  const level = initial > 0 ? Math.max(0, Math.min(1, q / initial)) : q > 0 ? 1 : 0;
  return {
    ...p,
    quantity: q,
    initialQuantity: initial,
    level,
    low: p.minQuantity != null && q <= p.minQuantity,
  };
}

/** Sinnvolle Schrittweite für Plus und Minus. */
export function stepFor(unit: string, quantity: number) {
  if (unit === 'g' || unit === 'ml') return quantity > 200 ? 50 : 10;
  if (unit === 'kg' || unit === 'l') return 0.25;
  if (unit === 'cl') return 5;
  return 1;
}

/** Ringfarbe nach Ablauf und Füllstand. */
export function ringColor(p: PantryEntry) {
  if (p.expiry === 'expired' || p.expiry === 'soon') return 'var(--red)';
  if (p.expiry === 'week' || p.low || p.quantity <= 0) return 'var(--orange)';
  return 'var(--green)';
}
