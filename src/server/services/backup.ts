import fs from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { pantryItemInput, recipeInput } from '@/lib/schemas';
import { getDb, getSqlite, type DB } from '../db';
import { mealPlanEntry, pantryItem, recipe, shoppingItem } from '../db/schema';
import { AppError } from '../lib/errors';
import { createPantryItem, listLocations, listPantry } from './pantry';
import { createRecipe, getRecipe } from './recipes';
import { addShoppingItem, listShopping } from './shopping';

export const EXPORT_VERSION = 2;

/** Exportiert alle eigenen Daten als JSON. Bilder bleiben als Pfad erhalten. */
export function exportData(userId: string, db: DB = getDb()) {
  const recipeIds = db.select({ id: recipe.id }).from(recipe).where(eq(recipe.userId, userId)).all();
  const recipes = recipeIds
    .map((r) => getRecipe(userId, r.id, db)!)
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      categoryName: r.category?.name ?? null,
      servings: r.servings,
      prepMinutes: r.prepMinutes,
      cookMinutes: r.cookMinutes,
      restMinutes: r.restMinutes,
      difficulty: r.difficulty,
      calories: r.calories,
      protein: r.protein,
      fat: r.fat,
      carbs: r.carbs,
      sourceUrl: r.sourceUrl,
      notes: r.notes,
      isFavorite: r.isFavorite,
      rating: r.rating,
      tags: r.tags,
      imagePath: r.imagePath,
      ingredients: r.ingredients.map((i) => ({
        groupName: i.groupName,
        amount: i.amount,
        unit: i.unit,
        name: i.name,
        note: i.note,
        optional: i.optional,
      })),
      steps: r.steps.map((s) => ({ text: s.text, timerSeconds: s.timerSeconds })),
    }));
  const locations = listLocations(userId, db);
  const pantry = listPantry(userId, {}, db).map((p) => ({
    name: p.name,
    quantity: p.quantity,
    unit: p.unit,
    location: p.location?.name ?? null,
    expiresOn: p.expiresOn,
    purchasedOn: p.purchasedOn,
    minQuantity: p.minQuantity,
    barcode: p.barcode,
    note: p.note,
  }));
  const shopping = listShopping(userId, db).map((s) => ({
    name: s.name,
    quantity: s.quantity,
    unit: s.unit,
    aisle: s.aisle,
    note: s.note,
    checked: s.checked,
  }));
  const plan = db
    .select()
    .from(mealPlanEntry)
    .where(eq(mealPlanEntry.userId, userId))
    .all()
    .map((e) => ({
      date: e.date,
      slot: e.slot,
      recipeId: e.recipeId,
      title: e.title,
      servings: e.servings,
      note: e.note,
      cooked: e.cooked,
    }));
  return {
    app: 'pantry',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    recipes,
    locations: locations.map((l) => l.name),
    pantry,
    shopping,
    plan,
  };
}

const importSchema = z.object({
  app: z.literal('pantry'),
  version: z.number().int().min(2).max(EXPORT_VERSION),
  recipes: z.array(z.record(z.string(), z.unknown())).max(5000).default([]),
  pantry: z.array(z.record(z.string(), z.unknown())).max(5000).default([]),
  shopping: z.array(z.record(z.string(), z.unknown())).max(5000).default([]),
  plan: z.array(z.record(z.string(), z.unknown())).max(20000).default([]),
});

/** Spielt einen JSON-Export ein. Vorhandene Daten bleiben erhalten, Rezepte kommen dazu. */
export function importData(userId: string, raw: unknown, db: DB = getDb()) {
  const parsed = importSchema.safeParse(raw);
  if (!parsed.success) throw new AppError('bad_request', 'Die Datei ist kein gültiger Pantry-Export');
  const data = parsed.data;
  const idMap = new Map<string, string>();
  const locations = listLocations(userId, db);
  let recipes = 0;
  let pantry = 0;
  db.transaction((tx) => {
    const t = tx as unknown as DB;
    for (const r of data.recipes) {
      const input = recipeInput.safeParse(r);
      if (!input.success) continue;
      const id = createRecipe(userId, input.data, {}, t);
      if (r.isFavorite === true) t.update(recipe).set({ isFavorite: true }).where(eq(recipe.id, id)).run();
      if (typeof r.id === 'string') idMap.set(r.id, id);
      recipes++;
    }
    for (const p of data.pantry) {
      const loc = locations.find((l) => l.name === p.location)?.id ?? null;
      const input = pantryItemInput.safeParse({ ...p, locationId: loc });
      if (!input.success) continue;
      createPantryItem(userId, input.data, t);
      pantry++;
    }
    for (const s of data.shopping) {
      if (s.checked === true) continue;
      try {
        addShoppingItem(
          userId,
          { name: s.name, quantity: s.quantity, unit: s.unit, aisle: s.aisle, note: s.note },
          t,
        );
      } catch {
        /* ungültigen Eintrag überspringen */
      }
    }
    for (const e of data.plan) {
      if (typeof e.date !== 'string' || typeof e.slot !== 'string') continue;
      const rid = typeof e.recipeId === 'string' ? (idMap.get(e.recipeId) ?? null) : null;
      if (!rid && typeof e.title !== 'string') continue;
      t.insert(mealPlanEntry)
        .values({
          userId,
          date: e.date,
          slot: e.slot as 'breakfast',
          recipeId: rid,
          title: typeof e.title === 'string' ? e.title : null,
          servings: typeof e.servings === 'number' ? e.servings : 2,
          note: typeof e.note === 'string' ? e.note : null,
          cooked: e.cooked === true,
        })
        .run();
    }
  });
  return { recipes, pantry };
}

/** Konsistente Kopie der laufenden Datenbank, auch im WAL-Modus. */
export async function backupDatabase(
  targetDir = path.join(path.dirname(process.env.DATABASE_PATH ?? './data/pantry.db'), 'backups'),
) {
  await fs.mkdir(targetDir, { recursive: true });
  const file = path.join(targetDir, `pantry-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
  getSqlite().prepare('VACUUM INTO ?').run(file);
  const all = (await fs.readdir(targetDir))
    .filter((f) => f.startsWith('pantry-') && f.endsWith('.db'))
    .sort();
  for (const old of all.slice(0, Math.max(0, all.length - 14)))
    await fs.rm(path.join(targetDir, old), { force: true });
  return file;
}

export function countData(userId: string, db: DB = getDb()) {
  const n = (t: typeof recipe | typeof pantryItem | typeof shoppingItem) =>
    db.select({ id: t.id }).from(t).where(eq(t.userId, userId)).all().length;
  return { recipes: n(recipe), pantry: n(pantryItem), shopping: n(shoppingItem) };
}
