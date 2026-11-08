import { and, asc, eq } from 'drizzle-orm';
import { AISLES, classifyAisle } from '@/lib/aisles';
import { today } from '@/lib/dates';
import { foodKey } from '@/lib/food-key';
import { parseQuickAdd } from '@/lib/quantity';
import { shoppingItemInput, shoppingItemPatch } from '@/lib/schemas';
import { convert, normalizeUnit } from '@/lib/units';
import { getDb, type DB } from '../db';
import { recipe, shoppingItem } from '../db/schema';
import { AppError, notFound } from '../lib/errors';
import { checkRecipe, loadStock } from './availability';
import { ensureFood } from './foods';
import { addToPantry, listPantry } from './pantry';
import { requireRecipe } from './recipes';

export type ShoppingRow = ReturnType<typeof listShopping>[number];

export function listShopping(userId: string, db: DB = getDb()) {
  const rows = db.query.shoppingItem
    .findMany({
      where: eq(shoppingItem.userId, userId),
      with: { recipe: { columns: { id: true, title: true } } },
      orderBy: [asc(shoppingItem.checked), asc(shoppingItem.position), asc(shoppingItem.createdAt)],
    })
    .sync();
  const order = new Map(AISLES.map((a, i) => [a as string, i]));
  return rows.sort((a, b) =>
    a.checked !== b.checked
      ? Number(a.checked) - Number(b.checked)
      : (order.get(a.aisle) ?? 99) - (order.get(b.aisle) ?? 99),
  );
}

function assertRecipe(userId: string, recipeId: string | null | undefined, db: DB) {
  if (!recipeId) return null;
  const r = db
    .select({ id: recipe.id })
    .from(recipe)
    .where(and(eq(recipe.userId, userId), eq(recipe.id, recipeId)))
    .get();
  if (!r) throw new AppError('validation', 'Rezept gibt es nicht', { recipeId: ['Unbekanntes Rezept'] });
  return r.id;
}

/**
 * Legt einen Eintrag an oder erhöht einen offenen Eintrag desselben Lebensmittels,
 * wenn sich die Einheiten umrechnen lassen.
 */
export function addShoppingItem(userId: string, raw: unknown, db: DB = getDb()) {
  const input = shoppingItemInput.parse(raw);
  const recipeId = assertRecipe(userId, input.recipeId, db);
  const unit = normalizeUnit(input.unit);
  const key = foodKey(input.name);
  const open = db
    .select()
    .from(shoppingItem)
    .where(and(eq(shoppingItem.userId, userId), eq(shoppingItem.checked, false)))
    .all()
    .find((s) => foodKey(s.name) === key);
  if (open) {
    let quantity = open.quantity;
    if (input.quantity != null) {
      if (open.quantity == null) quantity = input.quantity;
      else {
        const add = convert(input.quantity, unit, open.unit);
        if (add == null) quantity = null;
        else quantity = open.quantity + add;
      }
    }
    if (quantity !== null || open.quantity == null) {
      return db
        .update(shoppingItem)
        .set({ quantity, unit: open.unit ?? unit, recipeId: open.recipeId ?? recipeId })
        .where(eq(shoppingItem.id, open.id))
        .returning()
        .get();
    }
  }
  const f = ensureFood(userId, input.name, db);
  return db
    .insert(shoppingItem)
    .values({
      userId,
      foodId: f.id,
      recipeId,
      name: input.name,
      quantity: input.quantity ?? null,
      unit,
      aisle: input.aisle ?? (f.aisle !== 'other' ? f.aisle : classifyAisle(input.name)),
      note: input.note ?? null,
    })
    .returning()
    .get();
}

export function quickAddShopping(userId: string, text: string, db: DB = getDb()) {
  const t = text.trim();
  if (!t) throw new AppError('validation', 'Bitte etwas eingeben');
  const p = parseQuickAdd(t);
  return addShoppingItem(userId, { name: p.name, quantity: p.quantity, unit: p.unit, note: p.note }, db);
}

export function updateShoppingItem(userId: string, id: string, raw: unknown, db: DB = getDb()) {
  const patch = shoppingItemPatch.parse(raw);
  const current = db
    .select()
    .from(shoppingItem)
    .where(and(eq(shoppingItem.userId, userId), eq(shoppingItem.id, id)))
    .get();
  if (!current) throw notFound('Eintrag');
  const recipeId = patch.recipeId !== undefined ? assertRecipe(userId, patch.recipeId, db) : current.recipeId;
  return db
    .update(shoppingItem)
    .set({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.quantity !== undefined ? { quantity: patch.quantity } : {}),
      ...(patch.unit !== undefined ? { unit: normalizeUnit(patch.unit) } : {}),
      ...(patch.aisle !== undefined ? { aisle: patch.aisle } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      ...(patch.checked !== undefined
        ? { checked: patch.checked, checkedAt: patch.checked ? new Date() : null }
        : {}),
      recipeId,
    })
    .where(eq(shoppingItem.id, id))
    .returning()
    .get();
}

export function setChecked(userId: string, id: string, checked: boolean, db: DB = getDb()) {
  return updateShoppingItem(userId, id, { checked }, db);
}

export function deleteShoppingItem(userId: string, id: string, db: DB = getDb()) {
  const res = db
    .delete(shoppingItem)
    .where(and(eq(shoppingItem.userId, userId), eq(shoppingItem.id, id)))
    .run();
  if (!res.changes) throw notFound('Eintrag');
}

export function clearChecked(userId: string, db: DB = getDb()) {
  return db
    .delete(shoppingItem)
    .where(and(eq(shoppingItem.userId, userId), eq(shoppingItem.checked, true)))
    .run().changes;
}

/** Bucht alle abgehakten Einträge in den Vorrat und entfernt sie von der Liste. */
export function finishShopping(userId: string, db: DB = getDb()) {
  const done = db
    .select()
    .from(shoppingItem)
    .where(and(eq(shoppingItem.userId, userId), eq(shoppingItem.checked, true)))
    .all();
  db.transaction((tx) => {
    for (const s of done) {
      if (s.aisle === 'household') continue;
      addToPantry(userId, { name: s.name, quantity: s.quantity, unit: s.unit }, tx as unknown as DB);
    }
    tx.delete(shoppingItem)
      .where(and(eq(shoppingItem.userId, userId), eq(shoppingItem.checked, true)))
      .run();
  });
  return done.length;
}

/** Setzt fehlende Zutaten eines Rezepts auf die Liste, abzüglich des Vorrats. */
export function addMissingForRecipe(userId: string, recipeId: string, servings?: number, db: DB = getDb()) {
  const r = requireRecipe(userId, recipeId, db);
  const factor = servings ? servings / r.servings : 1;
  const stock = loadStock(userId, db);
  const avail = checkRecipe(r.ingredients, factor, stock, today());
  let added = 0;
  db.transaction((tx) => {
    for (const m of avail.missing) {
      addShoppingItem(
        userId,
        { name: m.name, quantity: m.amount, unit: m.unit, recipeId },
        tx as unknown as DB,
      );
      added++;
    }
  });
  return added;
}

/** Setzt Zutaten ohne Vorratsabgleich auf die Liste, z. B. „alle Zutaten“. */
export function addAllForRecipe(userId: string, recipeId: string, servings?: number, db: DB = getDb()) {
  const r = requireRecipe(userId, recipeId, db);
  const factor = servings ? servings / r.servings : 1;
  db.transaction((tx) => {
    for (const i of r.ingredients) {
      addShoppingItem(
        userId,
        { name: i.name, quantity: i.amount == null ? null : i.amount * factor, unit: i.unit, recipeId },
        tx as unknown as DB,
      );
    }
  });
  return r.ingredients.length;
}

/**
 * Setzt fast Leeres und Abgelaufenes aus dem Vorrat auf die Einkaufsliste.
 * Was schon offen auf der Liste steht, wird übersprungen.
 */
export function addRunningLowFromPantry(userId: string, db: DB = getDb()) {
  const open = new Set(
    listShopping(userId, db)
      .filter((s) => !s.checked)
      .map((s) => foodKey(s.name)),
  );
  const todo = listPantry(userId, {}, db).filter((p) => p.low || p.expiry === 'expired');
  let added = 0;
  db.transaction((tx) => {
    for (const p of todo) {
      const key = foodKey(p.name);
      if (open.has(key)) continue;
      open.add(key);
      addShoppingItem(
        userId,
        { name: p.name, quantity: p.initialQuantity ?? null, unit: p.unit },
        tx as unknown as DB,
      );
      added++;
    }
  });
  return added;
}
