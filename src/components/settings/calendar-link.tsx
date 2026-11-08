'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Confirm } from '@/components/ui/confirm';
import { callAction } from '@/lib/action-client';
import { createCalendarLink, removeCalendarLink } from '@/server/actions/settings';
import { CopyLink } from './data-actions';

/** Erstellt, zeigt und widerruft den geheimen Kalender-Abo-Link. */
export function CalendarLink({ active }: { active: boolean }) {
  const t = useTranslations('settings.data');
  const [url, setUrl] = useState<string | null>(null);
  const [isActive, setActive] = useState(active);
  const [pending, start] = useTransition();

  const create = () =>
    start(async () => {
      const u = await callAction(createCalendarLink(), { success: t('calendarCreated') });
      if (u) {
        setUrl(u);
        setActive(true);
      }
    });
  const remove = () =>
    start(async () => {
      const ok = await callAction(removeCalendarLink(), { success: t('calendarRemoved') });
      if (ok !== undefined) {
        setUrl(null);
        setActive(false);
      }
    });

  return (
    <div className="grid gap-3">
      {url ? (
        <>
          <CopyLink url={url} label={t('calendar')} />
          <a href={url.replace(/^https?:/, 'webcal:')} className="text-callout font-semibold text-tint">
            {t('calendarOpen')}
          </a>
        </>
      ) : isActive ? (
        <p className="text-footnote text-label-2">{t('calendarActive')}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={isActive ? 'secondary' : 'tint'} disabled={pending} onClick={create}>
          {isActive ? t('calendarRenew') : t('calendarCreate')}
        </Button>
        {isActive ? (
          <Confirm
            trigger={
              <Button type="button" variant="destructive" disabled={pending}>
                {t('calendarRemove')}
              </Button>
            }
            title={t('calendarRemoveConfirm')}
            text={t('calendarRemoveText')}
            confirmLabel={t('calendarRemove')}
            onConfirm={remove}
          />
        ) : null}
      </div>
    </div>
  );
}
