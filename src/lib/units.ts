export type Dimension = 'mass' | 'volume' | 'count' | 'other';
export type Locale = 'de' | 'en' | 'zh';

export interface UnitDef {
  code: string;
  dimension: Dimension;
  /** Faktor zur Basiseinheit der Dimension (g für Masse, ml für Volumen) */
  factor: number;
  label: Record<Locale, string>;
  aliases: string[];
}

export const UNITS: UnitDef[] = [
  {
    code: 'g',
    dimension: 'mass',
    factor: 1,
    label: { de: 'g', en: 'g', zh: '克' },
    aliases: ['g', 'gr', 'gramm', 'gram', 'grams', '克'],
  },
  {
    code: 'kg',
    dimension: 'mass',
    factor: 1000,
    label: { de: 'kg', en: 'kg', zh: '千克' },
    aliases: ['kg', 'kilo', 'kilogramm', 'kilogram', '千克', '公斤'],
  },
  {
    code: 'ml',
    dimension: 'volume',
    factor: 1,
    label: { de: 'ml', en: 'ml', zh: '毫升' },
    aliases: ['ml', 'milliliter', '毫升'],
  },
  { code: 'cl', dimension: 'volume', factor: 10, label: { de: 'cl', en: 'cl', zh: '厘升' }, aliases: ['cl'] },
  {
    code: 'l',
    dimension: 'volume',
    factor: 1000,
    label: { de: 'l', en: 'l', zh: '升' },
    aliases: ['l', 'liter', 'litre', 'liters', '升'],
  },
  {
    code: 'tsp',
    dimension: 'volume',
    factor: 5,
    label: { de: 'TL', en: 'tsp', zh: '茶匙' },
    aliases: ['tl', 'teelöffel', 'teeloeffel', 'tsp', 'teaspoon', 'teaspoons', '茶匙'],
  },
  {
    code: 'tbsp',
    dimension: 'volume',
    factor: 15,
    label: { de: 'EL', en: 'tbsp', zh: '汤匙' },
    aliases: ['el', 'esslöffel', 'essloeffel', 'tbsp', 'tablespoon', 'tablespoons', '汤匙'],
  },
  {
    code: 'cup',
    dimension: 'volume',
    factor: 240,
    label: { de: 'Tasse', en: 'cup', zh: '杯' },
    aliases: ['tasse', 'tassen', 'cup', 'cups', '杯'],
  },
  {
    code: 'pc',
    dimension: 'count',
    factor: 1,
    label: { de: 'Stück', en: 'pc', zh: '个' },
    aliases: ['stk', 'stück', 'stueck', 'st', 'pc', 'pcs', 'piece', 'pieces', '个'],
  },
  {
    code: 'clove',
    dimension: 'count',
    factor: 1,
    label: { de: 'Zehe', en: 'clove', zh: '瓣' },
    aliases: ['zehe', 'zehen', 'clove', 'cloves', '瓣'],
  },
  {
    code: 'slice',
    dimension: 'count',
    factor: 1,
    label: { de: 'Scheibe', en: 'slice', zh: '片' },
    aliases: ['scheibe', 'scheiben', 'slice', 'slices', '片'],
  },
  {
    code: 'can',
    dimension: 'count',
    factor: 1,
    label: { de: 'Dose', en: 'can', zh: '罐' },
    aliases: ['dose', 'dosen', 'can', 'cans', '罐'],
  },
  {
    code: 'pack',
    dimension: 'count',
    factor: 1,
    label: { de: 'Packung', en: 'pack', zh: '包' },
    aliases: ['packung', 'packungen', 'pck', 'pkg', 'päckchen', 'pack', 'packs', '包'],
  },
  {
    code: 'bunch',
    dimension: 'count',
    factor: 1,
    label: { de: 'Bund', en: 'bunch', zh: '把' },
    aliases: ['bund', 'bunch', 'bunches', '把'],
  },
  {
    code: 'pinch',
    dimension: 'other',
    factor: 1,
    label: { de: 'Prise', en: 'pinch', zh: '撮' },
    aliases: ['prise', 'prisen', 'pinch', 'pinches', '撮'],
  },
  {
    code: 'handful',
    dimension: 'other',
    factor: 1,
    label: { de: 'Handvoll', en: 'handful', zh: '把' },
    aliases: ['handvoll', 'handful', 'handfuls'],
  },
];

const byCode = new Map(UNITS.map((u) => [u.code, u]));
const byAlias = new Map<string, UnitDef>();
for (const u of UNITS) for (const a of u.aliases) byAlias.set(a.toLowerCase(), u);

/** Liest eine Einheit aus freiem Text, z. B. „EL“, „Teelöffel“ oder „tbsp“. */
export function parseUnit(raw: string | null | undefined): UnitDef | undefined {
  if (!raw) return undefined;
  const k = raw.trim().toLowerCase().replace(/\.$/, '');
  return byCode.get(k) ?? byAlias.get(k);
}

export function unitDef(code: string | null | undefined): UnitDef | undefined {
  return code ? byCode.get(code) : undefined;
}

/** Normalisiert eine Einheit auf ihren Code. Unbekannte Einheiten bleiben als Text erhalten. */
export function normalizeUnit(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  return parseUnit(raw)?.code ?? raw.trim();
}

export function unitLabel(code: string | null | undefined, locale: Locale = 'de'): string {
  if (!code) return '';
  return byCode.get(code)?.label[locale] ?? code;
}

/** Rechnet eine Menge in eine andere Einheit um, wenn beide dieselbe Dimension haben. */
export function convert(amount: number, from: string | null, to: string | null): number | null {
  if ((from ?? '') === (to ?? '')) return amount;
  const a = unitDef(from);
  const b = unitDef(to);
  if (!a || !b || a.dimension !== b.dimension || a.dimension === 'other') return null;
  if (a.dimension === 'count' && a.code !== b.code) return null;
  return (amount * a.factor) / b.factor;
}

/** Wählt eine gut lesbare Einheit, z. B. 1500 g als 1,5 kg. */
export function humanize(amount: number, unit: string | null): { amount: number; unit: string | null } {
  if (unit === 'g' && amount >= 1000) return { amount: amount / 1000, unit: 'kg' };
  if (unit === 'kg' && amount < 1) return { amount: amount * 1000, unit: 'g' };
  if (unit === 'ml' && amount >= 1000) return { amount: amount / 1000, unit: 'l' };
  if (unit === 'l' && amount < 1) return { amount: amount * 1000, unit: 'ml' };
  return { amount, unit };
}

const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.333, '⅓'],
  [0.5, '½'],
  [0.667, '⅔'],
  [0.75, '¾'],
];

/** Zeigt Mengen wie in einem Kochbuch, also „1 ½“ statt „1.5“ und ganze Gramm. */
export function formatAmount(
  amount: number | null | undefined,
  unit?: string | null,
  locale: Locale = 'de',
): string {
  if (amount == null || Number.isNaN(amount)) return '';
  const def = unitDef(unit ?? null);
  const metric =
    def &&
    (def.dimension === 'mass' || def.dimension === 'volume') &&
    ['g', 'ml', 'kg', 'l', 'cl'].includes(def.code);
  if (metric) {
    const rounded =
      amount >= 100
        ? Math.round(amount / 5) * 5
        : amount >= 10
          ? Math.round(amount)
          : Math.round(amount * 10) / 10;
    return rounded.toLocaleString(locale === 'zh' ? 'zh-CN' : locale);
  }
  const whole = Math.floor(amount);
  const rest = amount - whole;
  if (rest < 0.08) return String(whole || (amount > 0 ? '' : '0')) || '0';
  if (rest > 0.92) return String(whole + 1);
  let best = FRACTIONS[0]!;
  for (const f of FRACTIONS) if (Math.abs(f[0] - rest) < Math.abs(best[0] - rest)) best = f;
  return whole ? `${whole} ${best[1]}` : best[1];
}

export function formatQuantity(
  amount: number | null | undefined,
  unit: string | null | undefined,
  locale: Locale = 'de',
) {
  if (amount == null) return unit ? unitLabel(unit, locale) : '';
  const h = humanize(amount, unit ?? null);
  const a = formatAmount(h.amount, h.unit, locale);
  const u = unitLabel(h.unit, locale);
  return u ? `${a} ${u}` : a;
}
