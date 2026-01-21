'use server';

import { db } from '@/db/drizzle';
import { shoppingListItems, recipes, recipeIngredients } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getShoppingList() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const items = await db.query.shoppingListItems.findMany({
    where: eq(shoppingListItems.userId, session.user.id),
    orderBy: [desc(shoppingListItems.createdAt)],
  });

  return items;
}

export async function addShoppingItem(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const nameDe = formData.get('nameDe') as string;
  const nameEn = formData.get('nameEn') as string;
  const quantity = parseFloat(formData.get('quantity') as string) || 1;
  const unit = formData.get('unit') as string;
  const recipeId = formData.get('recipeId') as string;

  await db.insert(shoppingListItems).values({
    userId: session.user.id,
    nameDe,
    nameEn,
    quantity,
    unit,
    checked: false,
    recipeId: recipeId || null,
  });

  revalidatePath('/shopping', 'page');
}

export async function toggleShoppingItem(itemId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const existingItem = await db.query.shoppingListItems.findFirst({
    where: and(eq(shoppingListItems.id, itemId), eq(shoppingListItems.userId, session.user.id)),
  });

  if (!existingItem) {
    throw new Error('Item not found or unauthorized');
  }

  await db
    .update(shoppingListItems)
    .set({ checked: !existingItem.checked })
    .where(eq(shoppingListItems.id, itemId));

  revalidatePath('/shopping', 'page');
}

export async function deleteShoppingItem(itemId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const existingItem = await db.query.shoppingListItems.findFirst({
    where: and(eq(shoppingListItems.id, itemId), eq(shoppingListItems.userId, session.user.id)),
  });

  if (!existingItem) {
    throw new Error('Item not found or unauthorized');
  }

  await db.delete(shoppingListItems).where(eq(shoppingListItems.id, itemId));

  revalidatePath('/shopping', 'page');
}

export async function clearCheckedItems() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await db
    .delete(shoppingListItems)
    .where(and(eq(shoppingListItems.userId, session.user.id), eq(shoppingListItems.checked, true)));

  revalidatePath('/shopping', 'page');
}

export async function generateFromRecipe(recipeId: string, servings: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Get recipe with ingredients
  const recipe = await db.query.recipes.findFirst({
    where: and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id)),
    with: {
      ingredients: {
        orderBy: (ingredients, { asc }) => [asc(ingredients.order)],
      },
    },
  });

  if (!recipe) {
    throw new Error('Recipe not found or unauthorized');
  }

  // Calculate scale factor
  const scale = servings / (recipe.servings || 1);

  // Add all ingredients to shopping list
  const shoppingItems = recipe.ingredients.map((ingredient) => ({
    userId: session.user.id,
    nameDe: ingredient.nameDe,
    nameEn: ingredient.nameEn,
    quantity: ingredient.amount * scale,
    unit: ingredient.unit,
    checked: false,
    recipeId: recipeId,
  }));

  await db.insert(shoppingListItems).values(shoppingItems);

  revalidatePath('/shopping', 'page');
}
