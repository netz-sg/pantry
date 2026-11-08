'use client';

import { useTranslations } from 'next-intl';
import { Share } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** Teilt den Link zum Rezept. Ohne Web Share API wird er kopiert. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const t = useTranslations('recipes.detail');
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('linkCopied'));
    } catch {
      toast(url);
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      aria-label={t('share')}
      className={cn('grid size-11 place-items-center rounded-full', className)}
    >
      <Share className="size-5" />
    </button>
  );
}
