import { NextResponse } from 'next/server';
import { AppError, HTTP_STATUS, toErrorPayload } from './errors';
import { logger } from './logger';
import { requireApiUser, type SessionUser } from './session';

type Ctx<P> = { params: Promise<P> };
type Handler<P> = (args: { req: Request; user: SessionUser; params: P }) => Promise<unknown> | unknown;

/**
 * Hülle für API-Routen. Prüft die Anmeldung, wandelt Fehler in ein einheitliches Format
 * und verpackt Ergebnisse als { data }.
 */
export function apiRoute<P = Record<string, never>>(handler: Handler<P>) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const user = await requireApiUser(req);
      const params = (await ctx?.params) ?? ({} as P);
      const result = await handler({ req, user, params });
      if (result instanceof Response) return result;
      if (result === undefined) return new NextResponse(null, { status: 204 });
      return NextResponse.json(
        result && typeof result === 'object' && 'data' in result ? result : { data: result },
      );
    } catch (e) {
      const payload = toErrorPayload(e);
      if (payload.code === 'internal')
        logger.error({ err: e, path: new URL(req.url).pathname }, 'API-Fehler');
      return NextResponse.json({ error: payload }, { status: HTTP_STATUS[payload.code] });
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError('bad_request', 'Der Inhalt ist kein gültiges JSON');
  }
}

export function query(req: Request) {
  return Object.fromEntries(new URL(req.url).searchParams.entries());
}
