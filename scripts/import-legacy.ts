/**
 * Übernimmt Daten aus einer Pantry-0.x-Datenbank in eine 2.0-Installation.
 *
 * Aufruf
 *   npm run import:legacy -- <pfad-zur-alten-pantry.db> [benutzername]
 *
 * Voraussetzung ist, dass in der neuen Installation bereits ein Konto eingerichtet ist.
 * Rezepte, Zutaten, Schritte, Favoriten, Vorrat, Einkaufsliste und Wochenplan werden übernommen.
 * Bilder unter /uploads werden aus public/uploads mitkopiert, wenn sie neben der alten Datenbank liegen.
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { getDb } from '../src/server/db';
import { mealPlanEntry, recipe, user } from '../src/server/db/schema';
import { createPantryItem } from '../src/server/services/pantry';
import { createRecipe } from '../src/server/services/recipes';
import { addShoppingItem } from '../src/server/services/shopping';
import { saveImage, saveImageFromUrl } from '../src/server/services/media';
import { normalizeUnit } from '../src/lib/units';

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

async function main() {
  const [file, wantedUser] = process.argv.slice(2);
  if (!file || !fs.existsSync(file)) {
    console.error(
      'Bitte den Pfad zur alten Datenbank angeben, z. B. npm run import:legacy -- ./data/legacy/pantry.db',
    );
    process.exit(1);
  }
  const old = new Database(file, { readonly: true });
  const db = getDb();
  const target = wantedUser
    ? db.select().from(user).where(eq(user.username, wantedUser.toLowerCase())).get()
    : db.select().from(user).get();
  if (!target) {
    console.error('In der neuen Installation gibt es noch kein Konto. Bitte zuerst einrichten.');
    process.exit(1);
  }
  const has = (t: string) =>
    Boolean(old.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(t));
  if (!has('recipes')) {
    console.error('Das sieht nicht nach einer Pantry-0.x-Datenbank aus.');
    process.exit(1);
  }

  const uploadsDir = path.join(path.dirname(path.resolve(file)), '..', 'public');
  const idMap = new Map<string, string>();
  const favorites = has('favorites')
    ? new Set((old.prepare('SELECT recipe_id FROM favorites').all() as Row[]).map((r) => String(r.recipe_id)))
    : new Set<string>();
  let recipes = 0;

  for (const r of old.prepare('SELECT * FROM recipes').all() as Row[]) {
    const ings = old
      .prepare('SELECT * FROM recipe_ingredients WHERE recipe_id = ? ORDER BY "order"')
      .all(r.id) as Row[];
    const steps = old
      .prepare('SELECT * FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number')
      .all(r.id) as Row[];
    let tags: string[] = [];
    try {
      tags = JSON.parse(String(r.tags ?? '[]')) as string[];
    } catch {
      tags = [];
    }
    let imagePath: string | null = null;
    const img = str(r.image_url) ?? str(r.image);
    if (img?.startsWith('/uploads/')) {
      const abs = path.join(uploadsDir, img);
      if (fs.existsSync(abs)) imagePath = await saveImage(target.id, fs.readFileSync(abs)).catch(() => null);
    } else if (img && /^https?:\/\//.test(img)) {
      imagePath = await saveImageFromUrl(target.id, img);
    }
    const id = createRecipe(
      target.id,
      {
        title: str(r.title_de) ?? str(r.title_en) ?? 'Rezept',
        description: str(r.description_de) ?? str(r.description_en),
        categoryName: str(r.category),
        servings: num(r.servings) ?? 4,
        prepMinutes: num(r.prep_time),
        cookMinutes: num(r.cook_time),
        calories: num(r.calories) || null,
        tags: tags.filter((t) => typeof t === 'string').slice(0, 30),
        ingredients: ings.map((i) => ({
          name: str(i.name_de) ?? str(i.name_en) ?? 'Zutat',
          amount: num(i.amount) || null,
          unit: normalizeUnit(str(i.unit)),
        })),
        steps: steps
          .map((s) => ({ text: str(s.instruction_de) ?? str(s.instruction_en) ?? '' }))
          .filter((s) => s.text),
      },
      { imagePath },
    );
    if (favorites.has(String(r.id)))
      db.update(recipe).set({ isFavorite: true }).where(eq(recipe.id, id)).run();
    idMap.set(String(r.id), id);
    recipes++;
  }

  let pantry = 0;
  if (has('pantry_items')) {
    for (const p of old.prepare('SELECT * FROM pantry_items').all() as Row[]) {
      try {
        createPantryItem(target.id, {
          name: str(p.name_de) ?? str(p.name_en) ?? 'Lebensmittel',
          quantity: num(p.quantity) ?? 1,
          unit: normalizeUnit(str(p.unit)) ?? 'pc',
          expiresOn: str(p.expiry_date)?.slice(0, 10) ?? null,
          minQuantity: num(p.low_stock_threshold),
        });
        pantry++;
      } catch {
        /* einzelne kaputte Zeile überspringen */
      }
    }
  }

  let shopping = 0;
  if (has('shopping_list_items')) {
    for (const s of old.prepare('SELECT * FROM shopping_list_items WHERE checked = 0').all() as Row[]) {
      try {
        addShoppingItem(target.id, {
          name: str(s.name_de) ?? str(s.name_en) ?? 'Eintrag',
          quantity: num(s.quantity),
          unit: str(s.unit),
        });
        shopping++;
      } catch {
        /* überspringen */
      }
    }
  }

  let plan = 0;
  if (has('meal_plans')) {
    for (const m of old.prepare('SELECT * FROM meal_plans').all() as Row[]) {
      const rid = idMap.get(String(m.recipe_id));
      const date = str(m.date)?.slice(0, 10);
      const slot = str(m.meal_type);
      if (!rid || !date || !slot || !['breakfast', 'lunch', 'dinner', 'snack'].includes(slot)) continue;
      db.insert(mealPlanEntry)
        .values({
          userId: target.id,
          date,
          slot: slot as 'dinner',
          recipeId: rid,
          servings: num(m.servings) ?? 2,
          note: str(m.notes),
        })
        .run();
      plan++;
    }
  }

  console.log(
    `Übernommen ${recipes} Rezepte, ${pantry} Vorratseinträge, ${shopping} Einkaufseinträge, ${plan} Planeinträge.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
