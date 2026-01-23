import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { mealPlans } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/planner/[id] - Get single meal plan
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

    const plan = await db.query.mealPlans.findFirst({
      where: and(eq(mealPlans.id, id), eq(mealPlans.userId, payload.userId)),
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
    });

    if (!plan) {
      return apiError('Meal plan not found', 404);
    }

    return apiSuccess(plan);
  } catch (error) {
    console.error('Get meal plan error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT /api/planner/[id] - Update meal plan
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

    // Verify plan exists and belongs to user
    const existingPlan = await db.query.mealPlans.findFirst({
      where: and(eq(mealPlans.id, id), eq(mealPlans.userId, payload.userId)),
    });

    if (!existingPlan) {
      return apiError('Meal plan not found', 404);
    }

    const {
      recipeId,
      date,
      mealType,
      servings,
      notes,
    } = body;

    const [updatedPlan] = await db.update(mealPlans)
      .set({
        recipeId,
        date,
        mealType,
        servings,
        notes,
      })
      .where(eq(mealPlans.id, id))
      .returning();

    // Fetch complete meal plan with recipe
    const completePlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.id, id),
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
    });

    return apiSuccess(completePlan, 'Meal plan updated successfully');
  } catch (error) {
    console.error('Update meal plan error:', error);
    return apiError('Internal server error', 500);
  }
}

// DELETE /api/planner/[id] - Delete meal plan
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

    // Verify plan exists and belongs to user
    const existingPlan = await db.query.mealPlans.findFirst({
      where: and(eq(mealPlans.id, id), eq(mealPlans.userId, payload.userId)),
    });

    if (!existingPlan) {
      return apiError('Meal plan not found', 404);
    }

    await db.delete(mealPlans).where(eq(mealPlans.id, id));

    return apiSuccess({ id }, 'Meal plan deleted successfully');
  } catch (error) {
    console.error('Delete meal plan error:', error);
    return apiError('Internal server error', 500);
  }
}
