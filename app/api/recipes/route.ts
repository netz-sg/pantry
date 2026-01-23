import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { recipes, recipeIngredients, recipeInstructions, favorites } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/recipes - Get all recipes for authenticated user
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const userRecipes = await db.query.recipes.findMany({
      where: eq(recipes.userId, payload.userId),
      with: {
        ingredients: {
          orderBy: (ingredients, { asc }) => [asc(ingredients.order)],
        },
        instructions: {
          orderBy: (instructions, { asc }) => [asc(instructions.stepNumber)],
        },
        favorites: {
          where: eq(favorites.userId, payload.userId),
        },
      },
      orderBy: [desc(recipes.createdAt)],
    });

    return apiSuccess(userRecipes);
  } catch (error) {
    console.error('Get recipes error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      titleDe,
      titleEn,
      subtitleDe,
      subtitleEn,
      descriptionDe,
      descriptionEn,
      imageUrl,
      prepTime,
      cookTime,
      servings,
      calories,
      category,
      tags,
      isPublic,
      ingredients: ingredientsData,
      instructions: instructionsData,
    } = body;

    // Create recipe
    const [newRecipe] = await db.insert(recipes).values({
      userId: payload.userId,
      titleDe,
      titleEn,
      subtitleDe,
      subtitleEn,
      descriptionDe,
      descriptionEn,
      imageUrl,
      prepTime,
      cookTime,
      servings: servings || 2,
      calories,
      category,
      tags: tags || [],
      isPublic: isPublic || false,
    }).returning();

    // Create ingredients
    if (ingredientsData && ingredientsData.length > 0) {
      await db.insert(recipeIngredients).values(
        ingredientsData.map((ing: any, index: number) => ({
          recipeId: newRecipe.id,
          nameDe: ing.nameDe,
          nameEn: ing.nameEn,
          amount: ing.amount,
          unit: ing.unit,
          order: index,
        }))
      );
    }

    // Create instructions
    if (instructionsData && instructionsData.length > 0) {
      await db.insert(recipeInstructions).values(
        instructionsData.map((inst: any, index: number) => ({
          recipeId: newRecipe.id,
          stepNumber: index + 1,
          instructionDe: inst.instructionDe,
          instructionEn: inst.instructionEn,
        }))
      );
    }

    // Fetch complete recipe with relations
    const completeRecipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, newRecipe.id),
      with: {
        ingredients: {
          orderBy: (ingredients, { asc }) => [asc(ingredients.order)],
        },
        instructions: {
          orderBy: (instructions, { asc }) => [asc(instructions.stepNumber)],
        },
      },
    });

    return apiSuccess(completeRecipe, 'Recipe created successfully');
  } catch (error) {
    console.error('Create recipe error:', error);
    return apiError('Internal server error', 500);
  }
}
