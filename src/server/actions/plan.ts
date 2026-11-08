'use server';

import { z } from 'zod';
import { shiftDays, weekStart } from '@/lib/dates';
import { dateKey, idSchema } from '@/lib/schemas';
import { addEntry, copyWeek, deleteEntry, markCooked, shoppingForRange, updateEntry } from '../services/plan';
import { listRecipes } from '../services/recipes';
import { run } from './run';

/** Rezeptsuche für das Hinzufügen-Sheet. Lädt die Seite nicht neu. */
export async function searchPlanRecipes(q: string) {
  return run(
    (user) => {
      const query = z.string().trim().max(120).parse(q);
      return listRecipes(user.id, { q: query || undefined, limit: 30 }).items.map((r) => ({
        id: r.id,
        title: r.title,
        imagePath: r.imagePath,
        servings: r.servings,
        totalMinutes: r.totalMinutes,
        ingredientCount: r.ingredientCount,
        missingCount: r.missingCount,
      }));
    },
    { revalidate: false },
  );
}

export async function addPlanEntry(input: unknown) {
  return run((user) => addEntry(user.id, input).id);
}

export async function updatePlanEntry(id: string, patch: unknown) {
  return run((user) => {
    updateEntry(user.id, idSchema.parse(id), patch);
  });
}

export async function deletePlanEntry(id: string) {
  return run((user) => deleteEntry(user.id, idSchema.parse(id)));
}

/** Legt einen gelöschten Eintrag für Rückgängig neu an, samt Gekocht-Status. */
export async function restorePlanEntry(input: unknown) {
  return run((user) => {
    const cooked = z.object({ cooked: z.boolean().optional() }).parse(input).cooked;
    const created = addEntry(user.id, input);
    if (cooked) updateEntry(user.id, created.id, { cooked: true });
    return created.id;
  });
}

export async function markPlanEntryCooked(id: string, deduct: boolean) {
  return run((user) => markCooked(user.id, idSchema.parse(id), z.boolean().parse(deduct)));
}

/** Kopiert die Woche in die folgende Woche und gibt die Anzahl der Einträge zurück. */
export async function copyPlanWeek(start: string) {
  return run((user) => {
    const from = weekStart(dateKey.parse(start));
    return copyWeek(user.id, from, shiftDays(from, 7));
  });
}

/** Schreibt fehlende Zutaten der Woche auf die Einkaufsliste. */
export async function shoppingForPlanWeek(start: string) {
  return run((user) => {
    const from = weekStart(dateKey.parse(start));
    return shoppingForRange(user.id, from, shiftDays(from, 6));
  });
}
