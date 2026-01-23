import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { pantryItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/pantry/[id] - Get single pantry item
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

    const item = await db.query.pantryItems.findFirst({
      where: and(eq(pantryItems.id, id), eq(pantryItems.userId, payload.userId)),
    });

    if (!item) {
      return apiError('Pantry item not found', 404);
    }

    return apiSuccess(item);
  } catch (error) {
    console.error('Get pantry item error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT /api/pantry/[id] - Update pantry item
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
    const existingItem = await db.query.pantryItems.findFirst({
      where: and(eq(pantryItems.id, id), eq(pantryItems.userId, payload.userId)),
    });

    if (!existingItem) {
      return apiError('Pantry item not found', 404);
    }

    const {
      nameDe,
      nameEn,
      quantity,
      unit,
      location,
      category,
      expiryDate,
      icon,
      lowStockThreshold,
    } = body;

    const [updatedItem] = await db.update(pantryItems)
      .set({
        nameDe,
        nameEn,
        quantity,
        unit,
        location,
        category,
        expiryDate,
        icon,
        lowStockThreshold,
        updatedAt: new Date(),
      })
      .where(eq(pantryItems.id, id))
      .returning();

    return apiSuccess(updatedItem, 'Pantry item updated successfully');
  } catch (error) {
    console.error('Update pantry item error:', error);
    return apiError('Internal server error', 500);
  }
}

// DELETE /api/pantry/[id] - Delete pantry item
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
    const existingItem = await db.query.pantryItems.findFirst({
      where: and(eq(pantryItems.id, id), eq(pantryItems.userId, payload.userId)),
    });

    if (!existingItem) {
      return apiError('Pantry item not found', 404);
    }

    await db.delete(pantryItems).where(eq(pantryItems.id, id));

    return apiSuccess({ id }, 'Pantry item deleted successfully');
  } catch (error) {
    console.error('Delete pantry item error:', error);
    return apiError('Internal server error', 500);
  }
}
