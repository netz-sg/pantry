'use client';

import { useTranslations } from 'next-intl';
import { ScanBarcode, Trash2 } from 'lucide-react';
import { type FormEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { Stepper } from '@/components/ui/stepper';
import { callAction } from '@/lib/action-client';
import { formatQuantity, type Locale } from '@/lib/units';
import { createPantryItem, lookupBarcode, updatePantryItem } from '@/server/actions/pantry';
import { fieldErrors, unitOptions } from './shared';
import { stepFor, type PantryEntry, type PantryPlace } from './types';

export type SheetState = { mode: 'add'; name: string } | { mode: 'edit'; item: PantryEntry };

const FORM_ID = 'pantry-item-form';

/** Sheet zum Anlegen und Bearbeiten eines Vorratseintrags. */
export function PantryItemSheet({
  state,
  open,
  onOpenChange,
  locations,
  defaultLocationId,
  liveQuantity,
  onAdjust,
  onDelete,
  onCreated,
  locale,
}: {
  state: SheetState | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  locations: PantryPlace[];
  defaultLocationId: string | null;
  /** Aktuelle Menge aus der optimistischen Liste, für den Stepper */
  liveQuantity: number | null;
  onAdjust: (item: PantryEntry, delta: number) => void;
  onDelete: (item: PantryEntry) => void;
  onCreated: () => void;
  locale: Locale;
}) {
  const t = useTranslations('pantry');
  const tc = useTranslations('common');
  const edit = state?.mode === 'edit' ? state.item : null;
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={edit ? t('editTitle') : t('addTitle')}
      footer={
        state ? (
          <>
            {edit ? (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                className="md:mr-auto md:h-10 md:px-4 md:text-subhead"
                onClick={() => onDelete(edit)}
              >
                <Trash2 aria-hidden /> {tc('actions.delete')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="md:h-10 md:px-4 md:text-subhead"
                onClick={() => onOpenChange(false)}
              >
                {tc('actions.cancel')}
              </Button>
            )}
            <Button type="submit" form={FORM_ID} size="lg" className="md:h-10 md:px-4 md:text-subhead">
              {edit ? tc('actions.save') : tc('actions.add')}
            </Button>
          </>
        ) : null
      }
    >
      {state ? (
        <ItemForm
          key={edit ? edit.id : `add-${state.mode === 'add' ? state.name : ''}`}
          state={state}
          locations={locations}
          defaultLocationId={defaultLocationId}
          liveQuantity={liveQuantity}
          onAdjust={onAdjust}
          onDone={(created) => {
            onOpenChange(false);
            if (created) onCreated();
          }}
          locale={locale}
        />
      ) : null}
    </Sheet>
  );
}

function numText(n: number | null | undefined, locale: Locale) {
  if (n == null) return '';
  const s = String(Math.round(n * 1000) / 1000);
  return locale === 'de' ? s.replace('.', ',') : s;
}

function ItemForm({
  state,
  locations,
  defaultLocationId,
  liveQuantity,
  onAdjust,
  onDone,
  locale,
}: {
  state: SheetState;
  locations: PantryPlace[];
  defaultLocationId: string | null;
  liveQuantity: number | null;
  onAdjust: (item: PantryEntry, delta: number) => void;
  onDone: (created: boolean) => void;
  locale: Locale;
}) {
  const t = useTranslations('pantry');
  const item = state.mode === 'edit' ? state.item : null;
  const [name, setName] = useState(item?.name ?? (state.mode === 'add' ? state.name : ''));
  const [quantity, setQuantity] = useState(item ? numText(item.quantity, locale) : '1');
  const [unit, setUnit] = useState(item?.unit ?? 'pc');
  const [locationId, setLocationId] = useState(
    item ? (item.locationId ?? '') : (defaultLocationId ?? locations[0]?.id ?? ''),
  );
  const [expiresOn, setExpiresOn] = useState(item?.expiresOn ?? '');
  const [purchasedOn, setPurchasedOn] = useState(item?.purchasedOn ?? '');
  const [minQuantity, setMinQuantity] = useState(numText(item?.minQuantity, locale));
  const [barcode, setBarcode] = useState(item?.barcode ?? '');
  const [note, setNote] = useState(item?.note ?? '');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();
  const [looking, startLookup] = useTransition();

  const err = (k: string) => errors[k];
  const live = liveQuantity ?? item?.quantity ?? 0;
  const barcodeOk = /^\d{8,14}$/.test(barcode.trim());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const input = {
      name,
      quantity: quantity.replace(',', '.'),
      unit,
      locationId: locationId || null,
      expiresOn,
      purchasedOn,
      minQuantity,
      barcode,
      note,
    };
    startTransition(async () => {
      const res = item ? await updatePantryItem(item.id, input) : await createPantryItem(input);
      if (!res.ok) {
        setErrors(fieldErrors(res));
        toast.error(res.error.message);
        return;
      }
      if (!item) toast.success(t('created', { name: name.trim() }));
      onDone(!item);
    });
  };

  const lookup = () => {
    startLookup(async () => {
      const res = await callAction(lookupBarcode(barcode.trim()));
      if (res === undefined) return;
      if (!res) {
        toast(t('lookupNotFound'));
        return;
      }
      setName(res.name);
      if (res.quantity != null) setQuantity(numText(res.quantity, locale));
      if (res.unit) setUnit(res.unit);
      toast.success(t('lookupFound', { name: res.name }));
    });
  };

  return (
    <form id={FORM_ID} onSubmit={submit} className="grid gap-4 pt-1" aria-busy={pending}>
      {item ? (
        <div className="flex items-center justify-between gap-3 rounded-[14px] bg-surface px-4 py-3 shadow-elevated">
          <div className="min-w-0">
            <p className="text-footnote font-semibold text-label-2">{t('stepper')}</p>
            <p className="text-footnote text-label-3">{t('quickAmount')}</p>
          </div>
          <Stepper
            value={live}
            min={0}
            max={100000}
            step={stepFor(item.unit, live)}
            label={t('stepper')}
            format={(v) => formatQuantity(v, item.unit, locale)}
            onChange={(v) => {
              onAdjust(item, v - live);
              setQuantity(numText(v, locale));
            }}
          />
        </div>
      ) : null}

      <Field label={t('fields.name')} htmlFor="pi-name" error={err('name')}>
        <Input
          id="pi-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          aria-invalid={!!err('name')}
          autoComplete="off"
          autoFocus={!item && !name}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fields.quantity')} htmlFor="pi-qty" error={err('quantity')}>
          <Input
            id="pi-qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="decimal"
            required
            aria-invalid={!!err('quantity')}
            autoComplete="off"
          />
        </Field>
        <Field label={t('fields.unit')} htmlFor="pi-unit" error={err('unit')}>
          <Select id="pi-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {unitOptions(locale, unit).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t('fields.location')} htmlFor="pi-loc" error={err('locationId')}>
        <Select id="pi-loc" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">{t('noLocation')}</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fields.expiresOn')} htmlFor="pi-exp" error={err('expiresOn')}>
          <Input
            id="pi-exp"
            type="date"
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            aria-invalid={!!err('expiresOn')}
          />
        </Field>
        <Field label={t('fields.purchasedOn')} htmlFor="pi-bought" error={err('purchasedOn')}>
          <Input
            id="pi-bought"
            type="date"
            value={purchasedOn}
            onChange={(e) => setPurchasedOn(e.target.value)}
            aria-invalid={!!err('purchasedOn')}
          />
        </Field>
      </div>
      <Field
        label={t('fields.minQuantity')}
        htmlFor="pi-min"
        error={err('minQuantity')}
        hint={t('fields.minHint')}
      >
        <Input
          id="pi-min"
          value={minQuantity}
          onChange={(e) => setMinQuantity(e.target.value)}
          inputMode="decimal"
          aria-invalid={!!err('minQuantity')}
          autoComplete="off"
        />
      </Field>
      <Field
        label={t('fields.barcode')}
        htmlFor="pi-barcode"
        error={err('barcode')}
        hint={t('fields.barcodeHint')}
      >
        <div className="flex gap-2">
          <Input
            id="pi-barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            maxLength={14}
            aria-invalid={!!err('barcode')}
            autoComplete="off"
            className="tabular flex-1"
          />
          <Button
            type="button"
            variant="tinted"
            className="h-11"
            onClick={lookup}
            disabled={!barcodeOk || looking}
            aria-busy={looking}
          >
            <ScanBarcode aria-hidden /> {t('fields.lookup')}
          </Button>
        </div>
      </Field>
      <Field label={t('fields.note')} htmlFor="pi-note" error={err('note')}>
        <Textarea
          id="pi-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          className="min-h-20"
        />
      </Field>
    </form>
  );
}
