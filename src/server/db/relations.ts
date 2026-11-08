import { relations } from 'drizzle-orm';
import {
  category,
  cookLog,
  food,
  mealPlanEntry,
  pantryItem,
  pantryLocation,
  recipe,
  recipeIngredient,
  recipeStep,
  recipeTag,
  shoppingItem,
  tag,
} from './schema';

export const recipeRelations = relations(recipe, ({ one, many }) => ({
  category: one(category, { fields: [recipe.categoryId], references: [category.id] }),
  ingredients: many(recipeIngredient),
  steps: many(recipeStep),
  tags: many(recipeTag),
  cookLogs: many(cookLog),
}));

export const recipeIngredientRelations = relations(recipeIngredient, ({ one }) => ({
  recipe: one(recipe, { fields: [recipeIngredient.recipeId], references: [recipe.id] }),
  food: one(food, { fields: [recipeIngredient.foodId], references: [food.id] }),
}));

export const recipeStepRelations = relations(recipeStep, ({ one }) => ({
  recipe: one(recipe, { fields: [recipeStep.recipeId], references: [recipe.id] }),
}));

export const recipeTagRelations = relations(recipeTag, ({ one }) => ({
  recipe: one(recipe, { fields: [recipeTag.recipeId], references: [recipe.id] }),
  tag: one(tag, { fields: [recipeTag.tagId], references: [tag.id] }),
}));

export const tagRelations = relations(tag, ({ many }) => ({ recipes: many(recipeTag) }));
export const categoryRelations = relations(category, ({ many }) => ({ recipes: many(recipe) }));

export const cookLogRelations = relations(cookLog, ({ one }) => ({
  recipe: one(recipe, { fields: [cookLog.recipeId], references: [recipe.id] }),
}));

export const mealPlanRelations = relations(mealPlanEntry, ({ one }) => ({
  recipe: one(recipe, { fields: [mealPlanEntry.recipeId], references: [recipe.id] }),
}));

export const pantryItemRelations = relations(pantryItem, ({ one }) => ({
  location: one(pantryLocation, { fields: [pantryItem.locationId], references: [pantryLocation.id] }),
  food: one(food, { fields: [pantryItem.foodId], references: [food.id] }),
}));

export const pantryLocationRelations = relations(pantryLocation, ({ many }) => ({ items: many(pantryItem) }));

export const shoppingItemRelations = relations(shoppingItem, ({ one }) => ({
  recipe: one(recipe, { fields: [shoppingItem.recipeId], references: [recipe.id] }),
  food: one(food, { fields: [shoppingItem.foodId], references: [food.id] }),
}));
