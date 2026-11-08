'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Stepper } from '@/components/ui/stepper';
import { Switch } from './switch';

/** Sheet für „Gekocht“. Portionen und ob vom Vorrat abgezogen wird. */
export function CookedSheet({
  open,
  onOpenChange,
  servings,
  title,
  description,
  submitLabel,
  showServings = true,
  extra,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  servings: number;
  title: string;
  description: string;
  submitLabel: string;
  showServings?: boolean;
  extra?: ReactNode;
  onSubmit: (v: { servings: number; deduct: boolean }) => Promise<unknown>;
}) {
  const t = useTranslations('recipes.cookedSheet');
  const tc = useTranslations('common.actions');
  const [count, setCount] = useState(servings);
  const [prevServings, setPrevServings] = useState(servings);
  const [deduct, setDeduct] = useState(true);
  const [pending, startTransition] = useTransition();

  if (servings !== prevServings) {
    setPrevServings(servings);
    setCount(servings);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {tc('cancel')}
          </Button>
          <Button
            onClick={() => startTransition(async () => void (await onSubmit({ servings: count, deduct })))}
            disabled={pending}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 pt-1">
        {extra}
        {showServings ? (
          <div className="flex items-center justify-between rounded-[14px] bg-surface py-2 pr-2 pl-4">
            <span className="text-body">{t('servings')}</span>
            <Stepper value={count} onChange={setCount} min={1} max={100} label={t('servings')} />
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 rounded-[14px] bg-surface px-4 py-3">
          <label htmlFor="cooked-deduct" className="min-w-0">
            <span className="block text-body">{t('deduct')}</span>
            <span className="block text-footnote text-label-2">{t('deductHint')}</span>
          </label>
          <Switch id="cooked-deduct" checked={deduct} onCheckedChange={setDeduct} />
        </div>
      </div>
    </Sheet>
  );
}
