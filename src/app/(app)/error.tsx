'use client';

import { useTranslations } from 'next-intl';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('common');
  return (
    <div className="grid min-h-[70dvh] place-items-center">
      <EmptyState
        icon={<TriangleAlert />}
        title={t('errors.errorTitle')}
        text={t('errors.errorText')}
        action={<Button onClick={reset}>{t('actions.retry')}</Button>}
      />
    </div>
  );
}
