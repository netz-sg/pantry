import pkg from '../../../package.json';
import { logger } from '../lib/logger';
import { safeFetch } from '../lib/safe-fetch';

const RELEASES_URL = 'https://api.github.com/repos/netz-sg/pantry/releases/latest';
const TTL_OK = 12 * 60 * 60 * 1000;
// Nach einem Fehler früher erneut fragen, aber GitHub nicht bei jedem Aufruf belasten
const TTL_FAIL = 60 * 60 * 1000;

export type LatestRelease = { version: string; url: string };
export type UpdateInfo = { current: string; latest: LatestRelease | null; available: boolean };

type CacheEntry = { at: number; ttl: number; latest: LatestRelease | null };
const holder = globalThis as unknown as {
  __pantryUpdateCache?: CacheEntry;
  __pantryUpdatePending?: Promise<LatestRelease | null>;
};

export const currentVersion = (): string => pkg.version;

/** Zerlegt eine Version wie v2.1.0 in Zahlen. Vorabversionen zählen nicht. */
export function parseVersion(v: string): [number, number, number] | null {
  const m = v
    .trim()
    .replace(/^v/i, '')
    .match(/^(\d+)\.(\d+)\.(\d+)$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function isNewer(latest: string, current: string): boolean {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) {
    if (a[i]! !== b[i]!) return a[i]! > b[i]!;
  }
  return false;
}

async function fetchLatest(): Promise<LatestRelease | null> {
  try {
    const { body } = await safeFetch(RELEASES_URL, {
      accept: 'application/vnd.github+json',
      timeoutMs: 5_000,
      maxBytes: 512 * 1024,
    });
    const data = JSON.parse(body.toString('utf8')) as {
      tag_name?: unknown;
      html_url?: unknown;
      draft?: unknown;
      prerelease?: unknown;
    };
    if (typeof data.tag_name !== 'string' || data.draft === true || data.prerelease === true) return null;
    const version = data.tag_name.replace(/^v/i, '');
    if (!parseVersion(version)) return null;
    const url =
      typeof data.html_url === 'string' && data.html_url.startsWith('https://github.com/netz-sg/pantry/')
        ? data.html_url
        : `https://github.com/netz-sg/pantry/releases/tag/${encodeURIComponent(data.tag_name)}`;
    return { version, url };
  } catch (e) {
    logger.debug({ err: e }, 'Update-Prüfung fehlgeschlagen');
    return null;
  }
}

/** Neueste veröffentlichte Version, im Speicher zwischengespeichert. Wirft nie. */
export async function getLatestRelease(now = Date.now()): Promise<LatestRelease | null> {
  const c = holder.__pantryUpdateCache;
  if (c && now - c.at < c.ttl) return c.latest;
  holder.__pantryUpdatePending ??= fetchLatest().then((latest) => {
    holder.__pantryUpdateCache = { at: Date.now(), ttl: latest ? TTL_OK : TTL_FAIL, latest };
    holder.__pantryUpdatePending = undefined;
    return latest;
  });
  return holder.__pantryUpdatePending;
}

export async function getUpdateInfo(): Promise<UpdateInfo> {
  const current = currentVersion();
  const latest = await getLatestRelease();
  return { current, latest, available: latest ? isNewer(latest.version, current) : false };
}
