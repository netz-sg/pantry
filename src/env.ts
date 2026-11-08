import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Geprüfte Umgebungsvariablen. Fehlt etwas Pflichtiges, bricht der Start sofort ab,
 * statt mit unsicheren Standardwerten weiterzulaufen.
 */
export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET muss mindestens 32 Zeichen lang sein'),
    APP_URL: z.url().default('http://localhost:3000'),
    DATABASE_PATH: z.string().min(1).default('./data/pantry.db'),
    UPLOAD_DIR: z.string().min(1).default('./data/uploads'),
    SETUP_TOKEN: z.string().optional(),
    VAPID_PUBLIC_KEY: z.string().optional(),
    VAPID_PRIVATE_KEY: z.string().optional(),
    VAPID_SUBJECT: z.string().optional(),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {},
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
