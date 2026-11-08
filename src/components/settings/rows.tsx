import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { signOutAction } from '@/server/actions/auth';

/** Kopf einer Unterseite mit Zurück-Link zu den Einstellungen. */
export function SettingsHeader({ title, back }: { title: string; back: string }) {
  return (
    <PageHeader
      title={title}
      over={
        <Link
          href="/settings"
          className="-ml-1.5 inline-flex h-9 items-center gap-0.5 rounded-full pr-3 pl-0.5 text-callout text-label transition-opacity hover:opacity-70"
        >
          <ChevronLeft className="size-5" aria-hidden />
          {back}
        </Link>
      }
    />
  );
}

/** Erklärtext unter einer Gruppe, wie die Fußzeilen in den iOS-Einstellungen. */
export function GroupNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    // text-footnote bewusst außerhalb von cn, tailwind-merge hält es sonst für eine Farbe
    <p className={`text-footnote ${cn('mx-5 mt-2 max-w-prose text-label-2 md:mx-12', className)}`}>
      {children}
    </p>
  );
}

/** Zeilenstil wie in list.tsx, für Elemente, die dort fehlen (Download-Link, Formular-Knopf). */
export const settingsRowClass =
  'relative flex min-h-[3.25rem] w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-fill/50 active:bg-fill before:absolute before:top-0 before:right-4 before:left-[3.75rem] before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden';

/** Zeile als normaler Link, etwa für Downloads oder fremde Seiten. */
export function RowAnchor({
  href,
  icon,
  title,
  subtitle,
  end,
  download,
  external,
}: {
  href: string;
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  end?: ReactNode;
  download?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      download={download || undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={settingsRowClass}
    >
      <span className="flex shrink-0 items-center">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body leading-tight">{title}</span>
        {subtitle ? <span className="mt-0.5 block text-footnote text-label-2">{subtitle}</span> : null}
      </span>
      {end ? <span className="shrink-0 text-label-3">{end}</span> : null}
    </a>
  );
}

/** Rote Abmelde-Zeile. Läuft als Formular, damit sie auch ohne JavaScript geht. */
export function SignOutRow({ label }: { label: string }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex min-h-[3.25rem] w-full items-center justify-center px-4 text-body text-red transition-colors hover:bg-fill/50 active:bg-fill"
      >
        {label}
      </button>
    </form>
  );
}

/** Codeblock zum Abschreiben. */
export function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <pre
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-[12px] bg-fill px-3.5 py-3 font-mono text-footnote leading-relaxed break-all whitespace-pre-wrap text-label md:break-normal md:whitespace-pre"
    >
      <code>{children}</code>
    </pre>
  );
}
