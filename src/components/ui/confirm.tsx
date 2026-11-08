'use client';

import { AlertDialog } from 'radix-ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from './button';

/** Rückfrage vor endgültigen Aktionen wie Löschen. */
export function Confirm({
  trigger,
  title,
  text,
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = true,
}: {
  trigger: ReactNode;
  title: string;
  text?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  const t = useTranslations('common.actions');
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/35" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[60] w-[min(20rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] bg-surface text-center shadow-2xl outline-none">
          <div className="px-5 pt-5 pb-4">
            <AlertDialog.Title className="text-body font-semibold">{title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-1 text-footnote text-label-2">
              {text ?? title}
            </AlertDialog.Description>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4 pb-4">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">{cancelLabel ?? t('cancel')}</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant={destructive ? 'destructive' : 'tint'} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
