import { and, asc, eq } from 'drizzle-orm';
import { expiryState, today } from '@/lib/dates';
import { foodKey, keysMatch } from '@/lib/food-key';
import { pantryItemInput } from '@/lib/schemas';
import { convert, normalizeUnit } from '@/lib/units';
import { getDb, type DB } from '../db';
import { pantryItem, pantryLocation } from '../db/schema';
import { AppError, notFound } from '../lib/errors';
import { ensureFood } from './foods';

export type PantryRow = ReturnType<typeof listPantry>[number];

export function listLocations(userId: string, db: DB = getDb()) {
  return db
    .select()
    .from(pantryLocation)
    .where(eq(pantryLocation.userId, userId))
    .orderBy(asc(pantryLocation.position))
    .all();
}

export function createLocation(
  userId: string,
  name: string,
  kind: 'fridge' | 'freezer' | 'pantry' | 'other' = 'other',
  db: DB = getDb(),
) {
  const n = name.trim();
  if (!n || n.length > 40) throw new AppError('validation', 'Name von 1 bis 40 Zeichen');
  db.insert(pantryLocation).values({ userId, name: n, kind, position: 50 }).onConflictDoNothing().run();
  return db
    .select()
    .from(pantryLocation)
    .where(and(eq(pantryLocation.userId, userId), eq(pantryLocation.name, n)))
    .get()!;
}

export function deleteLocation(userId: string, id: string, db: DB = getDb()) {
  db.delete(pantryLocation)
    .where(and(eq(pantryLocation.userId, userId), eq(pantryLocation.id, id)))
    .run();
}

function assertLocation(userId: string, locationId: string | null | undefined, db: DB) {
  if (!locationId) return null;
  const ok = db
    .select({ id: pantryLocation.id })
    .from(pantryLocation)
    .where(and(eq(pantryLocation.userId, userId), eq(pantryLocation.id, locationId)))
    .get();
  if (!ok)
    throw new AppError('validation', 'Lagerort gibt es nicht', { locationId: ['Unbekannter Lagerort'] });
  return ok.id;
}

export function listPantry(userId: string, filter: { locationId?: string } = {}, db: DB = getDb()) {
  const conds = [eq(pantryItem.userId, userId)];
  if (filter.locationId) conds.push(eq(pantryItem.locationId, filter.locationId));
  const rows = db.query.pantryItem
    .findMany({
      where: and(...conds),
      with: {
        location: { columns: { id: true, name: true, kind: true } },
        food: { columns: { aisle: true } },
      },
      orderBy: [asc(pantryItem.name)],
    })
    .sync();
  const t = today();
  return rows.map((r) => {
    const level =
      r.initialQuantity && r.initialQuantity > 0
        ? Math.max(0, Math.min(1, r.quantity / r.initialQuantity))
        : r.quantity > 0
          ? 1
          : 0;
    const low = r.minQuantity != null && r.quantity <= r.minQuantity;
    return { ...r, level, low, expiry: expiryState(r.expiresOn, t) };
  });
}

export function pantryStats(userId: string, db: DB = getDb()) {
  const items = listPantry(userId, {}, db);
  return {
    total: items.length,
    urgent: items.filter((i) => i.expiry === 'expired' || i.expiry === 'soon').length,
    week: items.filter((i) => i.expiry === 'week').length,
    low: items.filter((i) => i.low).length,
  };
}

export function createPantryItem(userId: string, raw: unknown, db: DB = getDb()) {
  const input = pantryItemInput.parse(raw);
  const locationId = assertLocation(userId, input.locationId, db);
  const f = ensureFood(userId, input.name, db);
  return db
    .insert(pantryItem)
    .values({
      userId,
      foodId: f.id,
      locationId,
      name: input.name,
      quantity: input.quantity,
      initialQuantity: input.quantity,
      unit: normalizeUnit(input.unit) ?? 'pc',
      minQuantity: input.minQuantity ?? null,
      expiresOn: input.expiresOn ?? null,
      purchasedOn: input.purchasedOn ?? today(),
      barcode: input.barcode ?? null,
      note: input.note ?? null,
    })
    .returning()
    .get();
}

export function updatePantryItem(userId: string, id: string, raw: unknown, db: DB = getDb()) {
  const input = pantryItemInput.parse(raw);
  const locationId = assertLocation(userId, input.locationId, db);
  const f = ensureFood(userId, input.name, db);
  const current = db
    .select()
    .from(pantryItem)
    .where(and(eq(pantryItem.userId, userId), eq(pantryItem.id, id)))
    .get();
  if (!current) throw notFound('Vorratseintrag');
  return db
    .update(pantryItem)
    .set({
      foodId: f.id,
      locationId,
      name: input.name,
      quantity: input.quantity,
      initialQuantity: Math.max(input.quantity, current.initialQuantity ?? 0) || input.quantity,
      unit: normalizeUnit(input.unit) ?? 'pc',
      minQuantity: input.minQuantity ?? null,
      expiresOn: input.expiresOn ?? null,
      purchasedOn: input.purchasedOn ?? current.purchasedOn,
      barcode: input.barcode ?? null,
      note: input.note ?? null,
    })
    .where(and(eq(pantryItem.userId, userId), eq(pantryItem.id, id)))
    .returning()
    .get();
}

export function adjustPantryQuantity(userId: string, id: string, delta: number, db: DB = getDb()) {
  const current = db
    .select()
    .from(pantryItem)
    .where(and(eq(pantryItem.userId, userId), eq(pantryItem.id, id)))
    .get();
  if (!current) throw notFound('Vorratseintrag');
  const quantity = Math.max(0, Math.round((current.quantity + delta) * 1000) / 1000);
  return db
    .update(pantryItem)
    .set({ quantity, initialQuantity: Math.max(quantity, current.initialQuantity ?? quantity) })
    .where(eq(pantryItem.id, id))
    .returning()
    .get();
}

export function deletePantryItem(userId: string, id: string, db: DB = getDb()) {
  const res = db
    .delete(pantryItem)
    .where(and(eq(pantryItem.userId, userId), eq(pantryItem.id, id)))
    .run();
  if (!res.changes) throw notFound('Vorratseintrag');
}

/**
 * Bucht eine Menge in den Vorrat. Gibt es das Lebensmittel schon mit passender Einheit,
 * wird die Menge addiert, sonst entsteht ein neuer Eintrag.
 */
export function addToPantry(
  userId: string,
  item: { name: string; quantity: number | null; unit: string | null },
  db: DB = getDb(),
) {
  const qty = item.quantity ?? 1;
  const unit = normalizeUnit(item.unit) ?? 'pc';
  const key = foodKey(item.name);
  const existing = db
    .select()
    .from(pantryItem)
    .where(eq(pantryItem.userId, userId))
    .all()
    .find((p) => foodKey(p.name) === key && convert(qty, unit, p.unit) != null);
  if (existing) {
    const add = convert(qty, unit, existing.unit)!;
    const quantity = existing.quantity + add;
    db.update(pantryItem)
      .set({
        quantity,
        initialQuantity: Math.max(quantity, existing.initialQuantity ?? 0),
        purchasedOn: today(),
      })
      .where(eq(pantryItem.id, existing.id))
      .run();
    return;
  }
  const f = ensureFood(userId, item.name, db);
  const loc = guessLocation(userId, f.aisle, db);
  db.insert(pantryItem)
    .values({
      userId,
      foodId: f.id,
      locationId: loc,
      name: item.name,
      quantity: qty,
      initialQuantity: qty,
      unit,
      purchasedOn: today(),
    })
    .run();
}

function guessLocation(userId: string, aisle: string, db: DB) {
  const locs = listLocations(userId, db);
  const want =
    aisle === 'frozen'
      ? 'freezer'
      : aisle === 'dairy' || aisle === 'meat' || aisle === 'produce'
        ? 'fridge'
        : 'pantry';
  return locs.find((l) => l.kind === want)?.id ?? locs[0]?.id ?? null;
}

/** Zieht Zutaten nach dem Kochen vom Vorrat ab. Was nicht passt, wird übersprungen. */
export function consumeFromPantry(
  userId: string,
  ingredients: { name: string; amount: number | null; unit: string | null }[],
  db: DB = getDb(),
) {
  const items = db.select().from(pantryItem).where(eq(pantryItem.userId, userId)).all();
  const t = today();
  let changed = 0;
  db.transaction((tx) => {
    for (const ing of ingredients) {
      if (ing.amount == null) continue;
      const key = foodKey(ing.name);
      let need = ing.amount;
      const candidates = items
        .filter((p) => keysMatch(foodKey(p.name), key) && p.quantity > 0)
        .sort((a, b) => (a.expiresOn ?? '9999').localeCompare(b.expiresOn ?? '9999'));
      for (const p of candidates) {
        if (need <= 0) break;
        if (p.expiresOn && p.expiresOn < t) continue;
        const needInItemUnit = convert(need, ing.unit, p.unit);
        if (needInItemUnit == null) continue;
        const take = Math.min(p.quantity, needInItemUnit);
        p.quantity = Math.round((p.quantity - take) * 1000) / 1000;
        tx.update(pantryItem).set({ quantity: p.quantity }).where(eq(pantryItem.id, p.id)).run();
        need -= convert(take, p.unit, ing.unit) ?? need;
        changed++;
      }
    }
  });
  return changed;
}
