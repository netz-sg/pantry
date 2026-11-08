import { AppError } from '../lib/errors';
import { safeFetch } from '../lib/safe-fetch';

export interface BarcodeProduct {
  name: string;
  quantity: number | null;
  unit: string | null;
  brand: string | null;
}

/** Schlägt einen Barcode bei Open Food Facts nach. */
export async function lookupBarcode(code: string): Promise<BarcodeProduct | null> {
  if (!/^\d{8,14}$/.test(code)) throw new AppError('validation', 'Barcode besteht aus 8 bis 14 Ziffern');
  try {
    const { body } = await safeFetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_de,brands,product_quantity,product_quantity_unit`,
      { maxBytes: 512 * 1024, timeoutMs: 8000, accept: 'application/json' },
    );
    const data = JSON.parse(body.toString('utf8')) as {
      status?: number;
      product?: {
        product_name?: string;
        product_name_de?: string;
        brands?: string;
        product_quantity?: string | number;
        product_quantity_unit?: string;
      };
    };
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const name = (p.product_name_de || p.product_name || '').trim();
    if (!name) return null;
    const q = Number(p.product_quantity);
    return {
      name: name.slice(0, 120),
      quantity: Number.isFinite(q) && q > 0 ? q : null,
      unit: p.product_quantity_unit?.toLowerCase() === 'ml' ? 'ml' : p.product_quantity_unit ? 'g' : null,
      brand: p.brands?.split(',')[0]?.trim() ?? null,
    };
  } catch {
    return null;
  }
}
