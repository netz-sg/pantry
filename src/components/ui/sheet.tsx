'use client';

import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';
import { useMediaQuery } from './use-media';

type SheetProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

/** Am Handy ein Sheet von unten, am großen Bildschirm ein Dialog in der Mitte. */
export function Sheet({ open, onOpenChange, title, description, children, footer, wide }: SheetProps) {
  const desktop = useMediaQuery('(min-width: 768px)');
  const t = useTranslations('common.actions');
  if (desktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-in fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
          <Dialog.Content
            className={cn(
              'fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px] border border-separator bg-raised shadow-2xl outline-none',
              wide ? 'max-w-3xl' : 'max-w-lg',
            )}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
              <div>
                <Dialog.Title className="text-title-2 font-bold">{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description className="mt-0.5 text-subhead text-label-2">
                    {description}
                  </Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">{title}</Dialog.Description>
                )}
              </div>
              <Dialog.Close
                className="grid size-8 place-items-center rounded-full bg-fill text-label-2 hover:bg-fill-strong"
                aria-label={t('close')}
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">{children}</div>
            {footer ? (
              <div className="hairline-top flex justify-end gap-2 bg-raised px-6 py-4">{footer}</div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[24px] border-t border-separator bg-raised outline-none">
          <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-fill-strong" aria-hidden />
          <div className="px-5 pt-3 pb-2">
            <Drawer.Title className="text-title-2 font-bold">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-0.5 text-subhead text-label-2">
                {description}
              </Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">{title}</Drawer.Description>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
          {footer ? (
            <div className="hairline-top flex gap-2 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] [&>*]:flex-1">
              {footer}
            </div>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
