import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { sql } from 'drizzle-orm';

export default async function RootPage() {
  const session = await auth();

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  // Check if any users exist
  const userCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  
  const hasUsers = userCount[0]?.count > 0;

  // If no users exist, redirect to signup (onboarding)
  if (!hasUsers) {
    redirect('/signup');
  }

  // If users exist but not authenticated, redirect to signin
  redirect('/signin');
}
