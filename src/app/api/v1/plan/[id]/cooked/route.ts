import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { markCooked } from '@/server/services/plan';

export const POST = apiRoute<{ id: string }>(async ({ req, user, params }) => {
  const { deduct } = z
    .object({ deduct: z.boolean().default(true) })
    .parse(await readJson(req).catch(() => ({})));
  markCooked(user.id, params.id, deduct);
  return { cooked: true };
});
