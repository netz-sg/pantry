import { shiftDays, today, weekStart } from '@/lib/dates';
import { env } from '@/env';
import { planToIcs } from '@/server/services/plan';
import { userIdForCalendarToken } from '@/server/services/user';

/** Kalender-Abo über einen geheimen Link. Liefert die letzte und die nächsten acht Wochen. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token.replace(/\.ics$/, '');
  const userId = userIdForCalendarToken(token);
  if (!userId) return new Response('Nicht gefunden', { status: 404 });
  const from = shiftDays(weekStart(today()), -7);
  return new Response(planToIcs(userId, from, shiftDays(from, 63), env.APP_URL), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'private, max-age=900' },
  });
}
