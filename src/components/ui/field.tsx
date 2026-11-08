import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const control =
  'w-full rounded-[10px] bg-fill px-3.5 text-callout text-label placeholder:text-label-3 outline-none transition-[box-shadow] duration-200 focus:bg-raised focus:shadow-[0_0_0_1.5px_var(--tint),0_0_0_4px_var(--tint-soft)] aria-[invalid=true]:shadow-[0_0_0_1px_var(--red),0_0_0_4px_var(--red-soft)]';

export function Input({ className, ...p }: ComponentProps<'input'>) {
  return <input className={cn(control, 'h-11', className)} {...p} />;
}

export function Textarea({ className, ...p }: ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'min-h-24 py-2.5 leading-snug', className)} {...p} />;
}

export function Select({ className, children, ...p }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        control,
        'h-11 appearance-none bg-[length:12px] bg-[position:right_16px_center] bg-no-repeat pr-10',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='%238e8e93' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
      }}
      {...p}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  error?: string | string[];
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const msg = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={htmlFor} className="px-1 text-footnote font-semibold text-label-2">
        {label}
      </label>
      {children}
      {msg ? (
        <p id={`${htmlFor}-error`} className="px-1 text-footnote text-red" role="alert">
          {msg}
        </p>
      ) : hint ? (
        <p className="px-1 text-footnote text-label-2">{hint}</p>
      ) : null}
    </div>
  );
}
