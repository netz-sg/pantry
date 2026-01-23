import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { recipes, recipeIngredients, recipeInstructions, favorites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/recipes/[id] - Get single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const { id } = await params;

    const recipe = await db.query.recipes.findFirst({
      where: and(eq(recipes.id, id), eq(recipes.userId, payload.userId)),
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
    });

    if (!recipe) {
      return apiError('Recipe not found', 404);
    }

    return apiSuccess(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT /api/recipes/[id] - Update recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await request.json();

    // Verify recipe exists and belongs to user
    const existingRecipe = await db.query.recipes.findFirst({
      where: and(eq(recipes.id, id), eq(recipes.userId, payload.userId)),
    });

    if (!existingRecipe) {
      return apiError('Recipe not found', 404);
    }

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

    // Update recipe
    await db.update(recipes)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id));

    // Update ingredients if provided
    if (ingredientsData !== undefined) {
      // Delete existing ingredients
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));

      // Insert new ingredients
      if (ingredientsData.length > 0) {
        await db.insert(recipeIngredients).values(
          ingredientsData.map((ing: any, index: number) => ({
            recipeId: id,
            nameDe: ing.nameDe,
            nameEn: ing.nameEn,
            amount: ing.amount,
            unit: ing.unit,
            order: index,
          }))
        );
      }
    }

    // Update instructions if provided
    if (instructionsData !== undefined) {
      // Delete existing instructions
      await db.delete(recipeInstructions).where(eq(recipeInstructions.recipeId, id));

      // Insert new instructions
      if (instructionsData.length > 0) {
        await db.insert(recipeInstructions).values(
          instructionsData.map((inst: any, index: number) => ({
            recipeId: id,
            stepNumber: index + 1,
            instructionDe: inst.instructionDe,
            instructionEn: inst.instructionEn,
          }))
        );
      }
    }

    // Fetch updated recipe
    const updatedRecipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: {
        ingredients: {
          orderBy: (ingredients, { asc }) => [asc(ingredients.order)],
        },
        instructions: {
          orderBy: (instructions, { asc }) => [asc(instructions.stepNumber)],
        },
      },
    });

    return apiSuccess(updatedRecipe, 'Recipe updated successfully');
  } catch (error) {
    console.error('Update recipe error:', error);
    return apiError('Internal server error', 500);
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const { id } = await params;

    // Verify recipe exists and belongs to user
    const existingRecipe = await db.query.recipes.findFirst({
      where: and(eq(recipes.id, id), eq(recipes.userId, payload.userId)),
    });

    if (!existingRecipe) {
      return apiError('Recipe not found', 404);
    }

    // Delete recipe (cascade will handle ingredients, instructions, etc.)
    await db.delete(recipes).where(eq(recipes.id, id));

    return apiSuccess({ id }, 'Recipe deleted successfully');
  } catch (error) {
    console.error('Delete recipe error:', error);
    return apiError('Internal server error', 500);
  }
}
