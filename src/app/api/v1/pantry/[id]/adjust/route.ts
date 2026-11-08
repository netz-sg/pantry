import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { adjustPantryQuantity } from '@/server/services/pantry';

export const POST = apiRoute<{ id: string }>(async ({ req, user, params }) => {
  const { delta } = z.object({ delta: z.number().min(-100000).max(100000) }).parse(await readJson(req));
  return adjustPantryQuantity(user.id, params.id, delta);
});
