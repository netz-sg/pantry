import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getAuth } from '../auth';
import { AppError } from './errors';

export type SessionUser = {
  id: string;
  name: string;
  username?: string | null;
  displayUsername?: string | null;
  image?: string | null;
  locale?: string;
  theme?: string;
};

/** Liest die Session der aktuellen Anfrage. Einmal pro Render zwischengespeichert. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const s = await getAuth().api.getSession({ headers: await headers() });
  return (s?.user as SessionUser | undefined) ?? null;
});

/** Für Seiten. Ohne Login geht es zur Anmeldung. */
export async function requirePageUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect('/login');
  return u;
}

/** Für Server Actions. Ohne Login gibt es einen Fehler statt einer Weiterleitung. */
export async function requireActionUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw new AppError('unauthorized', 'Bitte melde dich an');
  return u;
}

/** Für API-Routen. Akzeptiert Session-Cookie und Bearer-Token. */
export async function requireApiUser(req: Request): Promise<SessionUser> {
  const s = await getAuth().api.getSession({ headers: req.headers });
  if (!s?.user) throw new AppError('unauthorized', 'Nicht angemeldet');
  return s.user as SessionUser;
}
