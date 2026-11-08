import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC = [
  '/login',
  '/setup',
  '/api/auth',
  '/api/health',
  '/api/v1',
  '/api/calendar',
  '/manifest.webmanifest',
  '/sw.js',
  '/icons',
  '/icon.png',
];

/** Schneller Vorabcheck. Ohne Session-Cookie geht es direkt zur Anmeldung. Die echte Prüfung passiert serverseitig. */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p)))
    return NextResponse.next();
  if (!getSessionCookie(req, { cookiePrefix: 'pantry' })) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
