import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SearchX } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default async function NotFound() {
  const t = await getTranslations('common.errors');
  return (
    <div className="grid min-h-[70dvh] place-items-center">
      <EmptyState
        icon={<SearchX />}
        title={t('notFoundTitle')}
        text={t('notFoundText')}
        action={
          <Link href="/" className={buttonVariants()}>
            {t('toHome')}
          </Link>
        }
      />
    </div>
  );
}
