import pino from 'pino';

const holder = globalThis as unknown as { __pantryLogger?: pino.Logger };

export const logger: pino.Logger =
  holder.__pantryLogger ??
  (holder.__pantryLogger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { app: 'pantry' },
    redact: ['password', '*.password', 'currentPassword', 'newPassword', 'token', '*.token', 'authorization'],
  }));
