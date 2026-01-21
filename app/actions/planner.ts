'use server';

import { db } from '@/db/drizzle';
import { mealPlans, recipes } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getWeeklyPlan(startDate: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  // Calculate end date (7 days from start)
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const plans = await db.query.mealPlans.findMany({
    where: and(
      eq(mealPlans.userId, session.user.id),
      gte(mealPlans.date, startDate),
      lte(mealPlans.date, end.toISOString().split('T')[0])
    ),
    with: {
      recipe: {
        with: {
          ingredients: true,
          instructions: true,
        },
      },
    },
    orderBy: [desc(mealPlans.date)],
  });

  return plans;
}

export async function addMealPlan(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const recipeId = formData.get('recipeId') as string;
  const date = formData.get('date') as string;
  const mealType = formData.get('mealType') as string;
  const servings = parseInt(formData.get('servings') as string) || 1;

  // Verify recipe ownership
  const recipe = await db.query.recipes.findFirst({
    where: and(eq(recipes.id, recipeId), eq(recipes.userId, session.user.id)),
  });

  if (!recipe) {
    throw new Error('Recipe not found or unauthorized');
  }

  await db.insert(mealPlans).values({
    userId: session.user.id,
    recipeId,
    date,
    mealType,
    servings,
  });

  revalidatePath('/planner', 'page');
}

export async function removeMealPlan(planId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const plan = await db.query.mealPlans.findFirst({
    where: and(eq(mealPlans.id, planId), eq(mealPlans.userId, session.user.id)),
  });

  if (!plan) {
    throw new Error('Plan not found or unauthorized');
  }

  await db.delete(mealPlans).where(eq(mealPlans.id, planId));

  revalidatePath('/planner', 'page');
}

export async function generateWeeklyShoppingList(startDate: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const plans = await getWeeklyPlan(startDate);

  // Aggregate ingredients from all meal plans
  const ingredientMap: Map<
    string,
    { nameDe: string; nameEn: string; quantity: number; unit: string }
  > = new Map();

  for (const plan of plans) {
    if (!plan.recipe) continue;

    const scale = plan.servings / (plan.recipe.servings || 1);

    for (const ingredient of plan.recipe.ingredients || []) {
      const key = `${ingredient.nameDe}-${ingredient.unit}`;
      const existing = ingredientMap.get(key);

      if (existing) {
        existing.quantity += ingredient.amount * scale;
      } else {
        ingredientMap.set(key, {
          nameDe: ingredient.nameDe || '',
          nameEn: ingredient.nameEn || '',
          quantity: ingredient.amount * scale,
          unit: ingredient.unit,
        });
      }
    }
  }

  // Insert aggregated ingredients into shopping list
  const { shoppingListItems } = await import('@/db/schema');

  const shoppingItems = Array.from(ingredientMap.values()).map((item) => ({
    userId: session.user.id,
    nameDe: item.nameDe,
    nameEn: item.nameEn,
    quantity: item.quantity,
    unit: item.unit,
    checked: false,
    recipeId: null,
  }));

  if (shoppingItems.length > 0) {
    await db.insert(shoppingListItems).values(shoppingItems);
  }

  revalidatePath('/shopping', 'page');

  return shoppingItems.length;
}
