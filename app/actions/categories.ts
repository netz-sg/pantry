'use server'

import { db } from '@/db/drizzle'
import { categories } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { CATEGORIES } from '@/lib/constants'

export interface CategoryOption {
  id: string;
  value: string;
  label: string;
  isSystem: boolean;
}

export async function getCategories(): Promise<CategoryOption[]> {
  const session = await auth()
  
  // Default categories mapped to options
  const defaultCategories = CATEGORIES.map(c => ({
    id: `default-${c.value}`,
    value: c.value, 
    label: c.labelDe,
    isSystem: true
  }));

  if (!session?.user?.id) {
    return defaultCategories; 
  }

  const userCategories = await db.select().from(categories).where(
    eq(categories.userId, session.user.id)
  )

  const userCatsMapped = userCategories.map(c => ({
      id: c.id,
      value: c.name, // Storage value is the name itself
      label: c.name,
      isSystem: false
  }))

  // Sort: System first, then user Alphabetical? Or all alphabetical?
  // Let's keep system first as per user mental model usually.
  
  return [...defaultCategories, ...userCatsMapped]
}

export async function createCategory(name: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Name required');

    // Check if it matches a default category (value or label)
    const normalized = trimmedName.toLowerCase();
    const isDefault = CATEGORIES.some(c => c.value === normalized || c.labelDe.toLowerCase() === normalized);
    
    // We allow "duplicate" if it's not exact system match, but ideally we should block.
    // If user types "Frühstück", we should probably just return the system one?
    // But RecipeForm expects a successful return.
    // Let's strictly check.
    if (isDefault) {
        // Just return as if created, but don't insert.
        // But the Caller expects a category object.
        // We'll throw so UI handles it? Or return the existing system cat?
        // Let's throw for now.
        return { error: 'Diese Kategorie existiert bereits als Systemkategorie.' };
    }

    // Check existing user category
    const existing = await db.query.categories.findFirst({
        where: and(
            eq(categories.name, trimmedName), 
            eq(categories.userId, session.user.id)
        )
    })

    if (existing) return { data: existing };

    const [newCat] = await db.insert(categories).values({
        name: trimmedName,
        userId: session.user.id
    }).returning()
    
    return { data: newCat }
}
