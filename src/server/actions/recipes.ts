'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { idSchema, importUrlInput, mealSlot, dateKey, recipeInput } from '@/lib/schemas';
import { AppError } from '../lib/errors';
import { scrapeRecipe } from '../services/importer';
import { deleteImage, saveImage, saveImageFromUrl } from '../services/media';
import { consumeFromPantry } from '../services/pantry';
import { addEntry, markCooked } from '../services/plan';
import {
  createRecipe,
  deleteRecipe,
  logCooked,
  requireRecipe,
  setFavorite,
  setRating,
  updateRecipe,
} from '../services/recipes';
import { addAllForRecipe, addMissingForRecipe } from '../services/shopping';
import { run } from './run';

const servingsSchema = z.coerce.number().int().min(1).max(100);

/** Liest das Formular, prüft die Eingaben und legt an oder ändert. Danach geht es zum Rezept. */
export async function saveRecipe(formData: FormData) {
  const res = await run(async (user) => {
    const idRaw = formData.get('id');
    const id = typeof idRaw === 'string' && idRaw ? idSchema.parse(idRaw) : null;

    let raw: unknown;
    try {
      raw = JSON.parse(String(formData.get('data') ?? ''));
    } catch {
      throw new AppError('bad_request', 'Die Formulardaten sind unvollständig');
    }
    // Erst prüfen, damit kein Bild ohne Rezept liegen bleibt
    const input = recipeInput.parse(raw);
    const existing = id ? requireRecipe(user.id, id) : null;

    let imagePath: string | null | undefined;
    const file = formData.get('image');
    const imageUrl = formData.get('imageUrl');
    if (file instanceof File && file.size > 0) {
      imagePath = await saveImage(user.id, Buffer.from(await file.arrayBuffer()));
    } else if (typeof imageUrl === 'string' && imageUrl) {
      const url = z.url({ protocol: /^https?$/ }).safeParse(imageUrl);
      imagePath = url.success ? ((await saveImageFromUrl(user.id, url.data)) ?? undefined) : undefined;
    } else if (formData.get('removeImage') === '1') {
      imagePath = null;
    }

    try {
      if (existing) {
        await updateRecipe(user.id, existing.id, input, { imagePath });
        return existing.id;
      }
      return createRecipe(user.id, input, { imagePath: imagePath ?? null });
    } catch (e) {
      if (imagePath) await deleteImage(imagePath);
      throw e;
    }
  });
  if (res.ok) redirect(`/recipes/${res.data}?flash=saved`);
  return res;
}

/** Holt ein Rezept von einer Website, ohne es anzulegen. Das Formular wird damit befüllt. */
export async function importRecipeFromUrl(url: string) {
  return run(
    async () => {
      const input = importUrlInput.parse({ url: url.trim() });
      return scrapeRecipe(input.url);
    },
    { revalidate: false },
  );
}

export async function toggleFavorite(id: string, value: boolean) {
  return run((user) => setFavorite(user.id, idSchema.parse(id), z.boolean().parse(value)));
}

export async function rateRecipe(id: string, rating: number | null) {
  return run((user) =>
    setRating(user.id, idSchema.parse(id), z.number().int().min(1).max(5).nullable().parse(rating)),
  );
}

export async function removeRecipe(id: string) {
  const res = await run((user) => deleteRecipe(user.id, idSchema.parse(id)));
  if (res.ok) redirect('/recipes?flash=deleted');
  return res;
}

export async function addMissingToShopping(id: string, servings: number) {
  return run((user) => addMissingForRecipe(user.id, idSchema.parse(id), servingsSchema.parse(servings)));
}

export async function addAllToShopping(id: string, servings: number) {
  return run((user) => addAllForRecipe(user.id, idSchema.parse(id), servingsSchema.parse(servings)));
}

export async function addRecipeToPlan(id: string, input: { date: string; slot: string; servings: number }) {
  return run((user) => {
    const recipeId = idSchema.parse(id);
    const data = z
      .object({ date: dateKey, slot: mealSlot, servings: z.coerce.number().int().min(1).max(50) })
      .parse(input);
    return addEntry(user.id, { ...data, recipeId }).id;
  });
}

/** Merkt sich das Kochen und zieht auf Wunsch die Zutaten vom Vorrat ab. */
function cookAndDeduct(userId: string, id: string, servings: number, deduct: boolean) {
  const r = requireRecipe(userId, id);
  logCooked(userId, r.id, servings);
  if (deduct) {
    const factor = servings / r.servings;
    consumeFromPantry(
      userId,
      r.ingredients
        .filter((i) => !i.optional)
        .map((i) => ({ name: i.name, unit: i.unit, amount: i.amount == null ? null : i.amount * factor })),
    );
  }
  return true;
}

export async function markRecipeCooked(id: string, servings: number, deduct: boolean) {
  return run((user) =>
    cookAndDeduct(user.id, idSchema.parse(id), servingsSchema.parse(servings), z.boolean().parse(deduct)),
  );
}

/** Abschluss im Kochmodus. Mit Planeintrag wird dieser als gekocht markiert. */
export async function finishCooking(
  id: string,
  opts: { servings: number; deduct: boolean; entry?: string | null },
) {
  const res = await run((user) => {
    const recipeId = idSchema.parse(id);
    const deduct = z.boolean().parse(opts.deduct);
    if (opts.entry) markCooked(user.id, idSchema.parse(opts.entry), deduct);
    else cookAndDeduct(user.id, recipeId, servingsSchema.parse(opts.servings), deduct);
    return recipeId;
  });
  if (res.ok) redirect(`/recipes/${res.data}?flash=cooked`);
  return res;
}
