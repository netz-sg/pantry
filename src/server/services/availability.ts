import { eq } from 'drizzle-orm';
import { foodKey, keysMatch } from '@/lib/food-key';
import { convert } from '@/lib/units';
import { getDb, type DB } from '../db';
import { pantryItem } from '../db/schema';

export type IngredientStatus = 'ok' | 'partial' | 'missing' | 'unknown';

export interface IngredientCheck {
  status: IngredientStatus;
  /** Fehlende Menge in der Einheit der Zutat, wenn berechenbar */
  missingAmount: number | null;
  haveAmount: number | null;
}

export interface PantryStock {
  key: string;
  quantity: number;
  unit: string;
  expiresOn: string | null;
}

export function loadStock(userId: string, db: DB = getDb()): PantryStock[] {
  return db
    .select({
      name: pantryItem.name,
      quantity: pantryItem.quantity,
      unit: pantryItem.unit,
      expiresOn: pantryItem.expiresOn,
    })
    .from(pantryItem)
    .where(eq(pantryItem.userId, userId))
    .all()
    .map((r) => ({ key: foodKey(r.name), quantity: r.quantity, unit: r.unit, expiresOn: r.expiresOn }));
}

/** Prüft eine Zutat gegen den Vorrat. Abgelaufenes zählt nicht als vorhanden. */
export function checkIngredient(
  ing: { name: string; amount: number | null; unit: string | null; optional?: boolean },
  stock: PantryStock[],
  todayKey: string,
): IngredientCheck {
  const key = foodKey(ing.name);
  const matches = stock.filter(
    (s) => keysMatch(s.key, key) && s.quantity > 0 && (!s.expiresOn || s.expiresOn >= todayKey),
  );
  if (!matches.length) {
    return { status: ing.optional ? 'unknown' : 'missing', missingAmount: ing.amount, haveAmount: 0 };
  }
  if (ing.amount == null) return { status: 'ok', missingAmount: null, haveAmount: null };
  let have = 0;
  let comparable = false;
  for (const m of matches) {
    const c = convert(m.quantity, m.unit, ing.unit);
    if (c != null) {
      have += c;
      comparable = true;
    }
  }
  if (!comparable) return { status: 'ok', missingAmount: null, haveAmount: null };
  if (have + 1e-9 >= ing.amount) return { status: 'ok', missingAmount: 0, haveAmount: have };
  return { status: 'partial', missingAmount: ing.amount - have, haveAmount: have };
}

export interface RecipeAvailability {
  missingCount: number;
  missing: { name: string; amount: number | null; unit: string | null }[];
  checks: IngredientCheck[];
}

export function checkRecipe(
  ingredients: { name: string; amount: number | null; unit: string | null; optional?: boolean }[],
  factor: number,
  stock: PantryStock[],
  todayKey: string,
): RecipeAvailability {
  const checks = ingredients.map((i) =>
    checkIngredient({ ...i, amount: i.amount == null ? null : i.amount * factor }, stock, todayKey),
  );
  const missing = ingredients
    .map((i, idx) => ({ i, c: checks[idx]! }))
    .filter(({ c }) => c.status === 'missing' || c.status === 'partial')
    .map(({ i, c }) => ({ name: i.name, amount: c.missingAmount, unit: i.unit }));
  return { missingCount: missing.length, missing, checks };
}
