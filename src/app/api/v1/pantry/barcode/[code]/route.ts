import { apiRoute } from '@/server/lib/api';
import { notFound } from '@/server/lib/errors';
import { lookupBarcode } from '@/server/services/barcode';

export const GET = apiRoute<{ code: string }>(async ({ params }) => {
  const p = await lookupBarcode(params.code);
  if (!p) throw notFound('Produkt');
  return p;
});
