'use server';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { signUpSchema, updateUserProfileSchema } from '@/lib/validations';
import { signIn } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  // Validate input
  const validationResult = signUpSchema.safeParse({
    email,
    password,
    name,
  });

  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0].message);
  }

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  await db.insert(users).values({
    email,
    passwordHash,
    name,
    locale: 'de',
  });

  // Sign in the user (this will throw NEXT_REDIRECT - which is expected)
  await signIn('credentials', {
    email,
    password,
    redirectTo: '/dashboard',
  });
}

export async function updateUserProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;

  const validationResult = updateUserProfileSchema.safeParse({
    name,
  });

  if (!validationResult.success) {
    throw new Error(validationResult.error.issues[0].message);
  }

  await db
    .update(users)
    .set({
      ...(name && { name }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath('/settings', 'page');
}

export async function signInUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/dashboard',
  });
}
