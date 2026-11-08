import fs from 'node:fs/promises';
import path from 'node:path';
import sharp, { type Metadata } from 'sharp';
import { AppError } from '../lib/errors';
import { safeFetch } from '../lib/safe-fetch';

export function uploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR ?? './data/uploads');
}

const MAX_INPUT = 12 * 1024 * 1024;

/**
 * Prüft, dass es wirklich ein Bild ist, dreht es richtig, verkleinert und speichert es als WebP.
 * Der Dateiname wird serverseitig vergeben. Gibt den relativen Pfad zurück.
 */
export async function saveImage(
  userId: string,
  input: Buffer,
  kind: 'recipe' | 'avatar' = 'recipe',
): Promise<string> {
  if (input.byteLength > MAX_INPUT) throw new AppError('bad_request', 'Das Bild ist größer als 12 MB');
  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new AppError('bad_request', 'Die Datei ist kein lesbares Bild');
  }
  if (!meta.format || !['jpeg', 'png', 'webp', 'gif', 'avif', 'heif', 'tiff'].includes(meta.format)) {
    throw new AppError('bad_request', 'Dieses Bildformat wird nicht unterstützt');
  }
  const size = kind === 'avatar' ? 512 : 1600;
  const out = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(size, size, { fit: kind === 'avatar' ? 'cover' : 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  const rel = `${safeUser}/${kind}-${crypto.randomUUID()}.webp`;
  const abs = path.join(uploadRoot(), rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, out);
  return rel;
}

export async function saveImageFromUrl(userId: string, url: string): Promise<string | null> {
  try {
    const { body, contentType } = await safeFetch(url, {
      maxBytes: MAX_INPUT,
      timeoutMs: 12_000,
      accept: 'image/*',
    });
    if (contentType && !contentType.startsWith('image/')) return null;
    return await saveImage(userId, body, 'recipe');
  } catch {
    return null;
  }
}

/** Löst einen gespeicherten Pfad sicher auf. Gibt null zurück, wenn er aus dem Upload-Ordner herausführt. */
export function resolveMediaPath(rel: string): string | null {
  if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.webp$/.test(rel)) return null;
  const root = uploadRoot();
  const abs = path.resolve(root, rel);
  const relCheck = path.relative(root, abs);
  if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) return null;
  return abs;
}

export async function deleteImage(rel: string | null | undefined) {
  if (!rel) return;
  const abs = resolveMediaPath(rel);
  if (abs) await fs.rm(abs, { force: true });
}
