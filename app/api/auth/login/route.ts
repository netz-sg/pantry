import { NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError, generateToken } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return apiError('Username and password are required', 400);
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return apiError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return apiError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    return apiSuccess({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        image: user.image,
        locale: user.locale,
      },
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Internal server error', 500);
  }
}
