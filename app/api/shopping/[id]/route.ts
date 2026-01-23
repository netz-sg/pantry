import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { shoppingListItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/shopping/[id] - Get single shopping list item
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

    const item = await db.query.shoppingListItems.findFirst({
      where: and(eq(shoppingListItems.id, id), eq(shoppingListItems.userId, payload.userId)),
      with: {
        recipe: true,
      },
    });

    if (!item) {
      return apiError('Shopping list item not found', 404);
    }

    return apiSuccess(item);
  } catch (error) {
    console.error('Get shopping list item error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT /api/shopping/[id] - Update shopping list item
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

    // Verify item exists and belongs to user
    const existingItem = await db.query.shoppingListItems.findFirst({
      where: and(eq(shoppingListItems.id, id), eq(shoppingListItems.userId, payload.userId)),
    });

    if (!existingItem) {
      return apiError('Shopping list item not found', 404);
    }

    const {
      nameDe,
      nameEn,
      quantity,
      unit,
      checked,
      recipeId,
    } = body;

    const [updatedItem] = await db.update(shoppingListItems)
      .set({
        nameDe,
        nameEn,
        quantity,
        unit,
        checked,
        recipeId,
        updatedAt: new Date(),
      })
      .where(eq(shoppingListItems.id, id))
      .returning();

    return apiSuccess(updatedItem, 'Shopping list item updated successfully');
  } catch (error) {
    console.error('Update shopping list item error:', error);
    return apiError('Internal server error', 500);
  }
}

// DELETE /api/shopping/[id] - Delete shopping list item
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

    // Verify item exists and belongs to user
    const existingItem = await db.query.shoppingListItems.findFirst({
      where: and(eq(shoppingListItems.id, id), eq(shoppingListItems.userId, payload.userId)),
    });

    if (!existingItem) {
      return apiError('Shopping list item not found', 404);
    }

    await db.delete(shoppingListItems).where(eq(shoppingListItems.id, id));

    return apiSuccess({ id }, 'Shopping list item deleted successfully');
  } catch (error) {
    console.error('Delete shopping list item error:', error);
    return apiError('Internal server error', 500);
  }
}
