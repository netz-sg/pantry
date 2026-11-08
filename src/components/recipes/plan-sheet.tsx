'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { Stepper } from '@/components/ui/stepper';
import { callAction } from '@/lib/action-client';
import { addRecipeToPlan } from '@/server/actions/recipes';

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

/** Sheet zum Eintragen in den Wochenplan. */
export function PlanSheet({
  open,
  onOpenChange,
  recipeId,
  servings,
  today,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  recipeId: string;
  servings: number;
  today: string;
}) {
  const t = useTranslations('recipes.planSheet');
  const tc = useTranslations('common');
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>('dinner');
  const [count, setCount] = useState(servings);
  const [prevServings, setPrevServings] = useState(servings);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Portionen aus dem Rezept übernehmen, wenn sie sich dort ändern
  if (servings !== prevServings) {
    setPrevServings(servings);
    setCount(servings);
  }

  const submit = () =>
    startTransition(async () => {
      const id = await callAction(addRecipeToPlan(recipeId, { date, slot, servings: count }));
      if (id) {
        onOpenChange(false);
        toast.success(t('done'), { action: { label: t('toPlan'), onClick: () => router.push('/plan') } });
      }
    });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      description={t('description')}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {tc('actions.cancel')}
          </Button>
          <Button onClick={submit} disabled={pending || !date}>
            {t('submit')}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 pt-1">
        <Field label={t('date')} htmlFor="plan-date">
          <Input id="plan-date" type="date" value={date} required onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t('slot')} htmlFor="plan-slot">
          <Select
            id="plan-slot"
            value={slot}
            onChange={(e) => setSlot(e.target.value as (typeof SLOTS)[number])}
          >
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {tc(`slots.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-center justify-between rounded-[14px] bg-surface py-2 pr-2 pl-4">
          <span className="text-body">{t('servings')}</span>
          <Stepper value={count} onChange={setCount} min={1} max={50} label={t('servings')} />
        </div>
      </div>
    </Sheet>
  );
}
