import { createHash, randomBytes } from 'node:crypto';
import { and, count, eq, ne } from 'drizzle-orm';
import { preferencesInput, profileInput } from '@/lib/schemas';
import { getDb, type DB } from '../db';
import { user } from '../db/schema';
import { AppError } from '../lib/errors';
import { deleteImage, saveImage } from './media';

export function hasAnyUser(db: DB = getDb()) {
  const [row] = db.select({ n: count() }).from(user).all();
  return (row?.n ?? 0) > 0;
}

export function getUser(userId: string, db: DB = getDb()) {
  return db.select().from(user).where(eq(user.id, userId)).get() ?? null;
}

export function updateProfile(userId: string, raw: unknown, db: DB = getDb()) {
  const input = profileInput.parse(raw);
  const uname = input.username.toLowerCase();
  const taken = db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.username, uname), ne(user.id, userId)))
    .get();
  if (taken)
    throw new AppError('conflict', 'Dieser Benutzername ist vergeben', { username: ['Bereits vergeben'] });
  db.update(user)
    .set({ name: input.name, username: uname, displayUsername: input.username })
    .where(eq(user.id, userId))
    .run();
}

export function updatePreferences(userId: string, raw: unknown, db: DB = getDb()) {
  const input = preferencesInput.parse(raw);
  db.update(user)
    .set({
      ...(input.locale ? { locale: input.locale } : {}),
      ...(input.theme ? { theme: input.theme } : {}),
    })
    .where(eq(user.id, userId))
    .run();
}

export async function setAvatar(userId: string, file: Buffer | null, db: DB = getDb()) {
  const current = getUser(userId, db);
  const rel = file ? await saveImage(userId, file, 'avatar') : null;
  db.update(user)
    .set({ image: rel ? `/media/${rel}` : null })
    .where(eq(user.id, userId))
    .run();
  const old = current?.image?.startsWith('/media/') ? current.image.slice(7) : null;
  if (old && old !== rel) await deleteImage(old);
  return rel;
}

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

/** Erzeugt einen neuen geheimen Abo-Link für den Kalender. Ein alter Link wird damit ungültig. */
export function rotateCalendarToken(userId: string, db: DB = getDb()) {
  const token = randomBytes(24).toString('base64url');
  db.update(user)
    .set({ calendarTokenHash: hashToken(token) })
    .where(eq(user.id, userId))
    .run();
  return token;
}

export function revokeCalendarToken(userId: string, db: DB = getDb()) {
  db.update(user).set({ calendarTokenHash: null }).where(eq(user.id, userId)).run();
}

export function hasCalendarToken(userId: string, db: DB = getDb()) {
  return Boolean(getUser(userId, db)?.calendarTokenHash);
}

export function userIdForCalendarToken(token: string, db: DB = getDb()) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  return (
    db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.calendarTokenHash, hashToken(token)))
      .get()?.id ?? null
  );
}
