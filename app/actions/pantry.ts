'use server';

import { db } from '@/db/drizzle';
import { pantryItems } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getPantryItems() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const items = await db.query.pantryItems.findMany({
    where: eq(pantryItems.userId, session.user.id),
    orderBy: [desc(pantryItems.createdAt)],
  });

  return items;
}

export async function addPantryItem(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const nameDe = formData.get('nameDe') as string;
  const nameEn = formData.get('nameEn') as string;
  const quantity = parseFloat(formData.get('quantity') as string) || 1;
  const unit = formData.get('unit') as string;
  const location = formData.get('location') as string;
  const category = formData.get('category') as string;
  const icon = formData.get('icon') as string;
  const expiryDate = formData.get('expiryDate') as string;
  const lowStockThreshold = formData.get('lowStockThreshold') ? parseFloat(formData.get('lowStockThreshold') as string) : null;

  await db.insert(pantryItems).values({
    userId: session.user.id,
    nameDe,
    nameEn,
    quantity,
    unit,
    location,
    category: category || null,
    icon,
    expiryDate: expiryDate || null,
    lowStockThreshold,
  });

  revalidatePath('/pantry', 'page');
}

export async function updatePantryItem(itemId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const existingItem = await db.query.pantryItems.findFirst({
    where: and(eq(pantryItems.id, itemId), eq(pantryItems.userId, session.user.id)),
  });

  if (!existingItem) {
    throw new Error('Item not found or unauthorized');
  }

  const nameDe = formData.get('nameDe') as string;
  const nameEn = formData.get('nameEn') as string;
  const quantity = parseFloat(formData.get('quantity') as string) || 1;
  const unit = formData.get('unit') as string;
  const location = formData.get('location') as string;
  const category = formData.get('category') as string;
  const icon = formData.get('icon') as string;
  const expiryDate = formData.get('expiryDate') as string;
  const lowStockThreshold = formData.get('lowStockThreshold') ? parseFloat(formData.get('lowStockThreshold') as string) : null;

  await db
    .update(pantryItems)
    .set({
      nameDe,
      nameEn,
      quantity,
      unit,
      location,
      category: category || null,
      icon,
      expiryDate: expiryDate || null,
      lowStockThreshold,
    })
    .where(eq(pantryItems.id, itemId));

  revalidatePath('/pantry', 'page');
}

export async function updatePantryQuantity(itemId: string, delta: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const existingItem = await db.query.pantryItems.findFirst({
    where: and(eq(pantryItems.id, itemId), eq(pantryItems.userId, session.user.id)),
  });

  if (!existingItem) {
    throw new Error('Item not found or unauthorized');
  }

  const newQuantity = Math.max(0, existingItem.quantity + delta);

  await db
    .update(pantryItems)
    .set({ quantity: newQuantity })
    .where(eq(pantryItems.id, itemId));

  revalidatePath('/pantry', 'page');
}

export async function deletePantryItem(itemId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const existingItem = await db.query.pantryItems.findFirst({
    where: and(eq(pantryItems.id, itemId), eq(pantryItems.userId, session.user.id)),
  });

  if (!existingItem) {
    throw new Error('Item not found or unauthorized');
  }

  await db.delete(pantryItems).where(eq(pantryItems.id, itemId));

  revalidatePath('/pantry', 'page');
}
