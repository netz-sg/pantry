import { and, eq } from 'drizzle-orm';
import { classifyAisle } from '@/lib/aisles';
import { foodKey } from '@/lib/food-key';
import { getDb, type DB } from '../db';
import { food } from '../db/schema';

type Tx = Pick<DB, 'select' | 'insert' | 'update' | 'delete' | 'query'>;

/** Findet oder legt ein Lebensmittel im Katalog an. Gibt Id und Gang zurück. */
export function ensureFood(userId: string, name: string, tx: Tx = getDb()): { id: string; aisle: string } {
  const key = foodKey(name);
  const existing = tx
    .select({ id: food.id, aisle: food.aisle })
    .from(food)
    .where(and(eq(food.userId, userId), eq(food.key, key)))
    .get();
  if (existing) return existing;
  const aisle = classifyAisle(name);
  const row = tx
    .insert(food)
    .values({ userId, name: name.trim(), key, aisle })
    .onConflictDoNothing()
    .returning({ id: food.id, aisle: food.aisle })
    .get();
  if (row) return row;
  return tx
    .select({ id: food.id, aisle: food.aisle })
    .from(food)
    .where(and(eq(food.userId, userId), eq(food.key, key)))
    .get()!;
}

export function setFoodAisle(userId: string, foodId: string, aisle: string, db: DB = getDb()) {
  db.update(food)
    .set({ aisle })
    .where(and(eq(food.userId, userId), eq(food.id, foodId)))
    .run();
}
