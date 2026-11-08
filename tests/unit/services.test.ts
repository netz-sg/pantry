import { beforeEach, describe, expect, it } from 'vitest';
import { toDateKey } from '@/lib/dates';
import { setupTestDb } from './helpers';
import { createRecipe, deleteRecipe, getRecipe, listRecipes, setFavorite } from '@/server/services/recipes';
import { createPantryItem, listLocations, listPantry, consumeFromPantry } from '@/server/services/pantry';
import {
  addMissingForRecipe,
  addShoppingItem,
  finishShopping,
  listShopping,
  quickAddShopping,
  setChecked,
} from '@/server/services/shopping';
import { addEntry, getWeek, markCooked, shoppingForRange, copyWeek } from '@/server/services/plan';
import { exportData, importData } from '@/server/services/backup';
import { getToday } from '@/server/services/today';

let ctx: Awaited<ReturnType<typeof setupTestDb>>;

const shakshuka = {
  title: 'Shakshuka mit Spinat',
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 15,
  tags: ['schnell', 'vegetarisch'],
  categoryName: 'Abendessen',
  ingredients: [
    { name: 'Eier', amount: 6, unit: 'pc' },
    { name: 'Tomaten aus der Dose', amount: 800, unit: 'g' },
    { name: 'Babyspinat', amount: 150, unit: 'g' },
    { name: 'Salz', amount: null, unit: null },
  ],
  steps: [{ text: 'Tomaten einkochen' }, { text: 'Eier hineinschlagen', timerSeconds: 360 }],
};

beforeEach(async () => {
  ctx = await setupTestDb();
});

describe('Rezepte', () => {
  it('legt ein Rezept mit Zutaten, Schritten, Tags und Kategorie an', () => {
    const id = createRecipe(ctx.userId, shakshuka);
    const r = getRecipe(ctx.userId, id)!;
    expect(r.title).toBe('Shakshuka mit Spinat');
    expect(r.ingredients).toHaveLength(4);
    expect(r.steps[1]!.timerSeconds).toBe(360);
    expect(r.tags.sort()).toEqual(['schnell', 'vegetarisch']);
    expect(r.category?.name).toBe('Abendessen');
  });

  it('findet Rezepte per Volltextsuche, auch über Zutaten', () => {
    createRecipe(ctx.userId, shakshuka);
    createRecipe(ctx.userId, {
      title: 'Kürbissuppe',
      ingredients: [{ name: 'Hokkaido', amount: 1, unit: 'pc' }],
    });
    expect(listRecipes(ctx.userId, { q: 'spinat' }).items.map((r) => r.title)).toEqual([
      'Shakshuka mit Spinat',
    ]);
    expect(listRecipes(ctx.userId, { q: 'hokk' }).items.map((r) => r.title)).toEqual(['Kürbissuppe']);
    expect(listRecipes(ctx.userId, { q: 'kurbis' }).total).toBe(1);
  });

  it('zeigt fehlende Zutaten und filtert kochbare Rezepte', () => {
    createRecipe(ctx.userId, shakshuka);
    const before = listRecipes(ctx.userId).items[0]!;
    expect(before.missingCount).toBe(4);
    createPantryItem(ctx.userId, { name: 'Eier', quantity: 10, unit: 'Stück' });
    createPantryItem(ctx.userId, { name: 'Tomaten aus der Dose', quantity: 1, unit: 'kg' });
    createPantryItem(ctx.userId, { name: 'Spinat', quantity: 200, unit: 'g' });
    createPantryItem(ctx.userId, { name: 'Salz', quantity: 1, unit: 'pack' });
    const after = listRecipes(ctx.userId, { cookable: true });
    expect(after.total).toBe(1);
  });

  it('löscht Rezepte, auch wenn sie im Plan und auf der Liste stehen', async () => {
    const id = createRecipe(ctx.userId, shakshuka);
    addEntry(ctx.userId, { date: '2026-11-09', slot: 'dinner', recipeId: id, servings: 2 });
    addShoppingItem(ctx.userId, { name: 'Eier', quantity: 6, unit: 'pc', recipeId: id });
    await deleteRecipe(ctx.userId, id);
    expect(getRecipe(ctx.userId, id)).toBeNull();
    expect(listShopping(ctx.userId)[0]!.recipeId).toBeNull();
  });

  it('lässt keinen Zugriff auf fremde Rezepte zu', () => {
    const id = createRecipe(ctx.userId, shakshuka);
    expect(getRecipe('someone-else', id)).toBeNull();
    expect(() => setFavorite('someone-else', id, true)).toThrow();
  });
});

describe('Einkaufsliste', () => {
  it('fasst gleiche Lebensmittel zusammen und rechnet Einheiten um', () => {
    addShoppingItem(ctx.userId, { name: 'Mehl', quantity: 500, unit: 'g' });
    addShoppingItem(ctx.userId, { name: 'Mehl', quantity: 1, unit: 'kg' });
    const list = listShopping(ctx.userId);
    expect(list).toHaveLength(1);
    expect(list[0]!.quantity).toBe(1500);
    expect(list[0]!.aisle).toBe('dry');
  });

  it('versteht die Schnelleingabe', () => {
    const item = quickAddShopping(ctx.userId, '2 kg Kartoffeln');
    expect(item.name).toBe('Kartoffeln');
    expect(item.quantity).toBe(2);
    expect(item.unit).toBe('kg');
    expect(item.aisle).toBe('produce');
  });

  it('setzt nur fehlende Mengen eines Rezepts auf die Liste', () => {
    const id = createRecipe(ctx.userId, shakshuka);
    createPantryItem(ctx.userId, { name: 'Eier', quantity: 4, unit: 'pc' });
    createPantryItem(ctx.userId, { name: 'Tomaten aus der Dose', quantity: 800, unit: 'g' });
    addMissingForRecipe(ctx.userId, id);
    const names = Object.fromEntries(listShopping(ctx.userId).map((s) => [s.name, s.quantity]));
    expect(names['Eier']).toBe(2);
    expect(names['Babyspinat']).toBe(150);
    expect(names['Tomaten aus der Dose']).toBeUndefined();
  });

  it('bucht abgehakte Einträge in den Vorrat', () => {
    const a = addShoppingItem(ctx.userId, { name: 'Milch', quantity: 1, unit: 'l' });
    addShoppingItem(ctx.userId, { name: 'Butter', quantity: 250, unit: 'g' });
    setChecked(ctx.userId, a.id, true);
    expect(finishShopping(ctx.userId)).toBe(1);
    expect(listShopping(ctx.userId).map((s) => s.name)).toEqual(['Butter']);
    const milk = listPantry(ctx.userId).find((p) => p.name === 'Milch')!;
    expect(milk.quantity).toBe(1);
    expect(milk.location?.name).toBe('Kühlschrank');
  });
});

describe('Wochenplan', () => {
  it('erzeugt die Einkaufsliste für die Woche abzüglich Vorrat', () => {
    const id = createRecipe(ctx.userId, shakshuka);
    addEntry(ctx.userId, { date: '2026-11-09', slot: 'dinner', recipeId: id, servings: 4 });
    addEntry(ctx.userId, { date: '2026-11-10', slot: 'breakfast', recipeId: id, servings: 2 });
    createPantryItem(ctx.userId, { name: 'Eier', quantity: 5, unit: 'pc' });
    shoppingForRange(ctx.userId, '2026-11-09', '2026-11-15');
    const eggs = listShopping(ctx.userId).find((s) => s.name === 'Eier')!;
    expect(eggs.quantity).toBe(4);
  });

  it('zieht beim Kochen Zutaten vom Vorrat ab', () => {
    const id = createRecipe(ctx.userId, shakshuka);
    createPantryItem(ctx.userId, { name: 'Eier', quantity: 10, unit: 'pc' });
    const e = addEntry(ctx.userId, {
      date: toDateKey(new Date()),
      slot: 'dinner',
      recipeId: id,
      servings: 2,
    });
    markCooked(ctx.userId, e.id, true);
    expect(listPantry(ctx.userId).find((p) => p.name === 'Eier')!.quantity).toBe(7);
    expect(getRecipe(ctx.userId, id)!.cookCount).toBe(1);
  });

  it('erlaubt Einträge ohne Rezept und kopiert Wochen', () => {
    addEntry(ctx.userId, { date: '2026-11-09', slot: 'dinner', title: 'Essen gehen' });
    expect(copyWeek(ctx.userId, '2026-11-09', '2026-11-16')).toBe(1);
    expect(getWeek(ctx.userId, '2026-11-18').entries[0]!.title).toBe('Essen gehen');
  });

  it('verlangt Rezept oder Titel', () => {
    expect(() => addEntry(ctx.userId, { date: '2026-11-09', slot: 'dinner' })).toThrow();
  });
});

describe('Vorrat', () => {
  it('verbraucht zuerst, was am frühesten abläuft', () => {
    const loc = listLocations(ctx.userId)[0]!.id;
    createPantryItem(ctx.userId, {
      name: 'Milch',
      quantity: 1,
      unit: 'l',
      expiresOn: '2099-01-10',
      locationId: loc,
    });
    createPantryItem(ctx.userId, {
      name: 'Milch',
      quantity: 1,
      unit: 'l',
      expiresOn: '2099-01-05',
      locationId: loc,
    });
    consumeFromPantry(ctx.userId, [{ name: 'Milch', amount: 500, unit: 'ml' }]);
    const items = listPantry(ctx.userId).sort((a, b) => a.expiresOn!.localeCompare(b.expiresOn!));
    expect(items[0]!.quantity).toBe(0.5);
    expect(items[1]!.quantity).toBe(1);
  });
});

describe('Sicherung', () => {
  it('exportiert und importiert alle Daten', async () => {
    createRecipe(ctx.userId, shakshuka);
    createPantryItem(ctx.userId, { name: 'Eier', quantity: 4, unit: 'pc' });
    const data = JSON.parse(JSON.stringify(exportData(ctx.userId)));
    const fresh = await setupTestDb();
    const res = importData(fresh.userId, data);
    expect(res).toEqual({ recipes: 1, pantry: 1 });
    expect(listRecipes(fresh.userId).items[0]!.title).toBe('Shakshuka mit Spinat');
  });
});

describe('Heute', () => {
  it('liefert die Startseite ohne Fehler, auch leer', () => {
    const t = getToday(ctx.userId);
    expect(t.recipeCount).toBe(0);
    expect(t.shopping.open).toBe(0);
  });
});

describe('Kalender-Abo', () => {
  it('erkennt nur den aktuellen Link', async () => {
    const { rotateCalendarToken, revokeCalendarToken, userIdForCalendarToken } =
      await import('@/server/services/user');
    const first = rotateCalendarToken(ctx.userId);
    expect(userIdForCalendarToken(first)).toBe(ctx.userId);
    const second = rotateCalendarToken(ctx.userId);
    expect(userIdForCalendarToken(first)).toBeNull();
    expect(userIdForCalendarToken(second)).toBe(ctx.userId);
    revokeCalendarToken(ctx.userId);
    expect(userIdForCalendarToken(second)).toBeNull();
    expect(userIdForCalendarToken('../../etc/passwd')).toBeNull();
  });
});

describe('Fast Leeres', () => {
  it('setzt fast Leeres einmal auf die Liste', async () => {
    const { addRunningLowFromPantry } = await import('@/server/services/shopping');
    createPantryItem(ctx.userId, { name: 'Haferflocken', quantity: 50, unit: 'g', minQuantity: 100 });
    expect(addRunningLowFromPantry(ctx.userId)).toBe(1);
    expect(addRunningLowFromPantry(ctx.userId)).toBe(0);
  });
});
