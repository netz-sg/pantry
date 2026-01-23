import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { pantryItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/pantry - Get all pantry items for authenticated user
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const items = await db.query.pantryItems.findMany({
      where: eq(pantryItems.userId, payload.userId),
      orderBy: [desc(pantryItems.createdAt)],
    });

    return apiSuccess(items);
  } catch (error) {
    console.error('Get pantry items error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST /api/pantry - Create new pantry item
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
      location,
      category,
      expiryDate,
      icon,
      lowStockThreshold,
    } = body;

    if (!quantity || !unit) {
      return apiError('Quantity and unit are required', 400);
    }

    const [newItem] = await db.insert(pantryItems).values({
      userId: payload.userId,
      nameDe,
      nameEn,
      quantity,
      unit,
      location,
      category,
      expiryDate,
      icon,
      lowStockThreshold,
    }).returning();

    return apiSuccess(newItem, 'Pantry item created successfully');
  } catch (error) {
    console.error('Create pantry item error:', error);
    return apiError('Internal server error', 500);
  }
}
