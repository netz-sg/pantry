'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'node:crypto';
import { getTranslations } from 'next-intl/server';
import { setupInput } from '@/lib/schemas';
import { getAuth } from '../auth';
import { toErrorPayload } from '../lib/errors';
import { logger } from '../lib/logger';
import { hasAnyUser } from '../services/user';

export type SetupState = { error?: string; fieldErrors?: Record<string, string[]> } | null;

function tokenOk(given: string | undefined) {
  const expected = process.env.SETUP_TOKEN;
  if (!expected) return true;
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Legt das einzige Konto an. Danach ist die Registrierung dauerhaft geschlossen. */
export async function setupAccount(_prev: SetupState, form: FormData): Promise<SetupState> {
  const t = await getTranslations('auth');
  if (hasAnyUser()) redirect('/login');
  const parsed = setupInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return toErrorPayload(parsed.error);
  if (!tokenOk(parsed.data.setupToken))
    return { error: t('wrongToken'), fieldErrors: { setupToken: [t('wrongToken')] } };
  try {
    await getAuth().api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: `${parsed.data.username.toLowerCase()}@pantry.local`,
        password: parsed.data.password,
        username: parsed.data.username,
      },
      headers: await headers(),
    });
  } catch (e) {
    logger.warn({ err: e }, 'Ersteinrichtung fehlgeschlagen');
    return { error: e instanceof Error ? e.message : t('setupDone') };
  }
  redirect('/');
}

export async function signOutAction() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect('/login');
}
