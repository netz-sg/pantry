import { getTranslations } from 'next-intl/server';
import { ProfileForm } from '@/components/settings/profile-form';
import { SettingsHeader } from '@/components/settings/rows';
import { requirePageUser } from '@/server/lib/session';
import { getUser } from '@/server/services/user';

export async function generateMetadata() {
  const t = await getTranslations('settings.profile');
  return { title: t('title') };
}

export default async function ProfilePage() {
  const session = await requirePageUser();
  const t = await getTranslations('settings');
  const user = getUser(session.id);
  return (
    <>
      <SettingsHeader title={t('profile.title')} back={t('back')} />
      <ProfileForm
        user={{
          name: user?.name ?? session.name,
          username: user?.displayUsername ?? user?.username ?? session.username ?? '',
          image: user?.image ?? null,
        }}
      />
    </>
  );
}
