import { z } from 'zod';
import { AISLES } from './aisles';

const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullish();

const optInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v == null ? null : typeof v === 'string' ? Number(v) : v),
    z.number().int().min(min).max(max).nullable(),
  );

const optNum = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v == null ? null : typeof v === 'string' ? Number(v.replace(',', '.')) : v),
    z.number().min(min).max(max).nullable(),
  );

export const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum im Format JJJJ-MM-TT');
export const idSchema = z.string().min(1).max(64);

export const ingredientInput = z.object({
  groupName: optText(80),
  amount: optNum(0, 100000),
  unit: optText(24),
  name: z.string().trim().min(1, 'Name fehlt').max(160),
  note: optText(200),
  optional: z.boolean().optional().default(false),
});

export const stepInput = z.object({
  text: z.string().trim().min(1).max(4000),
  timerSeconds: optInt(0, 60 * 60 * 24),
});

export const recipeInput = z.object({
  title: z.string().trim().min(1, 'Titel fehlt').max(200),
  description: optText(4000),
  categoryId: idSchema.nullish(),
  categoryName: optText(60),
  servings: z.coerce.number().int().min(1).max(100).default(4),
  prepMinutes: optInt(0, 100000),
  cookMinutes: optInt(0, 100000),
  restMinutes: optInt(0, 100000),
  difficulty: optInt(1, 3),
  calories: optInt(0, 100000),
  protein: optNum(0, 10000),
  fat: optNum(0, 10000),
  carbs: optNum(0, 10000),
  sourceUrl: z
    .union([z.url({ protocol: /^https?$/ }), z.literal('')])
    .transform((v) => v || null)
    .nullish(),
  notes: optText(4000),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  ingredients: z.array(ingredientInput).max(200).default([]),
  steps: z.array(stepInput).max(100).default([]),
});
export type RecipeInput = z.infer<typeof recipeInput>;

export const recipeListQuery = z.object({
  q: z.string().trim().max(200).optional(),
  categoryId: idSchema.optional(),
  tag: z.string().max(40).optional(),
  favorites: z.coerce.boolean().optional(),
  maxMinutes: z.coerce.number().int().min(1).max(10000).optional(),
  cookable: z.coerce.boolean().optional(),
  sort: z.enum(['recent', 'title', 'time', 'cooked']).default('recent'),
  limit: z.coerce.number().int().min(1).max(200).default(60),
  offset: z.coerce.number().int().min(0).default(0),
});
export type RecipeListQuery = z.infer<typeof recipeListQuery>;

export const mealSlot = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

export const planEntryInput = z
  .object({
    date: dateKey,
    slot: mealSlot,
    recipeId: idSchema.nullish(),
    title: optText(120),
    servings: z.coerce.number().int().min(1).max(50).default(2),
    note: optText(500),
  })
  .refine((v) => v.recipeId || v.title, { message: 'Rezept oder Titel angeben', path: ['title'] });
export type PlanEntryInput = z.infer<typeof planEntryInput>;

export const planEntryPatch = z.object({
  date: dateKey.optional(),
  slot: mealSlot.optional(),
  servings: z.coerce.number().int().min(1).max(50).optional(),
  note: optText(500),
  cooked: z.boolean().optional(),
});

export const pantryItemInput = z.object({
  name: z.string().trim().min(1, 'Name fehlt').max(120),
  quantity: z.coerce.number().min(0).max(100000).default(1),
  unit: z.string().trim().min(1).max(24).default('pc'),
  locationId: idSchema.nullish(),
  expiresOn: z
    .union([dateKey, z.literal('')])
    .transform((v) => v || null)
    .nullish(),
  purchasedOn: z
    .union([dateKey, z.literal('')])
    .transform((v) => v || null)
    .nullish(),
  minQuantity: optNum(0, 100000),
  barcode: z
    .string()
    .trim()
    .regex(/^\d{8,14}$/, 'Barcode besteht aus 8 bis 14 Ziffern')
    .or(z.literal(''))
    .transform((v) => v || null)
    .nullish(),
  note: optText(300),
});
export type PantryItemInput = z.infer<typeof pantryItemInput>;

export const shoppingItemInput = z.object({
  name: z.string().trim().min(1, 'Name fehlt').max(120),
  quantity: optNum(0, 100000),
  unit: optText(24),
  aisle: z.enum(AISLES).optional(),
  note: optText(300),
  recipeId: idSchema.nullish(),
});
export type ShoppingItemInput = z.infer<typeof shoppingItemInput>;

export const shoppingItemPatch = shoppingItemInput.partial().extend({ checked: z.boolean().optional() });

export const profileInput = z.object({
  name: z.string().trim().min(1).max(80),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Nur Buchstaben, Ziffern, Punkt, Strich und Unterstrich'),
});

export const preferencesInput = z.object({
  locale: z.enum(['de', 'en', 'zh']).optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
});

export const setupInput = z.object({
  name: z.string().trim().min(1, 'Name fehlt').max(80),
  username: profileInput.shape.username,
  password: z.string().min(8, 'Mindestens 8 Zeichen').max(128),
  setupToken: z.string().optional(),
});

export const importUrlInput = z.object({ url: z.url({ protocol: /^https?$/ }) });
