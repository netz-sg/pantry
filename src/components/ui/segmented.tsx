'use client';

import { cn } from '@/lib/utils';

type Item<T extends string> = { value: T; label: string };

const track = 'relative grid rounded-[12px] bg-fill p-[3px]';
const segment =
  'relative z-10 grid h-8 place-items-center truncate rounded-[9px] px-2 text-footnote font-semibold transition-colors duration-200 before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[""]';

/** Gleitender Schieber unter dem aktiven Segment, wie in iOS. */
function Thumb({ index, count }: { index: number; count: number }) {
  if (index < 0) return null;
  return (
    <span
      aria-hidden
      className="absolute top-[3px] bottom-[3px] left-[3px] rounded-[9px] bg-[var(--thumb)] shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_3px_8px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)]"
      style={{ width: `calc((100% - 6px) / ${count})`, transform: `translateX(${index * 100}%)` }}
    />
  );
}

export function Segmented<T extends string>({
  items,
  value,
  onChange,
  className,
  label,
}: {
  items: Item<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  label: string;
}) {
  const index = items.findIndex((i) => i.value === value);
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(track, className)}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      <Thumb index={index} count={items.length} />
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          aria-pressed={it.value === value}
          onClick={() => onChange(it.value)}
          className={cn(segment, it.value === value ? 'text-label' : 'text-label-2 hover:text-label')}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
