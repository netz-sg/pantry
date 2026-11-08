'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { Confirm } from '@/components/ui/confirm';
import { callAction } from '@/lib/action-client';
import { removeRecipe } from '@/server/actions/recipes';

/** Löschen mit Rückfrage. Danach geht es zur Liste. */
export function DeleteRecipeButton({ id, title }: { id: string; title: string }) {
  const t = useTranslations('recipes.detail');
  const tc = useTranslations('common.actions');
  const [pending, startTransition] = useTransition();
  return (
    <Confirm
      title={t('deleteTitle')}
      text={t('deleteText', { title })}
      confirmLabel={tc('delete')}
      cancelLabel={tc('cancel')}
      onConfirm={() => startTransition(async () => void (await callAction(removeRecipe(id))))}
      trigger={
        <button
          type="button"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-callout font-semibold text-red transition-colors hover:bg-red-soft disabled:opacity-50"
        >
          <Trash2 className="size-[18px]" aria-hidden />
          {t('delete')}
        </button>
      }
    />
  );
}
