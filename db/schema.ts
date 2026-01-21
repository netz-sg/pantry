import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  image: text('image'),
  locale: text('locale').notNull().default('de'), // 'de' | 'en'
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Recipes Table
export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  titleDe: text('title_de'),
  titleEn: text('title_en'),
  subtitleDe: text('subtitle_de'),
  subtitleEn: text('subtitle_en'),
  descriptionDe: text('description_de'),
  descriptionEn: text('description_en'),
  imageUrl: text('image_url'),
  prepTime: integer('prep_time'), // minutes
  cookTime: integer('cook_time'), // minutes
  servings: integer('servings').notNull().default(2),
  calories: integer('calories'),
  category: text('category'), // 'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'asian', 'italian', etc.
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Recipe Ingredients Table (one-to-many with recipes)
export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  nameDe: text('name_de'),
  nameEn: text('name_en'),
  amount: real('amount').notNull(),
  unit: text('unit').notNull(), // 'g', 'kg', 'ml', 'L', 'TL', 'EL', 'Tasse', 'Stk', etc.
  order: integer('order').notNull().default(0), // for preserving ingredient order
});

// Recipe Instructions Table (one-to-many with recipes)
export const recipeInstructions = sqliteTable('recipe_instructions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  instructionDe: text('instruction_de'),
  instructionEn: text('instruction_en'),
});

// Favorites Table (many-to-many: users <-> recipes)
export const favorites = sqliteTable('favorites', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Meal Plans Table
export const mealPlans = sqliteTable('meal_plans', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id').notNull().references(() => recipes.id),
  date: text('date').notNull(), // ISO date string: 'YYYY-MM-DD'
  mealType: text('meal_type').notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  servings: integer('servings').notNull().default(2),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Pantry Items Table (User's inventory)
export const pantryItems = sqliteTable('pantry_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nameDe: text('name_de'),
  nameEn: text('name_en'),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  location: text('location'), // 'fridge', 'freezer', 'pantry', 'cabinet'
  category: text('category'), // 'produce', 'dairy', 'meat', 'grains', 'canned', 'spices', 'beverages', 'snacks', 'other'
  expiryDate: text('expiry_date'), // ISO date string, nullable
  icon: text('icon'), // emoji or icon identifier
  lowStockThreshold: real('low_stock_threshold'), // nullable, triggers low stock warning when quantity <= threshold
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Shopping List Table
export const shoppingListItems = sqliteTable('shopping_list_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nameDe: text('name_de'),
  nameEn: text('name_en'),
  quantity: real('quantity'),
  unit: text('unit'),
  checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
  recipeId: text('recipe_id').references(() => recipes.id), // optional link to recipe
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Categories Table
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Nullable for global categories
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  favorites: many(favorites),
  mealPlans: many(mealPlans),
  pantryItems: many(pantryItems),
  shoppingListItems: many(shoppingListItems),
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  ingredients: many(recipeIngredients),
  instructions: many(recipeInstructions),
  favorites: many(favorites),
  mealPlans: many(mealPlans),
  shoppingListItems: many(shoppingListItems),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
}));

export const recipeInstructionsRelations = relations(recipeInstructions, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeInstructions.recipeId],
    references: [recipes.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [favorites.recipeId],
    references: [recipes.id],
  }),
}));

export const mealPlansRelations = relations(mealPlans, ({ one }) => ({
  user: one(users, {
    fields: [mealPlans.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [mealPlans.recipeId],
    references: [recipes.id],
  }),
}));

export const pantryItemsRelations = relations(pantryItems, ({ one }) => ({
  user: one(users, {
    fields: [pantryItems.userId],
    references: [users.id],
  }),
}));

export const shoppingListItemsRelations = relations(shoppingListItems, ({ one }) => ({
  user: one(users, {
    fields: [shoppingListItems.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [shoppingListItems.recipeId],
    references: [recipes.id],
  }),
}));
