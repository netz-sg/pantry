import { describe, expect, it } from 'vitest';
import { classifyAisle } from '@/lib/aisles';
import { daysUntil, expiryState, weekDays, weekStart } from '@/lib/dates';
import { foodKey, keysMatch } from '@/lib/food-key';
import { parseIngredientLine } from '@/lib/quantity';
import { convert, formatAmount, formatQuantity, parseUnit } from '@/lib/units';
import { isPrivateAddress } from '@/server/lib/safe-fetch';
import { parseDuration, parseRecipeHtml } from '@/server/services/importer';

describe('Zutaten-Parser', () => {
  it.each([
    ['200 g Mehl', 200, 'g', 'Mehl', null],
    ['1 ½ EL Olivenöl (kaltgepresst)', 1.5, 'tbsp', 'Olivenöl', 'kaltgepresst'],
    ['1 1/2 TL Salz', 1.5, 'tsp', 'Salz', null],
    ['½ Zitrone', 0.5, null, 'Zitrone', null],
    ['2–3 Knoblauchzehen', 2, 'clove', 'Knoblauch', 'bis 3'],
    ['3 Eier', 3, null, 'Eier', null],
    ['Salz und Pfeffer', null, null, 'Salz und Pfeffer', null],
    ['1,5 l Gemüsebrühe', 1.5, 'l', 'Gemüsebrühe', null],
    ['2 cups flour', 2, 'cup', 'flour', null],
    ['500g Hackfleisch', 500, 'g', 'Hackfleisch', null],
  ])('%s', (line, amount, unit, name, note) => {
    const p = parseIngredientLine(line);
    expect(p.amount).toBe(amount);
    expect(p.unit).toBe(unit);
    expect(p.name).toBe(name);
    expect(p.note).toBe(note);
  });
});

describe('Einheiten', () => {
  it('erkennt deutsche und englische Einheiten', () => {
    expect(parseUnit('EL')?.code).toBe('tbsp');
    expect(parseUnit('Teelöffel')?.code).toBe('tsp');
    expect(parseUnit('Stk.')?.code).toBe('pc');
  });
  it('rechnet um und verweigert Unsinn', () => {
    expect(convert(1, 'kg', 'g')).toBe(1000);
    expect(convert(3, 'tsp', 'tbsp')).toBe(1);
    expect(convert(1, 'kg', 'ml')).toBeNull();
    expect(convert(1, 'can', 'pc')).toBeNull();
  });
  it('formatiert Mengen wie im Kochbuch', () => {
    expect(formatAmount(1.5, 'tbsp')).toBe('1 ½');
    expect(formatAmount(0.25, 'tsp')).toBe('¼');
    expect(formatAmount(333.3, 'g')).toBe('335');
    expect(formatQuantity(1500, 'g')).toBe('1,5 kg');
    expect(formatQuantity(2, 'tbsp')).toBe('2 EL');
  });
});

describe('Lebensmittel-Schlüssel', () => {
  it('vereinheitlicht Plural und Umlaute', () => {
    expect(foodKey('Rote Zwiebeln')).toBe(foodKey('rote Zwiebel'));
    expect(foodKey('Tomaten')).toBe(foodKey('Tomate'));
    expect(foodKey('Eier')).toBe(foodKey('Ei'));
  });
  it('erkennt Teilnamen', () => {
    expect(keysMatch(foodKey('Babyspinat'), foodKey('Spinat'))).toBe(true);
    expect(keysMatch(foodKey('Reis'), foodKey('Reisessig'))).toBe(false);
  });
});

describe('Gänge', () => {
  it('ordnet Lebensmittel zu', () => {
    expect(classifyAisle('Babyspinat')).toBe('produce');
    expect(classifyAisle('Bergkäse')).toBe('dairy');
    expect(classifyAisle('Kreuzkümmel')).toBe('spices');
    expect(classifyAisle('Kokosmilch')).toBe('canned');
    expect(classifyAisle('Spaghetti')).toBe('dry');
  });
});

describe('Datum', () => {
  it('rechnet Wochen und Ablauf in lokaler Zeit', () => {
    expect(weekStart('2026-11-08')).toBe('2026-11-02');
    expect(weekDays('2026-11-09')).toHaveLength(7);
    expect(daysUntil('2026-11-09', '2026-11-08')).toBe(1);
    expect(expiryState('2026-11-07', '2026-11-08')).toBe('expired');
    expect(expiryState('2026-11-09', '2026-11-08')).toBe('soon');
    expect(expiryState('2026-11-12', '2026-11-08')).toBe('week');
  });
});

describe('Sicherer Abruf', () => {
  it('blockt private Adressen', () => {
    for (const ip of [
      '127.0.0.1',
      '10.1.2.3',
      '192.168.178.1',
      '169.254.169.254',
      '172.20.0.1',
      '::1',
      'fd00::1',
      '::ffff:127.0.0.1',
    ]) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
    expect(isPrivateAddress('93.184.216.34')).toBe(false);
  });
});

describe('Rezept-Import', () => {
  it('liest Dauern', () => {
    expect(parseDuration('PT1H30M')).toBe(90);
    expect(parseDuration('P0DT20M')).toBe(20);
    expect(parseDuration('PT45S')).toBe(1);
  });
  it('liest JSON-LD mit @graph', () => {
    const html = `<html><script type="application/ld+json">${JSON.stringify({
      '@graph': [
        { '@type': 'WebPage' },
        {
          '@type': 'Recipe',
          name: 'Linsen-Dal',
          recipeYield: '4 Portionen',
          prepTime: 'PT10M',
          cookTime: 'PT25M',
          image: ['https://example.com/dal.jpg'],
          recipeIngredient: ['250 g rote Linsen', '1 Dose Kokosmilch'],
          recipeInstructions: [
            { '@type': 'HowToSection', itemListElement: [{ '@type': 'HowToStep', text: 'Kochen.' }] },
          ],
        },
      ],
    })}</script></html>`;
    const r = parseRecipeHtml(html, 'https://example.com/dal');
    expect(r.input.title).toBe('Linsen-Dal');
    expect(r.input.servings).toBe(4);
    expect(r.input.ingredients[1]).toMatchObject({ amount: 1, unit: 'can', name: 'Kokosmilch' });
    expect(r.input.steps[0]!.text).toBe('Kochen.');
    expect(r.imageUrl).toBe('https://example.com/dal.jpg');
  });
});
