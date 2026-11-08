'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { type FormEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { fieldErrors, unitOptions } from '@/components/pantry/shared';
import { AISLES, aisleLabel } from '@/lib/aisles';
import type { Locale } from '@/lib/units';
import { updateShoppingItem } from '@/server/actions/shopping';
import { isAisle, type ShopItem } from './types';

/** Sheet zum Bearbeiten eines Eintrags. */
export function ShoppingItemSheet({
  item,
  open,
  onOpenChange,
  onDelete,
  locale,
}: {
  item: ShopItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDelete: (item: ShopItem) => void;
  locale: Locale;
}) {
  const t = useTranslations('shopping');
  const tc = useTranslations('common');
  const formId = 'shopping-item-form';
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('edit')}
      footer={
        item ? (
          <>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="md:mr-auto md:h-10 md:px-4 md:text-subhead"
              onClick={() => onDelete(item)}
            >
              <Trash2 aria-hidden /> {tc('actions.delete')}
            </Button>
            <Button type="submit" form={formId} size="lg" className="md:h-10 md:px-4 md:text-subhead">
              {tc('actions.save')}
            </Button>
          </>
        ) : null
      }
    >
      {item ? (
        <ItemForm key={item.id} id={formId} item={item} locale={locale} onDone={() => onOpenChange(false)} />
      ) : null}
    </Sheet>
  );
}

function ItemForm({
  id,
  item,
  locale,
  onDone,
}: {
  id: string;
  item: ShopItem;
  locale: Locale;
  onDone: () => void;
}) {
  const t = useTranslations('shopping');
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(
    item.quantity == null ? '' : String(item.quantity).replace('.', locale === 'de' ? ',' : '.'),
  );
  const [unit, setUnit] = useState(item.unit ?? '');
  const [aisle, setAisle] = useState(isAisle(item.aisle) ? item.aisle : 'other');
  const [note, setNote] = useState(item.note ?? '');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateShoppingItem(item.id, {
        name,
        quantity,
        unit,
        aisle: isAisle(aisle) ? aisle : 'other',
        note,
      });
      if (!res.ok) {
        setErrors(fieldErrors(res));
        toast.error(res.error.message);
        return;
      }
      onDone();
    });
  };

  const err = (k: string) => errors[k];
  return (
    <form id={id} onSubmit={submit} className="grid gap-4 pt-1" aria-busy={pending}>
      <Field label={t('fields.name')} htmlFor="si-name" error={err('name')}>
        <Input
          id="si-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          aria-invalid={!!err('name')}
          autoComplete="off"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fields.quantity')} htmlFor="si-qty" error={err('quantity')}>
          <Input
            id="si-qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="decimal"
            aria-invalid={!!err('quantity')}
            autoComplete="off"
          />
        </Field>
        <Field label={t('fields.unit')} htmlFor="si-unit" error={err('unit')}>
          <Select id="si-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">{t('fields.noUnit')}</option>
            {unitOptions(locale, item.unit).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t('fields.aisle')} htmlFor="si-aisle">
        <Select
          id="si-aisle"
          value={aisle}
          onChange={(e) => setAisle(isAisle(e.target.value) ? e.target.value : 'other')}
        >
          {AISLES.map((a) => (
            <option key={a} value={a}>
              {aisleLabel(a, locale)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t('fields.note')} htmlFor="si-note" error={err('note')}>
        <Input
          id="si-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          placeholder={t('fields.notePlaceholder')}
          autoComplete="off"
        />
      </Field>
    </form>
  );
}
