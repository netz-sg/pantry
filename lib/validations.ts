import { z } from 'zod';

// Auth Schemas
export const signUpSchema = z.object({
  username: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen lang sein'),
  password: z
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
});

export const signInSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

// Recipe Schemas
export const recipeIngredientSchema = z.object({
  nameDe: z.string().min(1, 'German name is required'),
  nameEn: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  order: z.number().int().default(0),
});

export const recipeInstructionSchema = z.object({
  stepNumber: z.number().int().positive('Step number must be positive'),
  instructionDe: z.string().min(1, 'German instruction is required'),
  instructionEn: z.string().optional(),
});

export const createRecipeSchema = z.object({
  titleDe: z.string().min(1, 'German title is required'),
  titleEn: z.string().optional(),
  subtitleDe: z.string().optional(),
  subtitleEn: z.string().optional(),
  descriptionDe: z.string().optional(),
  descriptionEn: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  prepTime: z.number().int().positive().optional(),
  cookTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().default(2),
  calories: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(recipeInstructionSchema).min(1, 'At least one instruction is required'),
});

export const updateRecipeSchema = createRecipeSchema.partial().extend({
  id: z.string().min(1, 'Recipe ID is required'),
});

// Pantry Schemas
export const createPantryItemSchema = z.object({
  nameDe: z.string().min(1, 'German name is required'),
  nameEn: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  location: z.enum(['fridge', 'freezer', 'pantry', 'cabinet']).optional(),
  expiryDate: z.string().optional(),
  icon: z.string().optional(),
});

export const updatePantryItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  quantity: z.number().positive('Quantity must be positive').optional(),
  nameDe: z.string().optional(),
  nameEn: z.string().optional(),
  unit: z.string().optional(),
  location: z.enum(['fridge', 'freezer', 'pantry', 'cabinet']).optional(),
  expiryDate: z.string().optional(),
  icon: z.string().optional(),
});

// Shopping List Schemas
export const createShoppingListItemSchema = z.object({
  nameDe: z.string().min(1, 'German name is required'),
  nameEn: z.string().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  recipeId: z.string().optional(),
});

export const updateShoppingListItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  checked: z.boolean().optional(),
  quantity: z.number().positive().optional(),
  nameDe: z.string().optional(),
  nameEn: z.string().optional(),
  unit: z.string().optional(),
});

// Meal Plan Schemas
export const createMealPlanSchema = z.object({
  recipeId: z.string().min(1, 'Recipe ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  servings: z.number().int().positive().default(2),
  notes: z.string().optional(),
});

export const updateMealPlanSchema = z.object({
  id: z.string().min(1, 'Meal plan ID is required'),
  servings: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

// User Schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z.string().min(3, 'Benutzername muss mindestens 3 Zeichen lang sein').optional(),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type CreatePantryItemInput = z.infer<typeof createPantryItemSchema>;
export type UpdatePantryItemInput = z.infer<typeof updatePantryItemSchema>;
export type CreateShoppingListItemInput = z.infer<typeof createShoppingListItemSchema>;
export type UpdateShoppingListItemInput = z.infer<typeof updateShoppingListItemSchema>;
export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof updateMealPlanSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
