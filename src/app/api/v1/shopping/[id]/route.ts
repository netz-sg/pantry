import { apiRoute, readJson } from '@/server/lib/api';
import { deleteShoppingItem, updateShoppingItem } from '@/server/services/shopping';

export const PATCH = apiRoute<{ id: string }>(async ({ req, user, params }) =>
  updateShoppingItem(user.id, params.id, await readJson(req)),
);
export const DELETE = apiRoute<{ id: string }>(({ user, params }) => {
  deleteShoppingItem(user.id, params.id);
});
