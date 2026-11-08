import { z } from 'zod';
import { dateKey } from '@/lib/schemas';
import { today } from '@/lib/dates';
import { apiRoute, query, readJson } from '@/server/lib/api';
import { addEntry, getWeek, listRange } from '@/server/services/plan';

/** Mit ?from=&to= ein Zeitraum, sonst die Woche um ?date= (Standard heute). */
export const GET = apiRoute(({ req, user }) => {
  const q = z
    .object({ date: dateKey.optional(), from: dateKey.optional(), to: dateKey.optional() })
    .parse(query(req));
  if (q.from && q.to) return listRange(user.id, q.from, q.to);
  return getWeek(user.id, q.date ?? today());
});

export const POST = apiRoute(async ({ req, user }) => addEntry(user.id, await readJson(req)));
