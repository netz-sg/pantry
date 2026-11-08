import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { shiftDays, today, weekDays, weekStart } from '@/lib/dates';
import { foodKey } from '@/lib/food-key';
import { planEntryInput, planEntryPatch } from '@/lib/schemas';
import { convert } from '@/lib/units';
import { getDb, type DB } from '../db';
import { mealPlanEntry, recipe } from '../db/schema';
import { AppError, notFound } from '../lib/errors';
import { checkRecipe, loadStock } from './availability';
import { consumeFromPantry } from './pantry';
import { logCooked, requireRecipe } from './recipes';
import { addShoppingItem } from './shopping';

export type PlanEntry = ReturnType<typeof listRange>[number];

export function listRange(userId: string, from: string, to: string, db: DB = getDb()) {
  return db.query.mealPlanEntry
    .findMany({
      where: and(
        eq(mealPlanEntry.userId, userId),
        gte(mealPlanEntry.date, from),
        lte(mealPlanEntry.date, to),
      ),
      with: {
        recipe: {
          columns: {
            id: true,
            title: true,
            imagePath: true,
            prepMinutes: true,
            cookMinutes: true,
            restMinutes: true,
            servings: true,
          },
        },
      },
      orderBy: [asc(mealPlanEntry.date), asc(mealPlanEntry.position), asc(mealPlanEntry.createdAt)],
    })
    .sync();
}

export function getWeek(userId: string, anyDay: string = today(), db: DB = getDb()) {
  const start = weekStart(anyDay);
  const days = weekDays(start);
  const entries = listRange(userId, days[0]!, days[6]!, db);
  return { start, days, entries };
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

export function addEntry(userId: string, raw: unknown, db: DB = getDb()) {
  const input = planEntryInput.parse(raw);
  const recipeId = assertRecipe(userId, input.recipeId, db);
  return db
    .insert(mealPlanEntry)
    .values({
      userId,
      date: input.date,
      slot: input.slot,
      recipeId,
      title: input.title ?? null,
      servings: input.servings,
      note: input.note ?? null,
    })
    .returning()
    .get();
}

export function updateEntry(userId: string, id: string, raw: unknown, db: DB = getDb()) {
  const patch = planEntryPatch.parse(raw);
  const res = db
    .update(mealPlanEntry)
    .set({
      ...(patch.date ? { date: patch.date } : {}),
      ...(patch.slot ? { slot: patch.slot } : {}),
      ...(patch.servings ? { servings: patch.servings } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      ...(patch.cooked !== undefined ? { cooked: patch.cooked } : {}),
    })
    .where(and(eq(mealPlanEntry.userId, userId), eq(mealPlanEntry.id, id)))
    .returning()
    .get();
  if (!res) throw notFound('Planeintrag');
  return res;
}

export function deleteEntry(userId: string, id: string, db: DB = getDb()) {
  const res = db
    .delete(mealPlanEntry)
    .where(and(eq(mealPlanEntry.userId, userId), eq(mealPlanEntry.id, id)))
    .run();
  if (!res.changes) throw notFound('Planeintrag');
}

/** Kopiert alle Einträge einer Woche in eine andere Woche. */
export function copyWeek(userId: string, fromStart: string, toStart: string, db: DB = getDb()) {
  const from = weekStart(fromStart);
  const to = weekStart(toStart);
  const entries = listRange(userId, from, shiftDays(from, 6), db);
  const offset = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
  db.transaction((tx) => {
    for (const e of entries) {
      tx.insert(mealPlanEntry)
        .values({
          userId,
          date: shiftDays(e.date, offset),
          slot: e.slot,
          recipeId: e.recipeId,
          title: e.title,
          servings: e.servings,
          note: e.note,
          position: e.position,
        })
        .run();
    }
  });
  return entries.length;
}

/**
 * Erzeugt die Einkaufsliste für einen Zeitraum. Gleiche Zutaten werden zusammengefasst,
 * der Vorrat wird abgezogen und bereits gekochte Einträge übersprungen.
 */
export function shoppingForRange(userId: string, from: string, to: string, db: DB = getDb()) {
  const entries = listRange(userId, from, to, db).filter((e) => e.recipeId && !e.cooked);
  const need = new Map<
    string,
    { name: string; amount: number | null; unit: string | null; recipeId: string }
  >();
  for (const e of entries) {
    const r = requireRecipe(userId, e.recipeId!, db);
    const factor = e.servings / r.servings;
    for (const i of r.ingredients) {
      if (i.optional) continue;
      const key = foodKey(i.name);
      const amount = i.amount == null ? null : i.amount * factor;
      const prev = need.get(key);
      if (!prev) {
        need.set(key, { name: i.name, amount, unit: i.unit, recipeId: r.id });
        continue;
      }
      if (prev.amount != null && amount != null) {
        const c = convert(amount, i.unit, prev.unit);
        if (c != null) prev.amount += c;
        else need.set(`${key}|${i.unit}`, { name: i.name, amount, unit: i.unit, recipeId: r.id });
      }
    }
  }
  const stock = loadStock(userId, db);
  const t = today();
  const list = [...need.values()];
  const avail = checkRecipe(list, 1, stock, t);
  let added = 0;
  db.transaction((tx) => {
    avail.checks.forEach((c, idx) => {
      if (c.status !== 'missing' && c.status !== 'partial') return;
      const item = list[idx]!;
      addShoppingItem(
        userId,
        { name: item.name, quantity: c.missingAmount, unit: item.unit, recipeId: item.recipeId },
        tx as unknown as DB,
      );
      added++;
    });
  });
  return added;
}

/** Markiert einen Planeintrag als gekocht, zieht Zutaten ab und schreibt den Kochverlauf. */
export function markCooked(userId: string, id: string, deduct: boolean, db: DB = getDb()) {
  const e = db
    .select()
    .from(mealPlanEntry)
    .where(and(eq(mealPlanEntry.userId, userId), eq(mealPlanEntry.id, id)))
    .get();
  if (!e) throw notFound('Planeintrag');
  db.update(mealPlanEntry).set({ cooked: true }).where(eq(mealPlanEntry.id, id)).run();
  if (e.recipeId) {
    const r = requireRecipe(userId, e.recipeId, db);
    logCooked(userId, r.id, e.servings, db);
    if (deduct) {
      const factor = e.servings / r.servings;
      consumeFromPantry(
        userId,
        r.ingredients
          .filter((i) => !i.optional)
          .map((i) => ({ name: i.name, unit: i.unit, amount: i.amount == null ? null : i.amount * factor })),
        db,
      );
    }
  }
}

function icsEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

const SLOT_TIME: Record<string, [string, string]> = {
  breakfast: ['080000', '083000'],
  lunch: ['123000', '131500'],
  dinner: ['190000', '200000'],
  snack: ['160000', '161500'],
};

/** Kalenderdatei für einen Zeitraum, z. B. zum Abonnieren in Apple Kalender. */
export function planToIcs(userId: string, from: string, to: string, appUrl: string, db: DB = getDb()) {
  const entries = listRange(userId, from, to, db);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pantry//Wochenplan//DE',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Pantry Wochenplan',
  ];
  for (const e of entries) {
    const d = e.date.replace(/-/g, '');
    const [s, en] = SLOT_TIME[e.slot] ?? ['120000', '130000'];
    const title = e.recipe?.title ?? e.title ?? 'Mahlzeit';
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}@pantry`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${d}T${s}`,
      `DTEND:${d}T${en}`,
      `SUMMARY:${icsEscape(title)}`,
      ...(e.recipeId ? [`URL:${appUrl}/recipes/${e.recipeId}`] : []),
      ...(e.note ? [`DESCRIPTION:${icsEscape(e.note)}`] : []),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
