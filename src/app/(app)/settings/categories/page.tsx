import { getTranslations } from 'next-intl/server';
import { KitchenList } from '@/components/settings/kitchen-list';
import { GroupNote, SettingsHeader } from '@/components/settings/rows';
import { requirePageUser } from '@/server/lib/session';
import { listCategories } from '@/server/services/recipes';

export async function generateMetadata() {
  const t = await getTranslations('settings.categories');
  return { title: t('title') };
}

export default async function CategoriesPage() {
  const user = await requirePageUser();
  const t = await getTranslations('settings');
  const items = listCategories(user.id).map((c) => ({ id: c.id, name: c.name }));
  return (
    <>
      <SettingsHeader title={t('categories.title')} back={t('back')} />
      <GroupNote className="mt-0">{t('categories.intro')}</GroupNote>
      <KitchenList type="categories" items={items} />
    </>
  );
}
