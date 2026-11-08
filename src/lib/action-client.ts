'use client';

import { toast } from 'sonner';
import type { Result } from '@/server/lib/errors';

/**
 * Ruft eine Server Action auf und zeigt Fehler als Meldung.
 * Mit `success` gibt es eine Bestätigung, mit `undo` einen Rückgängig-Knopf.
 */
export async function callAction<T>(
  p: Promise<Result<T>>,
  opts: { success?: string; undo?: { label: string; run: () => void }; errorTitle?: string } = {},
): Promise<T | undefined> {
  const res = await p;
  if (!res.ok) {
    toast.error(
      opts.errorTitle ?? res.error.message,
      opts.errorTitle ? { description: res.error.message } : undefined,
    );
    return undefined;
  }
  if (opts.success)
    toast.success(
      opts.success,
      opts.undo ? { action: { label: opts.undo.label, onClick: opts.undo.run } } : undefined,
    );
  return res.data;
}
