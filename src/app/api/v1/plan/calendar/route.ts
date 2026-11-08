import { z } from 'zod';
import { shiftDays, today, weekStart } from '@/lib/dates';
import { dateKey } from '@/lib/schemas';
import { env } from '@/env';
import { apiRoute, query } from '@/server/lib/api';
import { planToIcs } from '@/server/services/plan';

/** Wochenplan als iCalendar-Datei. Standard sind die nächsten vier Wochen. */
export const GET = apiRoute(({ req, user }) => {
  const q = z.object({ from: dateKey.optional(), to: dateKey.optional() }).parse(query(req));
  const from = q.from ?? weekStart(today());
  const to = q.to ?? shiftDays(from, 27);
  return new Response(planToIcs(user.id, from, to, env.APP_URL), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pantry-wochenplan.ics"',
    },
  });
});
