import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Schlichte Liste mit feinen Trennlinien, wie bei Mela. Ohne Kasten und Hintergrund. */
export function Group({ className, inset = true, ...props }: ComponentProps<'div'> & { inset?: boolean }) {
  return <div className={cn('overflow-hidden', inset && 'mx-1 md:mx-8', className)} {...props} />;
}

export function GroupLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('mx-5 mt-7 mb-1 text-footnote font-semibold text-label-2 md:mx-12', className)}>
      {children}
    </p>
  );
}

type RowBase = {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  end?: ReactNode;
  chevron?: boolean;
  className?: string;
  /** Trennlinie beginnt nach dem Icon, wie bei iOS */
  indent?: 'icon' | 'none';
};

function RowInner({ icon, title, subtitle, end, chevron }: RowBase) {
  return (
    <>
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-callout leading-snug">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-footnote text-label-2">{subtitle}</span>
        ) : null}
      </span>
      {end ? <span className="shrink-0 text-subhead text-label-2">{end}</span> : null}
      {chevron ? <ChevronRight className="size-4 shrink-0 text-label-3" aria-hidden /> : null}
    </>
  );
}

const rowClass = (indent: RowBase['indent'], hasIcon: boolean) =>
  cn(
    'relative flex min-h-[3.25rem] w-full items-center gap-3 px-4 py-2.5 text-left',
    'before:absolute before:top-0 before:right-4 before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden',
    indent === 'none' || !hasIcon ? 'before:left-4' : 'before:left-[3.75rem]',
  );

export function Row({ className, indent, ...p }: RowBase) {
  return (
    <div className={cn(rowClass(indent, !!p.icon), className)}>
      <RowInner {...p} />
    </div>
  );
}

export function RowLink({ href, className, indent, ...p }: RowBase & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        rowClass(indent, !!p.icon),
        'rounded-[10px] transition-colors duration-150 hover:bg-fill active:bg-fill-strong',
        className,
      )}
    >
      <RowInner chevron {...p} />
    </Link>
  );
}

export function RowButton({
  className,
  indent,
  onClick,
  disabled,
  ...p
}: RowBase & { onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        rowClass(indent, !!p.icon),
        'rounded-[10px] transition-colors duration-150 hover:bg-fill active:bg-fill-strong disabled:opacity-50',
        className,
      )}
    >
      <RowInner {...p} />
    </button>
  );
}

/** Symbol in Akzentfarbe vor einer Zeile. */
// Farbe bewusst einheitlich im Akzent, der Parameter bleibt für ältere Aufrufe bestehen
export function RowIcon({ children }: { children: ReactNode; color?: string }) {
  return <span className="grid size-7 place-items-center text-tint [&_svg]:size-[20px]">{children}</span>;
}
