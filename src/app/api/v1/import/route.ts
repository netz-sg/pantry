import { apiRoute, readJson } from '@/server/lib/api';
import { importData } from '@/server/services/backup';

export const POST = apiRoute(async ({ req, user }) => importData(user.id, await readJson(req)));
