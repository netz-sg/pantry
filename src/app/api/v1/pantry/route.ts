import { apiRoute, query, readJson } from '@/server/lib/api';
import { createPantryItem, listPantry } from '@/server/services/pantry';

export const GET = apiRoute(({ req, user }) => listPantry(user.id, { locationId: query(req).locationId }));
export const POST = apiRoute(async ({ req, user }) => createPantryItem(user.id, await readJson(req)));
