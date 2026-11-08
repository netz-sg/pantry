import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral' | 'tint';

const tones: Record<Tone, string> = {
  ok: 'bg-green-soft text-green',
  warn: 'bg-orange-soft text-orange',
  bad: 'bg-red-soft text-red',
  neutral: 'bg-fill text-label-2',
  tint: 'bg-tint-soft text-tint',
};

export function Pill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-footnote font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = 'ok' }: { tone?: Exclude<Tone, 'neutral' | 'tint'> }) {
  const c = tone === 'ok' ? 'bg-green' : tone === 'warn' ? 'bg-orange' : 'bg-red';
  return <span className={cn('inline-block size-[7px] shrink-0 rounded-full', c)} aria-hidden />;
}
