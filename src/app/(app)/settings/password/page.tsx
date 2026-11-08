import { getTranslations } from 'next-intl/server';
import { PasswordForm } from '@/components/settings/password-form';
import { SettingsHeader } from '@/components/settings/rows';
import { requirePageUser } from '@/server/lib/session';

export async function generateMetadata() {
  const t = await getTranslations('settings.password');
  return { title: t('title') };
}

export default async function PasswordPage() {
  const user = await requirePageUser();
  const t = await getTranslations('settings');
  return (
    <>
      <SettingsHeader title={t('password.title')} back={t('back')} />
      <PasswordForm username={user.username ?? ''} />
    </>
  );
}
