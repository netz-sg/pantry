import { NextRequest } from 'next/server';
import { authenticateRequest, apiSuccess, apiError } from '@/lib/api-helpers';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// GET /api/user - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    return apiSuccess({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      image: user.image,
      locale: user.locale,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    if (!payload) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, email, image, locale, currentPassword, newPassword } = body;

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return apiError('Current password is required to set new password', 400);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return apiError('Current password is incorrect', 401);
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await db.update(users)
        .set({
          name,
          email,
          image,
          locale,
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, payload.userId));
    } else {
      // Update without password change
      await db.update(users)
        .set({
          name,
          email,
          image,
          locale,
          updatedAt: new Date(),
        })
        .where(eq(users.id, payload.userId));
    }

    // Fetch updated user
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    return apiSuccess({
      id: updatedUser!.id,
      username: updatedUser!.username,
      name: updatedUser!.name,
      email: updatedUser!.email,
      image: updatedUser!.image,
      locale: updatedUser!.locale,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    }, 'User profile updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    return apiError('Internal server error', 500);
  }
}
