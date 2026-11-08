import { getDb, type DB } from '../db';
import { category, pantryLocation } from '../db/schema';

const CATEGORIES = [
  'Frühstück',
  'Mittagessen',
  'Abendessen',
  'Suppen',
  'Beilagen',
  'Snacks',
  'Desserts',
  'Backen',
];

const LOCATIONS = [
  { name: 'Kühlschrank', kind: 'fridge' as const },
  { name: 'Vorratsschrank', kind: 'pantry' as const },
  { name: 'Tiefkühler', kind: 'freezer' as const },
];

/** Legt Kategorien und Lagerorte für ein neues Konto an. */
export async function seedUserDefaults(userId: string, db: DB = getDb()) {
  db.insert(category)
    .values(CATEGORIES.map((name, i) => ({ userId, name, position: i })))
    .onConflictDoNothing()
    .run();
  db.insert(pantryLocation)
    .values(LOCATIONS.map((l, i) => ({ userId, ...l, position: i })))
    .onConflictDoNothing()
    .run();
}
