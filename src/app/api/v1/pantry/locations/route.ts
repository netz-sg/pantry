import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { createLocation, listLocations } from '@/server/services/pantry';

export const GET = apiRoute(({ user }) => listLocations(user.id));
export const POST = apiRoute(async ({ req, user }) => {
  const b = z
    .object({ name: z.string(), kind: z.enum(['fridge', 'freezer', 'pantry', 'other']).default('other') })
    .parse(await readJson(req));
  return createLocation(user.id, b.name, b.kind);
});
