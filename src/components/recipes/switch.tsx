'use client';

import { Switch as RSwitch } from 'radix-ui';

/** Schalter im iOS-Stil. */
export function Switch({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <RSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className="relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full bg-fill-strong p-0.5 transition-colors data-[state=checked]:bg-green"
    >
      <RSwitch.Thumb className="block size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)] transition-transform data-[state=checked]:translate-x-5" />
    </RSwitch.Root>
  );
}
