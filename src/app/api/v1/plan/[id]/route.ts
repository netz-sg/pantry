import { apiRoute, readJson } from '@/server/lib/api';
import { deleteEntry, updateEntry } from '@/server/services/plan';

export const PATCH = apiRoute<{ id: string }>(async ({ req, user, params }) =>
  updateEntry(user.id, params.id, await readJson(req)),
);
export const DELETE = apiRoute<{ id: string }>(({ user, params }) => {
  deleteEntry(user.id, params.id);
});
