import { getTranslations } from 'next-intl/server';
import { CalendarDays, Download } from 'lucide-react';
import { CalendarLink } from '@/components/settings/calendar-link';
import { BackupRow, ImportRows } from '@/components/settings/data-actions';
import { GroupNote, RowAnchor, SettingsHeader } from '@/components/settings/rows';
import { Group, GroupLabel, RowIcon } from '@/components/ui/list';
import { requirePageUser } from '@/server/lib/session';
import { hasCalendarToken } from '@/server/services/user';

export async function generateMetadata() {
  const t = await getTranslations('settings.data');
  return { title: t('title') };
}

export default async function DataPage() {
  const user = await requirePageUser();
  const t = await getTranslations('settings');
  return (
    <>
      <SettingsHeader title={t('data.title')} back={t('back')} />

      <GroupLabel className="mt-3">{t('data.exportGroup')}</GroupLabel>
      <Group>
        <RowAnchor
          href="/api/v1/export"
          download
          icon={
            <RowIcon color="var(--blue)">
              <Download />
            </RowIcon>
          }
          title={t('data.export')}
          subtitle={t('data.exportHint')}
        />
      </Group>

      <GroupLabel>{t('data.importGroup')}</GroupLabel>
      <Group>
        <ImportRows />
      </Group>

      <GroupLabel>{t('data.backupGroup')}</GroupLabel>
      <Group>
        <BackupRow />
      </Group>

      <GroupLabel>{t('data.calendarGroup')}</GroupLabel>
      <Group className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <RowIcon color="var(--red)">
            <CalendarDays />
          </RowIcon>
          <span className="text-body">{t('data.calendar')}</span>
        </div>
        <CalendarLink active={hasCalendarToken(user.id)} />
      </Group>
      <GroupNote>{t('data.calendarHint')}</GroupNote>
    </>
  );
}
