import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { hasAnyUser } from '@/server/services/user';
import { SetupForm } from './setup-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('auth'))('setupTitle') };
}

export default async function SetupPage() {
  if (hasAnyUser()) redirect('/login');
  const t = await getTranslations('auth');
  return (
    <>
      <h1 className="headline text-[2.5rem]">{t('setupTitle')}</h1>
      <p className="mt-3 mb-8 text-callout text-label-2">{t('setupText')}</p>
      <SetupForm needsToken={Boolean(process.env.SETUP_TOKEN)} />
    </>
  );
}
