import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    if (!payload) {
      return apiError('Invalid or expired token', 401);
    }

    // Get user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    return apiSuccess({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        image: user.image,
        locale: user.locale,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return apiError('Internal server error', 500);
  }
}
