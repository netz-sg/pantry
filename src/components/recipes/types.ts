import type { IngredientStatus } from '@/server/services/availability';

/** Zutat, wie sie im Browser angezeigt wird, mit Vorratsstand für die Grundportionen. */
export interface ViewIngredient {
  id: string;
  groupName: string | null;
  amount: number | null;
  unit: string | null;
  name: string;
  note: string | null;
  optional: boolean;
  status: IngredientStatus;
  /** Vorhandene Menge in der Einheit der Zutat. null heißt vorhanden, Menge unbekannt. */
  haveAmount: number | null;
}

export interface ViewStep {
  id: string;
  text: string;
  timerSeconds: number | null;
}

/** Rechnet den Vorratsstand für eine andere Portionenzahl neu. */
export function scaleStatus(
  ing: ViewIngredient,
  factor: number,
): { status: IngredientStatus; missingAmount: number | null } {
  if (ing.amount == null || ing.haveAmount == null) {
    return {
      status: ing.status,
      missingAmount: ing.status === 'missing' && ing.amount != null ? ing.amount * factor : null,
    };
  }
  const need = ing.amount * factor;
  const have = ing.haveAmount;
  if (have + 1e-9 >= need) return { status: 'ok', missingAmount: 0 };
  if (have > 0) return { status: 'partial', missingAmount: need - have };
  return { status: ing.optional ? 'unknown' : 'missing', missingAmount: need };
}

/** Teilt Zutaten in aufeinanderfolgende Gruppen nach groupName. */
export function groupIngredients<T extends { groupName: string | null }>(
  list: T[],
): { name: string | null; items: T[] }[] {
  const out: { name: string | null; items: T[] }[] = [];
  for (const i of list) {
    const name = i.groupName?.trim() || null;
    const last = out[out.length - 1];
    if (last && last.name === name) last.items.push(i);
    else out.push({ name, items: [i] });
  }
  return out;
}

/** Zeit für Anzeige in Minuten, mindestens 1. */
export function timerMinutes(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}
