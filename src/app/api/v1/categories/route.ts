import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { createCategory, listCategories } from '@/server/services/recipes';

export const GET = apiRoute(({ user }) => listCategories(user.id));
export const POST = apiRoute(async ({ req, user }) => {
  const { name } = z.object({ name: z.string() }).parse(await readJson(req));
  return createCategory(user.id, name);
});
