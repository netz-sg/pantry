import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { setFavorite } from '@/server/services/recipes';

export const POST = apiRoute<{ id: string }>(async ({ req, user, params }) => {
  const { value } = z.object({ value: z.boolean() }).parse(await readJson(req));
  setFavorite(user.id, params.id, value);
  return { favorite: value };
});
