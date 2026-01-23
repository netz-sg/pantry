import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { shoppingListItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/shopping - Get all shopping list items for authenticated user
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const items = await db.query.shoppingListItems.findMany({
      where: eq(shoppingListItems.userId, payload.userId),
      orderBy: [desc(shoppingListItems.createdAt)],
      with: {
        recipe: true,
      },
    });

    return apiSuccess(items);
  } catch (error) {
    console.error('Get shopping list items error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST /api/shopping - Create new shopping list item
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      nameDe,
      nameEn,
      quantity,
      unit,
      checked,
      recipeId,
    } = body;

    const [newItem] = await db.insert(shoppingListItems).values({
      userId: payload.userId,
      nameDe,
      nameEn,
      quantity,
      unit,
      checked: checked || false,
      recipeId,
    }).returning();

    return apiSuccess(newItem, 'Shopping list item created successfully');
  } catch (error) {
    console.error('Create shopping list item error:', error);
    return apiError('Internal server error', 500);
  }
}
