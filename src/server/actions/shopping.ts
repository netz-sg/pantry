'use server';

import type { z } from 'zod';
import type { shoppingItemInput, shoppingItemPatch } from '@/lib/schemas';
import * as svc from '../services/shopping';
import { run } from './run';

type ShoppingInput = z.input<typeof shoppingItemInput>;
type ShoppingPatch = z.input<typeof shoppingItemPatch>;

/** Freitext wie „2 kg Kartoffeln“. */
export async function quickAddShopping(text: string) {
  return run((u) => {
    const row = svc.quickAddShopping(u.id, text);
    return { id: row.id };
  });
}

export async function addShoppingItem(input: ShoppingInput) {
  return run((u) => ({ id: svc.addShoppingItem(u.id, input).id }));
}

export async function updateShoppingItem(id: string, patch: ShoppingPatch) {
  return run((u) => ({ id: svc.updateShoppingItem(u.id, id, patch).id }));
}

export async function setShoppingChecked(id: string, checked: boolean) {
  return run((u) => ({ id: svc.setChecked(u.id, id, checked).id }));
}

export async function deleteShoppingItem(id: string) {
  return run((u) => svc.deleteShoppingItem(u.id, id));
}

/** Stellt einen gelöschten Eintrag wieder her, auch abgehakt. */
export async function restoreShoppingItem(input: ShoppingInput & { checked?: boolean }) {
  return run((u) => {
    const { checked, ...rest } = input;
    const row = svc.addShoppingItem(u.id, rest);
    if (checked) svc.setChecked(u.id, row.id, true);
    return { id: row.id };
  });
}

export async function clearCheckedShopping() {
  return run((u) => svc.clearChecked(u.id));
}

/** Bucht Abgehaktes in den Vorrat. Liefert die Anzahl. */
export async function finishShopping() {
  return run((u) => svc.finishShopping(u.id));
}
