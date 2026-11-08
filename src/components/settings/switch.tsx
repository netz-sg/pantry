'use client';

import { cn } from '@/lib/utils';

/** Schalter im iOS-Stil. Die Tippfläche ist 44 Pixel hoch. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  describedBy,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group -my-1 grid h-11 shrink-0 place-items-center rounded-full px-0.5 disabled:opacity-50"
    >
      <span
        className={cn(
          'relative block h-[31px] w-[51px] rounded-full transition-colors',
          checked ? 'bg-green' : 'bg-fill-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)] transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </span>
    </button>
  );
}
