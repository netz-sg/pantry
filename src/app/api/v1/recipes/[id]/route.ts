import { apiRoute, readJson } from '@/server/lib/api';
import { deleteRecipe, getRecipe, requireRecipe, updateRecipe } from '@/server/services/recipes';

export const GET = apiRoute<{ id: string }>(({ user, params }) => requireRecipe(user.id, params.id));

export const PUT = apiRoute<{ id: string }>(async ({ req, user, params }) => {
  await updateRecipe(user.id, params.id, await readJson(req));
  return getRecipe(user.id, params.id);
});

export const DELETE = apiRoute<{ id: string }>(async ({ user, params }) => {
  await deleteRecipe(user.id, params.id);
});
