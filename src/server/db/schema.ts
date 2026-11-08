import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);
const updatedAt = () =>
  integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdate(() => new Date());

/* ------------------------------------------------------------------ */
/* Auth (Better-Auth)                                                  */
/* ------------------------------------------------------------------ */

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  username: text('username').unique(),
  displayUsername: text('display_username'),
  locale: text('locale', { enum: ['de', 'en', 'zh'] })
    .notNull()
    .default('de'),
  theme: text('theme', { enum: ['system', 'light', 'dark'] })
    .notNull()
    .default('system'),
  /** Geheimer Schlüssel für das Kalender-Abo, nur als Hash gespeichert */
  calendarTokenHash: text('calendar_token_hash').unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('session_user_idx').on(t.userId)],
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('account_user_idx').on(t.userId)],
);

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const rateLimit = sqliteTable('rate_limit', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull(),
  lastRequest: integer('last_request').notNull(),
});

/* ------------------------------------------------------------------ */
/* Katalog                                                             */
/* ------------------------------------------------------------------ */

/** Ein Lebensmittel, auf das Zutaten, Vorrat und Einkaufsliste verweisen. Grundlage für den Abgleich. */
export const food = sqliteTable(
  'food',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    /** Kleingeschrieben und ohne Sonderzeichen, für den Abgleich */
    key: text('key').notNull(),
    aisle: text('aisle').notNull().default('other'),
    defaultUnit: text('default_unit'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('food_user_key_uq').on(t.userId, t.key)],
);

export const category = sqliteTable(
  'category',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('category_user_name_uq').on(t.userId, t.name)],
);

export const tag = sqliteTable(
  'tag',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('tag_user_name_uq').on(t.userId, t.name)],
);

/* ------------------------------------------------------------------ */
/* Rezepte                                                             */
/* ------------------------------------------------------------------ */

export const recipe = sqliteTable(
  'recipe',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    categoryId: text('category_id').references(() => category.id, { onDelete: 'set null' }),
    servings: integer('servings').notNull().default(4),
    prepMinutes: integer('prep_minutes'),
    cookMinutes: integer('cook_minutes'),
    restMinutes: integer('rest_minutes'),
    difficulty: integer('difficulty'),
    calories: integer('calories'),
    protein: real('protein'),
    fat: real('fat'),
    carbs: real('carbs'),
    imagePath: text('image_path'),
    sourceUrl: text('source_url'),
    notes: text('notes'),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false),
    rating: integer('rating'),
    cookCount: integer('cook_count').notNull().default(0),
    lastCookedAt: integer('last_cooked_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('recipe_user_created_idx').on(t.userId, t.createdAt),
    index('recipe_user_fav_idx').on(t.userId, t.isFavorite),
    index('recipe_category_idx').on(t.categoryId),
  ],
);

export const recipeIngredient = sqliteTable(
  'recipe_ingredient',
  {
    id: id(),
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipe.id, { onDelete: 'cascade' }),
    foodId: text('food_id').references(() => food.id, { onDelete: 'set null' }),
    position: integer('position').notNull(),
    groupName: text('group_name'),
    amount: real('amount'),
    unit: text('unit'),
    name: text('name').notNull(),
    note: text('note'),
    optional: integer('optional', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [
    index('ingredient_recipe_idx').on(t.recipeId, t.position),
    index('ingredient_food_idx').on(t.foodId),
  ],
);

export const recipeStep = sqliteTable(
  'recipe_step',
  {
    id: id(),
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipe.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    text: text('text').notNull(),
    timerSeconds: integer('timer_seconds'),
  },
  (t) => [index('step_recipe_idx').on(t.recipeId, t.position)],
);

export const recipeTag = sqliteTable(
  'recipe_tag',
  {
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipe.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('recipe_tag_pk').on(t.recipeId, t.tagId), index('recipe_tag_tag_idx').on(t.tagId)],
);

export const cookLog = sqliteTable(
  'cook_log',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipe.id, { onDelete: 'cascade' }),
    servings: integer('servings').notNull(),
    cookedAt: integer('cooked_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('cook_log_user_idx').on(t.userId, t.cookedAt), index('cook_log_recipe_idx').on(t.recipeId)],
);

/* ------------------------------------------------------------------ */
/* Wochenplan                                                          */
/* ------------------------------------------------------------------ */

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const mealPlanEntry = sqliteTable(
  'meal_plan_entry',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Kalendertag als YYYY-MM-DD, ohne Zeitzone */
    date: text('date').notNull(),
    slot: text('slot', { enum: MEAL_SLOTS }).notNull(),
    recipeId: text('recipe_id').references(() => recipe.id, { onDelete: 'set null' }),
    /** Freier Text, z. B. „Essen gehen“, wenn kein Rezept verknüpft ist */
    title: text('title'),
    servings: integer('servings').notNull().default(2),
    note: text('note'),
    cooked: integer('cooked', { mode: 'boolean' }).notNull().default(false),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('meal_plan_user_date_idx').on(t.userId, t.date),
    index('meal_plan_recipe_idx').on(t.recipeId),
  ],
);

/* ------------------------------------------------------------------ */
/* Vorrat                                                              */
/* ------------------------------------------------------------------ */

export const pantryLocation = sqliteTable(
  'pantry_location',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    kind: text('kind', { enum: ['fridge', 'freezer', 'pantry', 'other'] })
      .notNull()
      .default('other'),
    position: integer('position').notNull().default(0),
  },
  (t) => [uniqueIndex('pantry_location_user_name_uq').on(t.userId, t.name)],
);

export const pantryItem = sqliteTable(
  'pantry_item',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    foodId: text('food_id').references(() => food.id, { onDelete: 'set null' }),
    locationId: text('location_id').references(() => pantryLocation.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    quantity: real('quantity').notNull().default(1),
    /** Menge bei Kauf, für die Füllstandsanzeige */
    initialQuantity: real('initial_quantity'),
    unit: text('unit').notNull().default('pc'),
    minQuantity: real('min_quantity'),
    expiresOn: text('expires_on'),
    purchasedOn: text('purchased_on'),
    barcode: text('barcode'),
    note: text('note'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('pantry_user_idx').on(t.userId),
    index('pantry_user_expiry_idx').on(t.userId, t.expiresOn),
    index('pantry_food_idx').on(t.foodId),
  ],
);

/* ------------------------------------------------------------------ */
/* Einkaufsliste                                                       */
/* ------------------------------------------------------------------ */

export const shoppingItem = sqliteTable(
  'shopping_item',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    foodId: text('food_id').references(() => food.id, { onDelete: 'set null' }),
    recipeId: text('recipe_id').references(() => recipe.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    quantity: real('quantity'),
    unit: text('unit'),
    aisle: text('aisle').notNull().default('other'),
    note: text('note'),
    checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
    checkedAt: integer('checked_at', { mode: 'timestamp_ms' }),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('shopping_user_checked_idx').on(t.userId, t.checked),
    index('shopping_recipe_idx').on(t.recipeId),
  ],
);

/* ------------------------------------------------------------------ */
/* Push-Abos                                                           */
/* ------------------------------------------------------------------ */

export const pushSubscription = sqliteTable(
  'push_subscription',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    lastNotifiedOn: text('last_notified_on'),
    createdAt: createdAt(),
  },
  (t) => [index('push_user_idx').on(t.userId)],
);

export type User = typeof user.$inferSelect;
export type Recipe = typeof recipe.$inferSelect;
export type RecipeIngredient = typeof recipeIngredient.$inferSelect;
export type RecipeStep = typeof recipeStep.$inferSelect;
export type MealPlanEntry = typeof mealPlanEntry.$inferSelect;
export type PantryItem = typeof pantryItem.$inferSelect;
export type PantryLocation = typeof pantryLocation.$inferSelect;
export type ShoppingItem = typeof shoppingItem.$inferSelect;
export type Category = typeof category.$inferSelect;
export type Tag = typeof tag.$inferSelect;
export type Food = typeof food.$inferSelect;
