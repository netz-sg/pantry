import { apiRoute, readJson } from '@/server/lib/api';
import { getUser, updatePreferences, updateProfile } from '@/server/services/user';
import { AppError } from '@/server/lib/errors';

function publicUser(id: string) {
  const u = getUser(id);
  if (!u) throw new AppError('not_found', 'Konto nicht gefunden');
  return {
    id: u.id,
    name: u.name,
    username: u.displayUsername ?? u.username,
    image: u.image,
    locale: u.locale,
    theme: u.theme,
  };
}

export const GET = apiRoute(({ user }) => publicUser(user.id));

export const PATCH = apiRoute(async ({ req, user }) => {
  const body = (await readJson(req)) as Record<string, unknown>;
  if ('name' in body || 'username' in body) {
    const u = getUser(user.id)!;
    updateProfile(user.id, {
      name: body.name ?? u.name,
      username: body.username ?? u.displayUsername ?? u.username,
    });
  }
  if ('locale' in body || 'theme' in body)
    updatePreferences(user.id, { locale: body.locale, theme: body.theme });
  return publicUser(user.id);
});
