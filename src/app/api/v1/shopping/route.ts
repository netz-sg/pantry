import { z } from 'zod';
import { apiRoute, query, readJson } from '@/server/lib/api';
import { addShoppingItem, clearChecked, listShopping, quickAddShopping } from '@/server/services/shopping';

export const GET = apiRoute(({ user }) => listShopping(user.id));

/** Entweder ein strukturierter Eintrag oder { text: "2 kg Kartoffeln" }. */
export const POST = apiRoute(async ({ req, user }) => {
  const body = await readJson(req);
  const quick = z.object({ text: z.string().min(1).max(200) }).safeParse(body);
  return quick.success ? quickAddShopping(user.id, quick.data.text) : addShoppingItem(user.id, body);
});

/** Mit ?checked=true werden alle abgehakten Einträge entfernt. */
export const DELETE = apiRoute(({ req, user }) => {
  if (query(req).checked !== 'true') return { removed: 0 };
  return { removed: clearChecked(user.id) };
});
