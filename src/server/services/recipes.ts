import { and, asc, desc, eq, inArray, isNotNull, lte, sql } from 'drizzle-orm';
import { today } from '@/lib/dates';
import { recipeInput, type RecipeInput, type RecipeListQuery } from '@/lib/schemas';
import { normalizeUnit } from '@/lib/units';
import { getDb, getSqlite, type DB } from '../db';
import { category, cookLog, recipe, recipeIngredient, recipeStep, recipeTag, tag } from '../db/schema';
import { AppError, notFound } from '../lib/errors';
import { checkRecipe, loadStock } from './availability';
import { ensureFood } from './foods';
import { deleteImage } from './media';

export type RecipeDetail = NonNullable<ReturnType<typeof getRecipe>>;
export type RecipeSummary = ReturnType<typeof listRecipes>['items'][number];

function ftsQuery(q: string) {
  const terms = q
    .toLowerCase()
    .replace(/["*():^]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .slice(0, 8);
  return terms.map((t) => `"${t}"*`).join(' ');
}

function indexRecipe(userId: string, recipeId: string, title: string, body: string) {
  const s = getSqlite();
  s.prepare('DELETE FROM recipe_search WHERE recipe_id = ?').run(recipeId);
  s.prepare('INSERT INTO recipe_search (recipe_id, user_id, title, body) VALUES (?, ?, ?, ?)').run(
    recipeId,
    userId,
    title,
    body,
  );
}

function searchIds(userId: string, q: string): string[] | null {
  const match = ftsQuery(q);
  if (!match) return null;
  const rows = getSqlite()
    .prepare(
      'SELECT recipe_id FROM recipe_search WHERE recipe_search MATCH ? AND user_id = ? ORDER BY rank LIMIT 500',
    )
    .all(match, userId) as { recipe_id: string }[];
  return rows.map((r) => r.recipe_id);
}

export function listRecipes(userId: string, query: Partial<RecipeListQuery> = {}, db: DB = getDb()) {
  const conds = [eq(recipe.userId, userId)];
  if (query.favorites) conds.push(eq(recipe.isFavorite, true));
  if (query.categoryId) conds.push(eq(recipe.categoryId, query.categoryId));
  if (query.maxMinutes)
    conds.push(
      lte(
        sql`coalesce(${recipe.prepMinutes},0) + coalesce(${recipe.cookMinutes},0) + coalesce(${recipe.restMinutes},0)`,
        query.maxMinutes,
      ),
    );
  if (query.q) {
    const ids = searchIds(userId, query.q);
    if (ids) {
      if (!ids.length) return { items: [], total: 0 };
      conds.push(inArray(recipe.id, ids));
    }
  }
  if (query.tag) {
    const t = db
      .select({ id: tag.id })
      .from(tag)
      .where(and(eq(tag.userId, userId), eq(tag.name, query.tag)))
      .get();
    if (!t) return { items: [], total: 0 };
    const ids = db
      .select({ id: recipeTag.recipeId })
      .from(recipeTag)
      .where(eq(recipeTag.tagId, t.id))
      .all()
      .map((r) => r.id);
    if (!ids.length) return { items: [], total: 0 };
    conds.push(inArray(recipe.id, ids));
  }

  const order =
    query.sort === 'title'
      ? [asc(recipe.title)]
      : query.sort === 'time'
        ? [asc(sql`coalesce(${recipe.prepMinutes},0) + coalesce(${recipe.cookMinutes},0)`)]
        : query.sort === 'cooked'
          ? [desc(recipe.lastCookedAt)]
          : [desc(recipe.createdAt)];

  const rows = db.query.recipe
    .findMany({
      where: and(...conds),
      orderBy: order,
      with: {
        category: { columns: { id: true, name: true } },
        ingredients: { columns: { name: true, amount: true, unit: true, optional: true } },
      },
    })
    .sync();

  const stock = loadStock(userId, db);
  const t = today();
  let items = rows.map((r) => {
    const avail = checkRecipe(r.ingredients, 1, stock, t);
    const { ingredients: _ing, ...rest } = r;
    return {
      ...rest,
      totalMinutes: (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0) + (r.restMinutes ?? 0),
      ingredientCount: r.ingredients.length,
      missingCount: avail.missingCount,
      missing: avail.missing.slice(0, 3).map((m) => m.name),
    };
  });
  if (query.cookable) items = items.filter((i) => i.ingredientCount > 0 && i.missingCount === 0);
  const total = items.length;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 60;
  return { items: items.slice(offset, offset + limit), total };
}

export function getRecipe(userId: string, id: string, db: DB = getDb()) {
  const r = db.query.recipe
    .findFirst({
      where: and(eq(recipe.id, id), eq(recipe.userId, userId)),
      with: {
        category: { columns: { id: true, name: true } },
        ingredients: { orderBy: [asc(recipeIngredient.position)] },
        steps: { orderBy: [asc(recipeStep.position)] },
        tags: { with: { tag: { columns: { name: true } } } },
      },
    })
    .sync();
  if (!r) return null;
  return { ...r, tags: r.tags.map((t) => t.tag.name) };
}

export function requireRecipe(userId: string, id: string, db: DB = getDb()) {
  const r = getRecipe(userId, id, db);
  if (!r) throw notFound('Rezept');
  return r;
}

function resolveCategory(userId: string, input: RecipeInput, db: DB): string | null {
  if (input.categoryName) {
    const name = input.categoryName.trim();
    const found = db
      .select({ id: category.id })
      .from(category)
      .where(and(eq(category.userId, userId), eq(category.name, name)))
      .get();
    if (found) return found.id;
    return db.insert(category).values({ userId, name, position: 99 }).returning({ id: category.id }).get().id;
  }
  if (input.categoryId) {
    const ok = db
      .select({ id: category.id })
      .from(category)
      .where(and(eq(category.userId, userId), eq(category.id, input.categoryId)))
      .get();
    if (!ok)
      throw new AppError('validation', 'Kategorie gibt es nicht', { categoryId: ['Unbekannte Kategorie'] });
    return ok.id;
  }
  return null;
}

function writeChildren(userId: string, recipeId: string, input: RecipeInput, db: DB) {
  db.delete(recipeIngredient).where(eq(recipeIngredient.recipeId, recipeId)).run();
  db.delete(recipeStep).where(eq(recipeStep.recipeId, recipeId)).run();
  db.delete(recipeTag).where(eq(recipeTag.recipeId, recipeId)).run();

  input.ingredients.forEach((ing, i) => {
    const f = ensureFood(userId, ing.name, db);
    db.insert(recipeIngredient)
      .values({
        recipeId,
        foodId: f.id,
        position: i,
        groupName: ing.groupName ?? null,
        amount: ing.amount ?? null,
        unit: normalizeUnit(ing.unit),
        name: ing.name,
        note: ing.note ?? null,
        optional: ing.optional ?? false,
      })
      .run();
  });
  input.steps.forEach((s, i) => {
    db.insert(recipeStep)
      .values({ recipeId, position: i, text: s.text, timerSeconds: s.timerSeconds ?? null })
      .run();
  });
  const names = [...new Set(input.tags.map((t) => t.trim()).filter(Boolean))];
  for (const name of names) {
    db.insert(tag).values({ userId, name }).onConflictDoNothing().run();
    const t = db
      .select({ id: tag.id })
      .from(tag)
      .where(and(eq(tag.userId, userId), eq(tag.name, name)))
      .get()!;
    db.insert(recipeTag).values({ recipeId, tagId: t.id }).onConflictDoNothing().run();
  }
  indexRecipe(
    userId,
    recipeId,
    input.title,
    [input.description, ...input.ingredients.map((i) => i.name), ...names, input.notes]
      .filter(Boolean)
      .join(' '),
  );
}

function baseValues(input: RecipeInput) {
  return {
    title: input.title,
    description: input.description ?? null,
    servings: input.servings,
    prepMinutes: input.prepMinutes ?? null,
    cookMinutes: input.cookMinutes ?? null,
    restMinutes: input.restMinutes ?? null,
    difficulty: input.difficulty ?? null,
    calories: input.calories ?? null,
    protein: input.protein ?? null,
    fat: input.fat ?? null,
    carbs: input.carbs ?? null,
    sourceUrl: input.sourceUrl ?? null,
    notes: input.notes ?? null,
  };
}

export function createRecipe(
  userId: string,
  raw: unknown,
  opts: { imagePath?: string | null } = {},
  db: DB = getDb(),
) {
  const input = recipeInput.parse(raw);
  return db.transaction((tx) => {
    const categoryId = resolveCategory(userId, input, tx as unknown as DB);
    const row = tx
      .insert(recipe)
      .values({ userId, ...baseValues(input), categoryId, imagePath: opts.imagePath ?? null })
      .returning({ id: recipe.id })
      .get();
    writeChildren(userId, row.id, input, tx as unknown as DB);
    return row.id;
  });
}

export async function updateRecipe(
  userId: string,
  id: string,
  raw: unknown,
  opts: { imagePath?: string | null } = {},
  db: DB = getDb(),
) {
  const input = recipeInput.parse(raw);
  const existing = requireRecipe(userId, id, db);
  db.transaction((tx) => {
    const categoryId = resolveCategory(userId, input, tx as unknown as DB);
    tx.update(recipe)
      .set({
        ...baseValues(input),
        categoryId,
        ...(opts.imagePath !== undefined ? { imagePath: opts.imagePath } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
      .run();
    writeChildren(userId, id, input, tx as unknown as DB);
  });
  if (opts.imagePath !== undefined && existing.imagePath && existing.imagePath !== opts.imagePath) {
    await deleteImage(existing.imagePath);
  }
}

export async function deleteRecipe(userId: string, id: string, db: DB = getDb()) {
  const existing = requireRecipe(userId, id, db);
  db.delete(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
    .run();
  getSqlite().prepare('DELETE FROM recipe_search WHERE recipe_id = ?').run(id);
  await deleteImage(existing.imagePath);
}

export function setFavorite(userId: string, id: string, value: boolean, db: DB = getDb()) {
  const res = db
    .update(recipe)
    .set({ isFavorite: value })
    .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
    .run();
  if (!res.changes) throw notFound('Rezept');
}

export function setRating(userId: string, id: string, rating: number | null, db: DB = getDb()) {
  if (rating != null && (rating < 1 || rating > 5)) throw new AppError('validation', 'Bewertung von 1 bis 5');
  const res = db
    .update(recipe)
    .set({ rating })
    .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
    .run();
  if (!res.changes) throw notFound('Rezept');
}

/** Merkt sich, dass gekocht wurde. Optional werden die Zutaten vom Vorrat abgezogen. */
export function logCooked(userId: string, id: string, servings: number, db: DB = getDb()) {
  requireRecipe(userId, id, db);
  db.transaction((tx) => {
    tx.insert(cookLog).values({ userId, recipeId: id, servings }).run();
    tx.update(recipe)
      .set({ cookCount: sql`${recipe.cookCount} + 1`, lastCookedAt: new Date() })
      .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
      .run();
  });
}

export function listCategories(userId: string, db: DB = getDb()) {
  return db
    .select()
    .from(category)
    .where(eq(category.userId, userId))
    .orderBy(asc(category.position), asc(category.name))
    .all();
}

export function createCategory(userId: string, name: string, db: DB = getDb()) {
  const n = name.trim();
  if (!n || n.length > 60) throw new AppError('validation', 'Name von 1 bis 60 Zeichen');
  db.insert(category).values({ userId, name: n, position: 99 }).onConflictDoNothing().run();
  return db
    .select()
    .from(category)
    .where(and(eq(category.userId, userId), eq(category.name, n)))
    .get()!;
}

export function deleteCategory(userId: string, id: string, db: DB = getDb()) {
  db.delete(category)
    .where(and(eq(category.userId, userId), eq(category.id, id)))
    .run();
}

export function listTags(userId: string, db: DB = getDb()) {
  return db
    .select({ name: tag.name, count: sql<number>`count(${recipeTag.recipeId})` })
    .from(tag)
    .leftJoin(recipeTag, eq(recipeTag.tagId, tag.id))
    .where(eq(tag.userId, userId))
    .groupBy(tag.id)
    .orderBy(asc(tag.name))
    .all();
}

export function recentlyCooked(userId: string, limit = 5, db: DB = getDb()) {
  return db
    .select({
      id: recipe.id,
      title: recipe.title,
      imagePath: recipe.imagePath,
      lastCookedAt: recipe.lastCookedAt,
    })
    .from(recipe)
    .where(and(eq(recipe.userId, userId), isNotNull(recipe.lastCookedAt)))
    .orderBy(desc(recipe.lastCookedAt))
    .limit(limit)
    .all();
}
