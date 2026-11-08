import { shiftDays, today, weekStart } from '@/lib/dates';
import { getDb, type DB } from '../db';
import { listPantry } from './pantry';
import { listRange } from './plan';
import { listRecipes } from './recipes';
import { listShopping } from './shopping';

/** Alles für die Startseite „Heute“ in einem Aufruf. */
export function getToday(userId: string, db: DB = getDb()) {
  const t = today();
  const monday = weekStart(t);
  const weekEntries = listRange(userId, monday, shiftDays(monday, 6), db);
  const entries = weekEntries.filter((e) => e.date === t);
  const pantry = listPantry(userId, {}, db);
  const expiring = pantry
    .filter((p) => p.expiry === 'expired' || p.expiry === 'soon' || p.expiry === 'week')
    .sort((a, b) => (a.expiresOn ?? '').localeCompare(b.expiresOn ?? ''))
    .slice(0, 5);
  const { items: all } = listRecipes(userId, { limit: 200 }, db);
  const cookable = all.filter((r) => r.ingredientCount > 0 && r.missingCount === 0).slice(0, 8);
  const almost = all.filter((r) => r.missingCount === 1).slice(0, 4);
  const shopping = listShopping(userId, db);
  const next =
    entries.find((e) => e.slot === 'dinner' && !e.cooked) ??
    entries.find((e) => !e.cooked && e.recipeId) ??
    null;
  return {
    date: t,
    entries,
    next,
    expiring,
    cookable: cookable.length ? cookable : almost,
    cookableIsAlmost: !cookable.length && almost.length > 0,
    week: { start: monday, entries: weekEntries },
    shopping: {
      /** Die ersten offenen Einträge für die Vorschau */
      preview: shopping
        .filter((s) => !s.checked)
        .slice(0, 5)
        .map((s) => ({ id: s.id, name: s.name, quantity: s.quantity, unit: s.unit })),
      open: shopping.filter((s) => !s.checked).length,
      done: shopping.filter((s) => s.checked).length,
    },
    pantry: {
      total: pantry.length,
      low: pantry.filter((p) => p.low).length,
      levels: pantry.slice(0, 8).map((p) => ({ level: p.level, expiry: p.expiry })),
    },
    recipeCount: all.length,
    /** Zuletzt angelegte Rezepte, für die Fotoreihe und das große Bild ohne Plan */
    recent: all.slice(0, 10),
  };
}
