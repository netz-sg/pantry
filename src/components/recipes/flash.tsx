'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/** Zeigt eine Meldung nach einer Weiterleitung und nimmt den Parameter aus der Adresse. */
export function Flash({ message, cleanHref }: { message: string | null; cleanHref: string }) {
  const router = useRouter();
  useEffect(() => {
    if (!message) return;
    toast.success(message, { id: `flash-${message}` });
    router.replace(cleanHref, { scroll: false });
  }, [message, cleanHref, router]);
  return null;
}
