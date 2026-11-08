'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { DropdownMenu } from 'radix-ui';
import { CalendarArrowDown, CopyPlus, Ellipsis, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { callAction } from '@/lib/action-client';
import { shiftDays } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { copyPlanWeek, shoppingForPlanWeek } from '@/server/actions/plan';

const itemClass =
  'flex min-h-11 w-full cursor-default items-center gap-3 rounded-[10px] px-3 text-body outline-none select-none data-[disabled]:opacity-45 data-[highlighted]:bg-fill [&_svg]:size-5 [&_svg]:text-tint';

/** Aktionen der Woche. Am großen Bildschirm als Knopfleiste, sonst als Menü. */
export function WeekActions({
  start,
  end,
  variant,
  className,
}: {
  start: string;
  end: string;
  variant: 'bar' | 'menu';
  className?: string;
}) {
  const t = useTranslations('plan.actions');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const calendarHref = `/api/v1/plan/calendar?from=${start}&to=${end}`;

  const shopping = () =>
    startTransition(async () => {
      const n = await callAction(shoppingForPlanWeek(start));
      if (n === undefined) return;
      if (n > 0)
        toast.success(t('shoppingDone', { count: n }), {
          action: { label: t('toList'), onClick: () => router.push('/shopping') },
        });
      else toast(t('shoppingNone'));
    });

  const copy = () =>
    startTransition(async () => {
      const n = await callAction(copyPlanWeek(start));
      if (n === undefined) return;
      const next = shiftDays(start, 7);
      if (n > 0)
        toast.success(t('copyDone', { count: n }), {
          action: { label: t('toWeek'), onClick: () => router.push(`/plan?week=${next}`) },
        });
      else toast(t('copyNone'));
    });

  if (variant === 'bar') {
    return (
      <div
        role="toolbar"
        aria-label={t('label')}
        className={cn('flex flex-wrap gap-2 px-5 pt-1 pb-2 md:px-12', className)}
      >
        <Button variant="secondary" className="h-11" onClick={shopping} disabled={pending}>
          <ShoppingCart className="text-tint" /> {t('shopping')}
        </Button>
        <Button variant="secondary" className="h-11" onClick={copy} disabled={pending}>
          <CopyPlus className="text-tint" /> {t('copy')}
        </Button>
        <a
          href={calendarHref}
          download
          className={buttonVariants({ variant: 'secondary', className: 'h-11' })}
        >
          <CalendarArrowDown className="text-tint" /> {t('calendar')}
        </a>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(buttonVariants({ variant: 'secondary', size: 'icon-lg' }), className)}
        aria-label={t('label')}
        disabled={pending}
      >
        <Ellipsis />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="glass z-50 min-w-64 rounded-[16px] p-1.5">
          <DropdownMenu.Item className={itemClass} onSelect={shopping}>
            <ShoppingCart /> {t('shopping')}
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClass} onSelect={copy}>
            <CopyPlus /> {t('copy')}
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemClass}>
            <a href={calendarHref} download>
              <CalendarArrowDown /> {t('calendar')}
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
