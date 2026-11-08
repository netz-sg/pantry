'use server';

import type { z } from 'zod';
import type { pantryItemInput } from '@/lib/schemas';
import * as barcode from '../services/barcode';
import * as svc from '../services/pantry';
import { addRunningLowFromPantry } from '../services/shopping';
import { run } from './run';

type PantryInput = z.input<typeof pantryItemInput>;

export async function createPantryItem(input: PantryInput) {
  return run((u) => ({ id: svc.createPantryItem(u.id, input).id }));
}

export async function updatePantryItem(id: string, input: PantryInput) {
  return run((u) => ({ id: svc.updatePantryItem(u.id, id, input).id }));
}

export async function adjustPantryQuantity(id: string, delta: number) {
  return run((u) => {
    const row = svc.adjustPantryQuantity(u.id, id, delta);
    return { id: row.id, quantity: row.quantity };
  });
}

export async function deletePantryItem(id: string) {
  return run((u) => svc.deletePantryItem(u.id, id));
}

/** Schlägt einen Barcode nach, ohne die Seite neu zu laden. */
export async function lookupBarcode(code: string) {
  return run(() => barcode.lookupBarcode(code.trim()), { revalidate: false });
}

/** Setzt fast Leeres und Abgelaufenes auf die Einkaufsliste. */
export async function addLowToShopping() {
  return run((u) => addRunningLowFromPantry(u.id));
}
