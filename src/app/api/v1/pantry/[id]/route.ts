import { apiRoute, readJson } from '@/server/lib/api';
import { deletePantryItem, updatePantryItem } from '@/server/services/pantry';

export const PUT = apiRoute<{ id: string }>(async ({ req, user, params }) =>
  updatePantryItem(user.id, params.id, await readJson(req)),
);
export const DELETE = apiRoute<{ id: string }>(({ user, params }) => {
  deletePantryItem(user.id, params.id);
});
