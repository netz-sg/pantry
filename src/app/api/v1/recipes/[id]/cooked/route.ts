import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { consumeFromPantry } from '@/server/services/pantry';
import { logCooked, requireRecipe } from '@/server/services/recipes';

export const POST = apiRoute<{ id: string }>(async ({ req, user, params }) => {
  const body = z
    .object({ servings: z.number().int().min(1).max(100).optional(), deduct: z.boolean().default(false) })
    .parse(await readJson(req));
  const r = requireRecipe(user.id, params.id);
  const servings = body.servings ?? r.servings;
  logCooked(user.id, r.id, servings);
  let deducted = 0;
  if (body.deduct) {
    const f = servings / r.servings;
    deducted = consumeFromPantry(
      user.id,
      r.ingredients
        .filter((i) => !i.optional)
        .map((i) => ({ name: i.name, unit: i.unit, amount: i.amount == null ? null : i.amount * f })),
    );
  }
  return { cooked: true, deducted };
});
