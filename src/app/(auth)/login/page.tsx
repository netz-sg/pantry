import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSessionUser } from '@/server/lib/session';
import { hasAnyUser } from '@/server/services/user';
import { LoginForm } from './login-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('auth'))('loginTitle') };
}

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/');
  if (!hasAnyUser()) redirect('/setup');
  const t = await getTranslations('auth');
  return (
    <>
      <h1 className="headline text-[2.5rem]">{t('loginTitle')}</h1>
      <p className="mt-3 mb-8 text-callout text-label-2">{t('loginText')}</p>
      <LoginForm />
    </>
  );
}
