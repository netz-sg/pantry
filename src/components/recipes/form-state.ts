import type { RecipeInput } from '@/lib/schemas';
import { parseIngredientLine } from '@/lib/quantity';
import { unitDef } from '@/lib/units';

export const NEW_CATEGORY = '__new';

export interface IngRow {
  key: string;
  amount: string;
  unit: string;
  /** Freie Einheit, die nicht in der Liste steht */
  custom: boolean;
  name: string;
  note: string;
  groupName: string;
  optional: boolean;
  open: boolean;
}

export interface StepRow {
  key: string;
  text: string;
  minutes: string;
}

export interface FormState {
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  servings: number;
  prep: string;
  cook: string;
  rest: string;
  difficulty: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  sourceUrl: string;
  notes: string;
  tags: string[];
  ingredients: IngRow[];
  steps: StepRow[];
}

/** Eingaben, mit denen das Formular startet. Passt zu RecipeInput aus dem Import. */
export type FormInitial = Partial<Omit<RecipeInput, 'ingredients' | 'steps'>> & {
  ingredients?: {
    groupName?: string | null;
    amount?: number | null;
    unit?: string | null;
    name: string;
    note?: string | null;
    optional?: boolean;
  }[];
  steps?: { text: string; timerSeconds?: number | null }[];
};

const str = (v: number | string | null | undefined) => (v == null ? '' : String(v));

/** Zahl in der Schreibweise der Sprache, z. B. 0,5 statt 0.5 */
export function numText(v: number | null | undefined, locale: string) {
  if (v == null) return '';
  const rounded = Math.round(v * 1000) / 1000;
  return locale === 'de' ? String(rounded).replace('.', ',') : String(rounded);
}

export function emptyIngredient(key: string): IngRow {
  return {
    key,
    amount: '',
    unit: '',
    custom: false,
    name: '',
    note: '',
    groupName: '',
    optional: false,
    open: false,
  };
}

export function toIngRow(
  i: NonNullable<FormInitial['ingredients']>[number],
  key: string,
  locale: string,
): IngRow {
  const unit = i.unit ?? '';
  return {
    key,
    amount: numText(i.amount, locale),
    unit,
    custom: !!unit && !unitDef(unit),
    name: i.name,
    note: i.note ?? '',
    groupName: i.groupName ?? '',
    optional: !!i.optional,
    open: false,
  };
}

export function toState(
  input: FormInitial,
  keyOf: (kind: 'i' | 's', idx: number) => string,
  locale: string,
): FormState {
  return {
    title: input.title ?? '',
    description: input.description ?? '',
    categoryId: input.categoryId ?? '',
    categoryName: input.categoryName ?? '',
    servings: input.servings ?? 4,
    prep: str(input.prepMinutes),
    cook: str(input.cookMinutes),
    rest: str(input.restMinutes),
    difficulty: str(input.difficulty),
    calories: str(input.calories),
    protein: numText(input.protein, locale),
    fat: numText(input.fat, locale),
    carbs: numText(input.carbs, locale),
    sourceUrl: input.sourceUrl ?? '',
    notes: input.notes ?? '',
    tags: input.tags ?? [],
    ingredients: (input.ingredients ?? []).map((i, idx) => toIngRow(i, keyOf('i', idx), locale)),
    steps: (input.steps ?? []).map((s, idx) => ({
      key: keyOf('s', idx),
      text: s.text,
      minutes: s.timerSeconds ? numText(Math.round((s.timerSeconds / 60) * 10) / 10, locale) : '',
    })),
  };
}

/** Wandelt „1/2“ oder „1 ½“ in eine Zahl. Andere Eingaben gehen unverändert an den Server. */
export function normalizeAmount(a: string) {
  const v = a.trim();
  if (!v || /^\d+([.,]\d+)?$/.test(v)) return v;
  const p = parseIngredientLine(`${v} x`);
  return p.amount != null && p.name === 'x' ? String(p.amount) : v;
}

function minutesToSeconds(m: string) {
  const n = Number(m.trim().replace(',', '.'));
  return m.trim() && Number.isFinite(n) && n > 0 ? Math.round(n * 60) : null;
}

/** Daten für die Server Action. Leere Zeilen fallen weg. */
export function toPayload(s: FormState) {
  const isNew = s.categoryId === NEW_CATEGORY;
  return {
    title: s.title,
    description: s.description,
    categoryId: s.categoryId && !isNew ? s.categoryId : null,
    categoryName: isNew ? s.categoryName : null,
    servings: s.servings,
    prepMinutes: s.prep.trim(),
    cookMinutes: s.cook.trim(),
    restMinutes: s.rest.trim(),
    difficulty: s.difficulty,
    calories: s.calories.trim(),
    protein: s.protein.trim(),
    fat: s.fat.trim(),
    carbs: s.carbs.trim(),
    sourceUrl: s.sourceUrl.trim(),
    notes: s.notes,
    tags: s.tags,
    ingredients: s.ingredients
      .filter((i) => i.name.trim() || i.amount.trim() || i.note.trim())
      .map((i) => ({
        groupName: i.groupName,
        amount: normalizeAmount(i.amount),
        unit: i.unit,
        name: i.name,
        note: i.note,
        optional: i.optional,
      })),
    steps: s.steps
      .filter((x) => x.text.trim())
      .map((x) => ({ text: x.text, timerSeconds: minutesToSeconds(x.minutes) })),
  };
}

/** Zerlegt eingefügten Text in Zutatenzeilen. Zeilen mit Doppelpunkt am Ende werden zur Gruppe. */
export function parsePasted(text: string, nextKey: () => string, locale: string): IngRow[] {
  const rows: IngRow[] = [];
  let group = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^\s*(?:[-*•·▢□☐]|\d+[.)])\s+/, '').trim();
    if (!line) continue;
    if (/[:：]$/.test(line) && !/^\d/.test(line)) {
      group = line.replace(/[:：]$/, '').trim();
      continue;
    }
    const p = parseIngredientLine(line);
    rows.push({
      ...toIngRow(
        {
          amount: p.amount,
          unit: p.unit,
          name: p.name.slice(0, 160),
          note: p.note?.slice(0, 200) ?? null,
          groupName: group || null,
        },
        nextKey(),
        locale,
      ),
    });
  }
  return rows;
}
