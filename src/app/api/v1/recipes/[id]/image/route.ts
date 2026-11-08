import { and, eq } from 'drizzle-orm';
import { getDb } from '@/server/db';
import { recipe } from '@/server/db/schema';
import { apiRoute } from '@/server/lib/api';
import { AppError } from '@/server/lib/errors';
import { deleteImage, saveImage } from '@/server/services/media';
import { requireRecipe } from '@/server/services/recipes';

/** Lädt ein Foto hoch, als multipart/form-data mit dem Feld „file“. */
export const POST = apiRoute<{ id: string }>(async ({ req, user, params }) => {
  const r = requireRecipe(user.id, params.id);
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) throw new AppError('bad_request', 'Feld „file“ fehlt');
  const rel = await saveImage(user.id, Buffer.from(await file.arrayBuffer()));
  getDb()
    .update(recipe)
    .set({ imagePath: rel })
    .where(and(eq(recipe.id, r.id), eq(recipe.userId, user.id)))
    .run();
  await deleteImage(r.imagePath);
  return { imagePath: rel, url: `/media/${rel}` };
});

export const DELETE = apiRoute<{ id: string }>(async ({ user, params }) => {
  const r = requireRecipe(user.id, params.id);
  getDb()
    .update(recipe)
    .set({ imagePath: null })
    .where(and(eq(recipe.id, r.id), eq(recipe.userId, user.id)))
    .run();
  await deleteImage(r.imagePath);
});
