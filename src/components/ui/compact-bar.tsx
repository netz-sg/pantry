'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Wie in iOS. Sobald der große Titel aus dem Bild scrollt,
 * erscheint oben eine schmale Glasleiste mit dem Titel.
 */
export function CompactBar({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setShow(!e!.isIntersecting && e!.boundingClientRect.top < 0),
      {
        threshold: 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <span ref={ref} aria-hidden className="block h-px w-px" />
      <div
        aria-hidden
        className={cn(
          'no-print pointer-events-none fixed inset-x-0 top-0 z-30 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:hidden',
          show ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
        )}
      >
        <div className="flex h-[calc(env(safe-area-inset-top)+44px)] items-end justify-center border-b border-separator bg-[var(--glass)] px-16 pb-2.5 backdrop-blur-2xl backdrop-saturate-150">
          <span className="truncate text-callout font-bold">{children}</span>
        </div>
      </div>
    </>
  );
}
