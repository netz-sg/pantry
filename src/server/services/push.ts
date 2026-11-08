import { and, eq } from 'drizzle-orm';
import * as webpush from 'web-push';
import { today } from '@/lib/dates';
import { getDb, type DB } from '../db';
import { pushSubscription, user } from '../db/schema';
import { logger } from '../lib/logger';
import { listPantry } from './pantry';

export function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function configure() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

export function saveSubscription(
  userId: string,
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  db: DB = getDb(),
) {
  db.insert(pushSubscription)
    .values({ userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
    .onConflictDoUpdate({
      target: pushSubscription.endpoint,
      set: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      setWhere: eq(pushSubscription.userId, userId),
    })
    .run();
}

/** Entfernt ein Abo. Mit userId nur, wenn es diesem Konto gehört. */
export function removeSubscription(endpoint: string, userId?: string, db: DB = getDb()) {
  const where = userId
    ? and(eq(pushSubscription.endpoint, endpoint), eq(pushSubscription.userId, userId))
    : eq(pushSubscription.endpoint, endpoint);
  db.delete(pushSubscription).where(where).run();
}

/** Schickt einmal am Tag eine Nachricht, wenn Lebensmittel heute oder morgen ablaufen. */
export async function sendExpiryNotifications(db: DB = getDb()) {
  if (!pushConfigured()) return 0;
  configure();
  const t = today();
  let sent = 0;
  const users = db.select({ id: user.id, locale: user.locale }).from(user).all();
  for (const u of users) {
    const subs = db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.userId, u.id))
      .all()
      .filter((s) => s.lastNotifiedOn !== t);
    if (!subs.length) continue;
    const urgent = listPantry(u.id, {}, db).filter((p) => p.expiry === 'soon' || p.expiry === 'expired');
    if (!urgent.length) continue;
    const names = urgent
      .slice(0, 3)
      .map((p) => p.name)
      .join(', ');
    const body =
      u.locale === 'en'
        ? `${urgent.length} items need using soon: ${names}`
        : u.locale === 'zh'
          ? `${urgent.length} 种食材即将过期：${names}`
          : `${urgent.length} Lebensmittel sollten weg, zum Beispiel ${names}`;
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: 'Pantry', body, url: '/pantry' }),
        );
        db.update(pushSubscription).set({ lastNotifiedOn: t }).where(eq(pushSubscription.id, s.id)).run();
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) removeSubscription(s.endpoint, undefined, db);
        else logger.warn({ err: e }, 'Push fehlgeschlagen');
      }
    }
  }
  return sent;
}
