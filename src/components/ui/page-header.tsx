import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CompactBar } from './compact-bar';

/** Großer, kräftiger Titel mit warmem Schein dahinter. Am Computer Platz für die schwebende Navigation. */
export function PageHeader({
  title,
  compactTitle,
  over,
  subtitle,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  /** Kurzer Titel für die Leiste beim Scrollen, sonst der normale Titel */
  compactTitle?: ReactNode;
  over?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Zusätzlicher Inhalt unter dem Titel */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'relative px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] pb-5 md:px-12 md:pt-32 md:pb-7',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[340px] w-screen -translate-x-1/2 bg-[radial-gradient(700px_260px_at_15%_0%,var(--tint-soft),transparent_70%)]"
      />
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {over ? <div className="mb-2 text-subhead font-semibold text-tint">{over}</div> : null}
          <h1 className="headline text-[2.6rem] md:text-[3.75rem]">{title}</h1>
          <CompactBar>{compactTitle ?? title}</CompactBar>
          {subtitle ? <div className="mt-2.5 text-callout text-label-2">{subtitle}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-14 mb-4 flex items-baseline justify-between gap-4 px-5 md:px-12', className)}>
      <h2 className="text-[1.375rem] leading-tight font-bold tracking-[-0.02em]">{children}</h2>
      {action}
    </div>
  );
}
