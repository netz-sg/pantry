import { AISLES, type Aisle } from '@/lib/aisles';

/** Schlanker Eintrag für die Oberfläche. */
export type ShopItem = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
  note: string | null;
  checked: boolean;
  recipeId: string | null;
  recipeTitle: string | null;
};

export function isAisle(v: string): v is Aisle {
  return (AISLES as readonly string[]).includes(v);
}

/** Trennlinie zwischen Zeilen, beginnt nach dem Haken wie in Erinnerungen. */
export const rowSeparator =
  'before:absolute before:top-0 before:right-0 before:left-[51px] before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden';
