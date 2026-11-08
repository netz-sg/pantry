import dns from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { AppError } from './errors';

const BLOCKED_V4: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function v4ToInt(ip: string) {
  return ip.split('.').reduce((acc, p) => (acc << 8) + Number(p), 0) >>> 0;
}

export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const n = v4ToInt(ip);
    return BLOCKED_V4.some(([base, bits]) => {
      const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
      return (n & mask) === (v4ToInt(base) & mask);
    });
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v === '::' || v === '::1') return true;
    if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7));
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v);
  }
  return true;
}

async function assertPublicHost(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw new AppError('bad_request', 'Nur http- und https-Adressen sind erlaubt');
  if (url.username || url.password)
    throw new AppError('bad_request', 'Adressen mit Zugangsdaten sind nicht erlaubt');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new AppError('bad_request', 'Diese Adresse ist nicht erreichbar');
  }
  const addrs = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((a) => a.address);
  if (!addrs.length || addrs.some(isPrivateAddress))
    throw new AppError('bad_request', 'Diese Adresse ist nicht erreichbar');
}

export interface SafeFetchOptions {
  maxBytes?: number;
  timeoutMs?: number;
  accept?: string;
}

/**
 * DNS-Auflösung, die private Ziele schon beim Verbindungsaufbau ablehnt.
 * So kann eine Adresse nicht zwischen Prüfung und Verbindung auf ein internes Ziel umschwenken.
 */
const guardedLookup: net.LookupFunction = (hostname, options, callback) => {
  dns
    .lookup(hostname, { all: true, family: typeof options === 'object' ? options.family : undefined })
    .then((addrs) => {
      if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) {
        throw Object.assign(new Error('Ziel im lokalen Netz blockiert'), { code: 'EPRIVATE' });
      }
      if (typeof options === 'object' && options.all)
        (callback as unknown as (e: null, a: { address: string; family: number }[]) => void)(null, addrs);
      else callback(null, addrs[0]!.address, addrs[0]!.family);
    })
    .catch((err: NodeJS.ErrnoException) => callback(err, '', 0));
};

function requestOnce(url: URL, accept: string, signal: AbortSignal): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request(
      url,
      {
        method: 'GET',
        lookup: guardedLookup,
        signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PantryRecipeImport/2.0)',
          Accept: accept,
          'Accept-Encoding': 'identity',
        },
      },
      resolve,
    );
    req.on('error', (e: NodeJS.ErrnoException) =>
      reject(e.code === 'EPRIVATE' ? new AppError('bad_request', 'Diese Adresse ist nicht erreichbar') : e),
    );
    req.end();
  });
}

/**
 * Ruft eine fremde Adresse ab, ohne ins lokale Netz zu greifen.
 * Prüft jede Weiterleitung neu, prüft die Zieladresse beim Verbindungsaufbau, begrenzt Zeit und Größe.
 */
export async function safeFetch(
  rawUrl: string,
  opts: SafeFetchOptions = {},
): Promise<{ body: Buffer; contentType: string; finalUrl: string }> {
  const maxBytes = opts.maxBytes ?? 3 * 1024 * 1024;
  const signal = AbortSignal.timeout(opts.timeoutMs ?? 10_000);
  const accept = opts.accept ?? 'text/html,application/xhtml+xml,*/*;q=0.8';
  let url = new URL(rawUrl);
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicHost(url);
    let res: http.IncomingMessage;
    try {
      res = await requestOnce(url, accept, signal);
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw new AppError('bad_request', 'Die Seite ist nicht erreichbar');
    }
    const status = res.statusCode ?? 0;
    if (status >= 300 && status < 400) {
      res.resume();
      const loc = res.headers.location;
      if (!loc) throw new AppError('bad_request', 'Ungültige Weiterleitung');
      url = new URL(loc, url);
      continue;
    }
    if (status < 200 || status >= 300) {
      res.resume();
      throw new AppError('bad_request', `Die Seite antwortet mit Fehler ${status}`);
    }
    if (Number(res.headers['content-length'] ?? 0) > maxBytes) {
      res.destroy();
      throw new AppError('bad_request', 'Die Seite ist zu groß');
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of res as AsyncIterable<Buffer>) {
      size += chunk.byteLength;
      if (size > maxBytes) {
        res.destroy();
        throw new AppError('bad_request', 'Die Seite ist zu groß');
      }
      chunks.push(chunk);
    }
    return {
      body: Buffer.concat(chunks),
      contentType: String(res.headers['content-type'] ?? ''),
      finalUrl: url.toString(),
    };
  }
  throw new AppError('bad_request', 'Zu viele Weiterleitungen');
}
