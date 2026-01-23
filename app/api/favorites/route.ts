import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { favorites, recipes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/favorites - Get all favorite recipes for authenticated user
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const userFavorites = await db.query.favorites.findMany({
      where: eq(favorites.userId, payload.userId),
      with: {
        recipe: {
          with: {
            ingredients: {
              orderBy: (ingredients, { asc }) => [asc(ingredients.order)],
            },
            instructions: {
              orderBy: (instructions, { asc }) => [asc(instructions.stepNumber)],
            },
          },
        },
      },
      orderBy: (favorites, { desc }) => [desc(favorites.createdAt)],
    });

    return apiSuccess(userFavorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST /api/favorites - Add recipe to favorites
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return apiError('Recipe ID is required', 400);
    }

    // Verify recipe exists and belongs to user
    const recipe = await db.query.recipes.findFirst({
      where: and(eq(recipes.id, recipeId), eq(recipes.userId, payload.userId)),
    });

    if (!recipe) {
      return apiError('Recipe not found', 404);
    }

    // Check if already favorited
    const existingFavorite = await db.query.favorites.findFirst({
      where: and(
        eq(favorites.userId, payload.userId),
        eq(favorites.recipeId, recipeId)
      ),
    });

    if (existingFavorite) {
      return apiError('Recipe already in favorites', 400);
    }

    // Add to favorites
    const [newFavorite] = await db.insert(favorites).values({
      userId: payload.userId,
      recipeId,
    }).returning();

    return apiSuccess(newFavorite, 'Recipe added to favorites');
  } catch (error) {
    console.error('Add favorite error:', error);
    return apiError('Internal server error', 500);
  }
}
