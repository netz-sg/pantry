import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { addAllForRecipe, addMissingForRecipe } from '@/server/services/shopping';

export const POST = apiRoute<{ id: string }>(async ({ req, user, params }) => {
  const body = z
    .object({
      servings: z.number().int().min(1).max(100).optional(),
      mode: z.enum(['missing', 'all']).default('missing'),
    })
    .parse(await readJson(req));
  const added =
    body.mode === 'all'
      ? addAllForRecipe(user.id, params.id, body.servings)
      : addMissingForRecipe(user.id, params.id, body.servings);
  return { added };
});
