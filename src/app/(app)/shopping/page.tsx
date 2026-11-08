import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ShoppingView } from '@/components/shopping/shopping-view';
import type { ShopItem } from '@/components/shopping/types';
import { requirePageUser } from '@/server/lib/session';
import { listShopping } from '@/server/services/shopping';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('shopping');
  return { title: t('title') };
}

export default async function ShoppingPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[] }>;
}) {
  const user = await requirePageUser();
  const sp = await searchParams;
  const add = typeof sp.add === 'string' ? sp.add.slice(0, 200) : undefined;
  // Alles serverseitig laden, damit die Liste auch offline aus dem Cache lesbar ist
  const items: ShopItem[] = listShopping(user.id).map((s) => ({
    id: s.id,
    name: s.name,
    quantity: s.quantity,
    unit: s.unit,
    aisle: s.aisle,
    note: s.note,
    checked: s.checked,
    recipeId: s.recipe?.id ?? null,
    recipeTitle: s.recipe?.title ?? null,
  }));
  return <ShoppingView items={items} initialAdd={add || undefined} />;
}
