import { importUrlInput } from '@/lib/schemas';
import { apiRoute, readJson } from '@/server/lib/api';
import { scrapeRecipe } from '@/server/services/importer';
import { saveImageFromUrl } from '@/server/services/media';
import { createRecipe, getRecipe } from '@/server/services/recipes';

/** Importiert ein Rezept von einer Website und legt es direkt an. */
export const POST = apiRoute(async ({ req, user }) => {
  const { url } = importUrlInput.parse(await readJson(req));
  const scraped = await scrapeRecipe(url);
  const imagePath = scraped.imageUrl ? await saveImageFromUrl(user.id, scraped.imageUrl) : null;
  const id = createRecipe(user.id, scraped.input, { imagePath });
  return getRecipe(user.id, id);
});
