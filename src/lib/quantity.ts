import { parseUnit } from './units';

const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 0.25,
  '¾': 0.75,
  '⅕': 0.2,
  '⅛': 0.125,
};

export interface ParsedLine {
  amount: number | null;
  unit: string | null;
  name: string;
  note: string | null;
}

function parseNumberToken(tok: string): number | null {
  const t = tok.trim();
  if (!t) return null;
  if (UNICODE_FRACTIONS[t] != null) return UNICODE_FRACTIONS[t]!;
  const mixedUni = t.match(/^(\d+)([½⅓⅔¼¾⅕⅛])$/);
  if (mixedUni) return Number(mixedUni[1]) + UNICODE_FRACTIONS[mixedUni[2]!]!;
  const frac = t.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[2]) ? Number(frac[1]) / Number(frac[2]) : null;
  const num = Number(t.replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

/**
 * Zerlegt eine Zutatenzeile wie „1 ½ EL Olivenöl (kaltgepresst)“ oder „2–3 Knoblauchzehen“
 * in Menge, Einheit, Name und Notiz.
 */
export function parseIngredientLine(raw: string): ParsedLine {
  let s = raw.replace(/\s+/g, ' ').trim();
  let note: string | null = null;

  const paren = s.match(/\(([^)]*)\)/);
  if (paren) {
    note = paren[1]!.trim() || null;
    s = s.replace(paren[0], ' ').replace(/\s+/g, ' ').trim();
  }
  const comma = s.match(/^(.*?),\s+(.+)$/);
  if (comma && /^[\d½⅓⅔¼¾]/.test(s)) {
    s = comma[1]!.trim();
    note = [note, comma[2]!.trim()].filter(Boolean).join(', ');
  }

  // Menge, auch gemischt („1 1/2“, „1 ½“) und als Bereich („2-3“, „2–3“, „2 bis 3“)
  const amountRe =
    /^((?:\d+[.,]?\d*\s+)?(?:\d+\/\d+|\d+[½⅓⅔¼¾⅕⅛]|[½⅓⅔¼¾⅕⅛]|\d+[.,]?\d*))(?:\s*(?:-|–|bis|to)\s*(\d+[.,]?\d*))?\s*/i;
  let amount: number | null = null;
  const m = s.match(amountRe);
  if (m) {
    const parts = m[1]!.trim().split(/\s+/);
    let total = 0;
    let ok = true;
    for (const p of parts) {
      const n = parseNumberToken(p);
      if (n == null) ok = false;
      else total += n;
    }
    if (ok) {
      amount = total;
      if (m[2]) note = [note, `bis ${m[2]}`].filter(Boolean).join(', ');
      s = s.slice(m[0].length);
    }
  }

  let unit: string | null = null;
  const unitMatch = s.match(/^([\p{L}.]+)\s+(.+)$/u);
  if (unitMatch) {
    const u = parseUnit(unitMatch[1]);
    if (u) {
      unit = u.code;
      s = unitMatch[2]!;
    }
  } else if (amount != null) {
    const glued = s.match(/^([\p{L}]+)$/u);
    if (glued && parseUnit(glued[1])) {
      unit = parseUnit(glued[1])!.code;
      s = '';
    }
  }

  // „2 Knoblauchzehen“ wird zu 2 Zehen Knoblauch
  if (amount != null && !unit) {
    const zehe = s.match(/^(knoblauch)zehen?$/i);
    if (zehe) {
      unit = 'clove';
      s = 'Knoblauch';
    }
  }

  const name = s.replace(/^(of|von)\s+/i, '').trim() || raw.trim();
  return { amount, unit, name, note: note || null };
}

/** Parser für die Schnelleingabe auf der Einkaufsliste, z. B. „2 kg Kartoffeln“. */
export function parseQuickAdd(raw: string) {
  const p = parseIngredientLine(raw);
  return { name: p.name, quantity: p.amount, unit: p.unit, note: p.note };
}
