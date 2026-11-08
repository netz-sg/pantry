import fs from 'node:fs/promises';
import { getSessionUser } from '@/server/lib/session';
import { resolveMediaPath } from '@/server/services/media';

/** Liefert hochgeladene Bilder aus. Nur für angemeldete Nutzer, nur aus dem Upload-Ordner. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await getSessionUser())) return new Response('Nicht angemeldet', { status: 401 });
  const rel = (await params).path.join('/');
  const abs = resolveMediaPath(rel);
  if (!abs) return new Response('Nicht gefunden', { status: 404 });
  try {
    const data = await fs.readFile(abs);
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Nicht gefunden', { status: 404 });
  }
}
