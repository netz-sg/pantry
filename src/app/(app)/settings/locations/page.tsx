import { getTranslations } from 'next-intl/server';
import { KitchenList } from '@/components/settings/kitchen-list';
import { GroupNote, SettingsHeader } from '@/components/settings/rows';
import { requirePageUser } from '@/server/lib/session';
import { listLocations } from '@/server/services/pantry';

export async function generateMetadata() {
  const t = await getTranslations('settings.locations');
  return { title: t('title') };
}

export default async function LocationsPage() {
  const user = await requirePageUser();
  const t = await getTranslations('settings');
  const items = listLocations(user.id).map((l) => ({ id: l.id, name: l.name, kind: l.kind }));
  return (
    <>
      <SettingsHeader title={t('locations.title')} back={t('back')} />
      <GroupNote className="mt-0">{t('locations.intro')}</GroupNote>
      <KitchenList type="locations" items={items} />
    </>
  );
}
