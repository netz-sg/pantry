const SYNONYMS: Record<string, string> = {
  eier: 'ei',
  knoblauchzehe: 'knoblauch',
  knoblauchzehen: 'knoblauch',
  eggs: 'egg',
  'garlic clove': 'garlic',
  'garlic cloves': 'garlic',
  möhre: 'karotte',
  möhren: 'karotte',
  porree: 'lauch',
};

function foldDiacritics(s: string) {
  return s
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function stem(word: string) {
  if (word.length <= 4) return word;
  for (const suf of ['en', 'n', 's', 'e']) {
    if (word.endsWith(suf) && word.length - suf.length >= 4) return word.slice(0, -suf.length);
  }
  return word;
}

/**
 * Macht aus einem Lebensmittelnamen einen Schlüssel für den Abgleich.
 * „Rote Zwiebeln“ und „rote Zwiebel“ ergeben denselben Schlüssel.
 */
export function foodKey(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const syn = SYNONYMS[base] ?? base;
  return foldDiacritics(syn)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(stem)
    .join(' ');
}

/** Prüft, ob zwei Schlüssel dasselbe Lebensmittel meinen, z. B. „babyspinat“ und „spinat“. */
export function keysMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  if (short.length < 4) return false;
  const compactLong = long.replace(/\s/g, '');
  const compactShort = short.replace(/\s/g, '');
  return compactLong.endsWith(compactShort) || long.split(' ').includes(short);
}
