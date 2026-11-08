import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const chip = (active?: boolean) =>
  cn(
    'relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-footnote font-medium transition-[background,color,box-shadow,transform] duration-200 active:scale-[0.96] before:absolute before:-inset-x-0.5 before:-inset-y-1.5 before:content-[""]',
    active ? 'bg-tint text-on-tint' : 'bg-surface text-label hover:bg-surface-2',
  );

export function ChipLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} scroll={false} aria-current={active ? 'true' : undefined} className={chip(active)}>
      {children}
    </Link>
  );
}

export function ChipButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={chip(active)}>
      {children}
    </button>
  );
}

export function ChipRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "no-scrollbar flex gap-2 overflow-x-auto px-5 py-1 after:block after:shrink-0 after:pr-3 after:content-[''] md:px-12 md:after:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
