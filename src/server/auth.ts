import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { bearer, username } from 'better-auth/plugins';
import { count } from 'drizzle-orm';
import { env } from '@/env';
import { getDb } from './db';
import { account, rateLimit, session, user, verification } from './db/schema';
import { seedUserDefaults } from './services/defaults';

function createAuth() {
  const db = getDb();
  return betterAuth({
    appName: 'Pantry',
    baseURL: env.APP_URL,
    secret: env.AUTH_SECRET,
    trustedOrigins: [env.APP_URL],
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: { user, session, account, verification, rateLimit },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      revokeSessionsOnPasswordReset: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    user: {
      additionalFields: {
        locale: { type: 'string', defaultValue: 'de', input: false },
        theme: { type: 'string', defaultValue: 'system', input: false },
      },
    },
    rateLimit: {
      // Nur für die automatischen End-to-End-Tests abschaltbar
      enabled: process.env.PANTRY_E2E !== '1',
      storage: 'database',
      window: 60,
      max: 120,
      customRules: {
        '/sign-in/username': { window: 60, max: 5 },
        '/sign-in/email': { window: 60, max: 5 },
        '/change-password': { window: 60, max: 5 },
      },
    },
    advanced: {
      cookiePrefix: 'pantry',
      useSecureCookies: env.APP_URL.startsWith('https://'),
    },
    hooks: {
      // Konten werden nur über die Ersteinrichtung angelegt, nie direkt über die Auth-Route
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === '/sign-up/email' && ctx.request) {
          throw new APIError('FORBIDDEN', { message: 'Registrierung ist geschlossen' });
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          before: async (data) => {
            const [row] = await db.select({ n: count() }).from(user);
            if ((row?.n ?? 0) > 0) {
              throw new APIError('FORBIDDEN', { message: 'Pantry hat bereits ein Konto' });
            }
            return { data };
          },
          after: async (created) => {
            await seedUserDefaults(created.id);
          },
        },
      },
    },
    plugins: [username({ minUsernameLength: 3, maxUsernameLength: 32 }), bearer(), nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
const holder = globalThis as unknown as { __pantryAuth?: Auth };

/** Auth-Instanz, wird beim ersten Zugriff erzeugt, damit der Build keine Datenbank braucht. */
export function getAuth(): Auth {
  holder.__pantryAuth ??= createAuth();
  return holder.__pantryAuth;
}
