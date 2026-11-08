'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      // Unten in der Mitte, weg von der Navigation. Hoch genug für die Kochleiste der Rezepte, am Handy über der Tab-Leiste.
      position="bottom-center"
      offset={{ bottom: 96 }}
      mobileOffset={{ bottom: 'calc(max(env(safe-area-inset-bottom), 12px) + 76px)' }}
      toastOptions={{
        classNames: {
          toast:
            '!rounded-full !border !border-separator !bg-[var(--glass)] !px-5 !text-label !shadow-glass !backdrop-blur-2xl !font-sans !text-subhead',
          description: '!text-label-2',
          actionButton: '!bg-tint !text-on-tint !rounded-full !font-semibold',
        },
      }}
    />
  );
}
