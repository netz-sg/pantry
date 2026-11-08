import { z } from 'zod';
import { apiRoute, readJson } from '@/server/lib/api';
import { AppError } from '@/server/lib/errors';
import { pushConfigured, removeSubscription, saveSubscription } from '@/server/services/push';

const sub = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string().min(10), auth: z.string().min(4) }),
});

export const GET = apiRoute(() => ({
  enabled: pushConfigured(),
  publicKey: process.env.VAPID_PUBLIC_KEY ?? null,
}));

export const POST = apiRoute(async ({ req, user }) => {
  if (!pushConfigured()) throw new AppError('bad_request', 'Push ist auf diesem Server nicht eingerichtet');
  saveSubscription(user.id, sub.parse(await readJson(req)));
  return { subscribed: true };
});

export const DELETE = apiRoute(async ({ req, user }) => {
  const { endpoint } = z.object({ endpoint: z.url() }).parse(await readJson(req));
  removeSubscription(endpoint, user.id);
});
