import { z } from 'zod';

export type ErrorCode =
  'bad_request' | 'unauthorized' | 'forbidden' | 'not_found' | 'conflict' | 'validation' | 'internal';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (what = 'Eintrag') => new AppError('not_found', `${what} nicht gefunden`);

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> } };

export function toErrorPayload(e: unknown): Extract<Result<never>, { ok: false }>['error'] {
  if (e instanceof AppError) return { code: e.code, message: e.message, fieldErrors: e.fieldErrors };
  if (e instanceof z.ZodError) {
    const flat = z.flattenError(e);
    return {
      code: 'validation',
      message: 'Bitte prüfe deine Eingaben',
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }
  return { code: 'internal', message: 'Etwas ist schiefgelaufen. Bitte versuche es noch einmal.' };
}

export const HTTP_STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  validation: 422,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  internal: 500,
};
