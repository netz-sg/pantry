import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { toErrorPayload, type Result } from '../lib/errors';
import { logger } from '../lib/logger';
import { requireActionUser, type SessionUser } from '../lib/session';

/**
 * Gemeinsamer Rahmen für Server Actions. Prüft die Anmeldung, fängt Fehler ab
 * und gibt ein einheitliches Ergebnis zurück. Danach wird die App neu geladen.
 */
export async function run<T>(
  fn: (user: SessionUser) => Promise<T> | T,
  opts: { revalidate?: boolean } = {},
): Promise<Result<T>> {
  try {
    const user = await requireActionUser();
    const data = await fn(user);
    if (opts.revalidate !== false) revalidatePath('/', 'layout');
    return { ok: true, data };
  } catch (e) {
    unstable_rethrow(e);
    const error = toErrorPayload(e);
    if (error.code === 'internal') logger.error({ err: e }, 'Server Action fehlgeschlagen');
    return { ok: false, error };
  }
}
