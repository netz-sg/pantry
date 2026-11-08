'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { shiftDays } from '@/lib/dates';
import { cn } from '@/lib/utils';

/** Vorige Woche, aktuelle Woche, nächste Woche. Alles Links, damit die Woche in der Adresse steht. */
export function WeekNav({
  start,
  isCurrent,
  className,
}: {
  start: string;
  isCurrent: boolean;
  className?: string;
}) {
  const t = useTranslations('plan.nav');
  return (
    <nav aria-label={t('label')} className={cn('flex items-center gap-1', className)}>
      <Link
        href={`/plan?week=${shiftDays(start, -7)}`}
        scroll={false}
        aria-label={t('prev')}
        className={buttonVariants({ variant: 'secondary', size: 'icon-lg' })}
      >
        <ChevronLeft />
      </Link>
      <Link
        href="/plan"
        scroll={false}
        aria-current={isCurrent ? 'date' : undefined}
        className={buttonVariants({ variant: isCurrent ? 'secondary' : 'tinted', className: 'h-11 px-4' })}
      >
        {t('today')}
      </Link>
      <Link
        href={`/plan?week=${shiftDays(start, 7)}`}
        scroll={false}
        aria-label={t('next')}
        className={buttonVariants({ variant: 'secondary', size: 'icon-lg' })}
      >
        <ChevronRight />
      </Link>
    </nav>
  );
}
