import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { mealPlans } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// GET /api/planner - Get meal plans for authenticated user
// Query params: startDate, endDate (optional, YYYY-MM-DD format)
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereConditions = eq(mealPlans.userId, payload.userId);

    if (startDate && endDate) {
      whereConditions = and(
        eq(mealPlans.userId, payload.userId),
        gte(mealPlans.date, startDate),
        lte(mealPlans.date, endDate)
      ) as any;
    } else if (startDate) {
      whereConditions = and(
        eq(mealPlans.userId, payload.userId),
        gte(mealPlans.date, startDate)
      ) as any;
    }

    const plans = await db.query.mealPlans.findMany({
      where: whereConditions,
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
      orderBy: (mealPlans, { asc }) => [asc(mealPlans.date)],
    });

    return apiSuccess(plans);
  } catch (error) {
    console.error('Get meal plans error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST /api/planner - Create new meal plan
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      recipeId,
      date,
      mealType,
      servings,
      notes,
    } = body;

    if (!recipeId || !date || !mealType) {
      return apiError('Recipe ID, date, and meal type are required', 400);
    }

    const [newPlan] = await db.insert(mealPlans).values({
      userId: payload.userId,
      recipeId,
      date,
      mealType,
      servings: servings || 2,
      notes,
    }).returning();

    // Fetch complete meal plan with recipe
    const completePlan = await db.query.mealPlans.findFirst({
      where: eq(mealPlans.id, newPlan.id),
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

    return apiSuccess(completePlan, 'Meal plan created successfully');
  } catch (error) {
    console.error('Create meal plan error:', error);
    return apiError('Internal server error', 500);
  }
}
