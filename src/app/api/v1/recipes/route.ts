import { recipeListQuery } from '@/lib/schemas';
import { apiRoute, query, readJson } from '@/server/lib/api';
import { createRecipe, getRecipe, listRecipes } from '@/server/services/recipes';

export const GET = apiRoute(({ req, user }) => {
  const q = recipeListQuery.parse(query(req));
  const { items, total } = listRecipes(user.id, q);
  return { data: items, meta: { total, limit: q.limit, offset: q.offset } };
});

export const POST = apiRoute(async ({ req, user }) => {
  const id = createRecipe(user.id, await readJson(req));
  return getRecipe(user.id, id);
});
