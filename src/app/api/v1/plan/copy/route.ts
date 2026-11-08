import { z } from 'zod';
import { dateKey } from '@/lib/schemas';
import { apiRoute, readJson } from '@/server/lib/api';
import { copyWeek } from '@/server/services/plan';

export const POST = apiRoute(async ({ req, user }) => {
  const { from, to } = z.object({ from: dateKey, to: dateKey }).parse(await readJson(req));
  return { copied: copyWeek(user.id, from, to) };
});
