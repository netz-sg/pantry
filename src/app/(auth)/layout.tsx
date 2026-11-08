import { HERO_GLOW } from '@/components/ui/hero-glow';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh md:grid-cols-[1.15fr_1fr]">
      <div className="relative isolate flex min-h-[34vh] flex-col justify-end overflow-hidden px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-8 text-white md:min-h-0 md:px-14 md:pb-14">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: HERO_GLOW }} />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-bg to-transparent md:hidden"
        />
        <p aria-hidden className="headline text-[4.5rem] md:text-[8rem]">
          pantry
        </p>
      </div>
      <div className="flex items-center justify-center px-6 py-10 md:px-14">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>
    </main>
  );
}
