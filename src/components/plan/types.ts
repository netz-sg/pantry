export const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type Slot = (typeof SLOTS)[number];

export function isSlot(v: unknown): v is Slot {
  return typeof v === 'string' && (SLOTS as readonly string[]).includes(v);
}

/** Schlanker Planeintrag für die Client-Komponenten. */
export type BoardEntry = {
  id: string;
  date: string;
  slot: Slot;
  recipeId: string | null;
  title: string | null;
  servings: number;
  note: string | null;
  cooked: boolean;
  recipe: {
    id: string;
    title: string;
    imagePath: string | null;
    servings: number;
    totalMinutes: number;
  } | null;
  /** Noch nicht vom Server bestätigt */
  pending?: boolean;
};

/** Treffer der Rezeptsuche im Hinzufügen-Sheet. */
export type RecipeOption = {
  id: string;
  title: string;
  imagePath: string | null;
  servings: number;
  totalMinutes: number;
  ingredientCount: number;
  missingCount: number;
};

export type AddTarget = { date: string; slot: Slot };

/** Datum mittags in UTC, damit die Formatierung in jeder Zeitzone den richtigen Tag zeigt. */
export function noon(key: string) {
  return new Date(`${key}T12:00:00Z`);
}

export function entryTitle(e: Pick<BoardEntry, 'recipe' | 'title'>) {
  return e.recipe?.title ?? e.title ?? null;
}

export const cellId = (date: string, slot: Slot) => `${date}|${slot}`;

export function parseCellId(id: string): AddTarget | null {
  const [date, slot] = id.split('|');
  return date && isSlot(slot) ? { date, slot } : null;
}
