import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { favorites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// DELETE /api/favorites/[id] - Remove recipe from favorites
// [id] can be either favorite ID or recipe ID
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

    // Try to find by favorite ID first
    let favorite = await db.query.favorites.findFirst({
      where: and(eq(favorites.id, id), eq(favorites.userId, payload.userId)),
    });

    // If not found, try by recipe ID
    if (!favorite) {
      favorite = await db.query.favorites.findFirst({
        where: and(eq(favorites.recipeId, id), eq(favorites.userId, payload.userId)),
      });
    }

    if (!favorite) {
      return apiError('Favorite not found', 404);
    }

    await db.delete(favorites).where(eq(favorites.id, favorite.id));

    return apiSuccess({ id: favorite.id }, 'Recipe removed from favorites');
  } catch (error) {
    console.error('Remove favorite error:', error);
    return apiError('Internal server error', 500);
  }
}
