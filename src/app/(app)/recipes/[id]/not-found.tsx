import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BookX } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default async function RecipeNotFound() {
  const t = await getTranslations('recipes.notFound');
  return (
    <div className="pt-[calc(env(safe-area-inset-top)+2rem)] md:pt-32">
      <EmptyState
        icon={<BookX />}
        title={t('title')}
        text={t('text')}
        action={
          <Link href="/recipes" className={buttonVariants({ variant: 'secondary' })}>
            {t('back')}
          </Link>
        }
      />
    </div>
  );
}
