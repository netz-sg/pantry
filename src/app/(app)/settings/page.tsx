import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ChevronRight, CodeXml, Database, KeyRound, Refrigerator, Tags } from 'lucide-react';
import { Avatar } from '@/components/app/avatar';
import { AppearanceRows } from '@/components/settings/appearance';
import { PushToggle } from '@/components/settings/push-toggle';
import { SignOutRow } from '@/components/settings/rows';
import { UpdateNotice, VersionRow } from '@/components/settings/update-notice';
import { Group, GroupLabel, RowLink, RowIcon } from '@/components/ui/list';
import { PageHeader } from '@/components/ui/page-header';
import { requirePageUser } from '@/server/lib/session';
import { listLocations } from '@/server/services/pantry';
import { pushConfigured } from '@/server/services/push';
import { listCategories } from '@/server/services/recipes';
import { currentVersion } from '@/server/services/updates';
import { getUser } from '@/server/services/user';
import { isLocale } from '@/i18n/config';

export async function generateMetadata() {
  const t = await getTranslations('settings');
  return { title: t('title') };
}

export default async function SettingsPage() {
  const session = await requirePageUser();
  const t = await getTranslations('settings');
  const user = getUser(session.id);
  const name = user?.name ?? session.name;
  const username = user?.displayUsername ?? user?.username ?? session.username ?? '';
  const theme = user?.theme === 'light' || user?.theme === 'dark' ? user.theme : 'system';
  // Angezeigte Sprache kommt aus dem Cookie, deshalb danach richten
  const active = await getLocale();
  const locale = isLocale(active) ? active : 'de';
  const locations = listLocations(session.id).length;
  const categories = listCategories(session.id).length;
  const push = pushConfigured() ? (process.env.VAPID_PUBLIC_KEY ?? null) : null;

  return (
    <>
      <PageHeader title={t('title')} />

      <Group className="mt-3">
        <Link
          href="/settings/profile"
          aria-label={t('profileCard.label', { name })}
          className="flex min-h-[5.5rem] items-center gap-4 px-4 py-3 transition-colors hover:bg-fill/50 active:bg-fill"
        >
          <Avatar name={name} image={user?.image ?? session.image} size={60} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-title-2 font-semibold">{name}</span>
            <span className="mt-0.5 block truncate text-subhead text-label-2">
              {username ? `@${username}` : t('profileCard.hint')}
            </span>
            {username ? (
              <span className="block truncate text-footnote text-label-2">{t('profileCard.hint')}</span>
            ) : null}
          </span>
          <ChevronRight className="size-4 shrink-0 text-label-3" aria-hidden />
        </Link>
      </Group>

      <GroupLabel>{t('groups.account')}</GroupLabel>
      <Group>
        <RowLink
          href="/settings/password"
          icon={
            <RowIcon color="var(--green)">
              <KeyRound />
            </RowIcon>
          }
          title={t('rows.password')}
        />
      </Group>

      <GroupLabel>{t('groups.appearance')}</GroupLabel>
      <Group>
        <AppearanceRows theme={theme} locale={locale} />
      </Group>

      <GroupLabel>{t('groups.kitchen')}</GroupLabel>
      <Group>
        <RowLink
          href="/settings/locations"
          icon={
            <RowIcon color="var(--blue)">
              <Refrigerator />
            </RowIcon>
          }
          title={t('rows.locations')}
          end={<span className="tabular">{locations}</span>}
        />
        <RowLink
          href="/settings/categories"
          icon={
            <RowIcon color="var(--orange)">
              <Tags />
            </RowIcon>
          }
          title={t('rows.categories')}
          end={<span className="tabular">{categories}</span>}
        />
      </Group>

      <GroupLabel>{t('groups.notifications')}</GroupLabel>
      {push ? (
        <Group>
          <PushToggle publicKey={push} />
        </Group>
      ) : (
        <Group>
          <p className="px-4 py-3.5 text-subhead text-label-2">{t('push.notConfigured')}</p>
        </Group>
      )}

      <GroupLabel>{t('groups.data')}</GroupLabel>
      <Group>
        <RowLink
          href="/settings/data"
          icon={
            <RowIcon color="var(--green)">
              <Database />
            </RowIcon>
          }
          title={t('rows.data')}
        />
        <RowLink
          href="/settings/api"
          icon={
            <RowIcon color="var(--tint)">
              <CodeXml />
            </RowIcon>
          }
          title={t('rows.api')}
        />
      </Group>

      <GroupLabel>{t('groups.about')}</GroupLabel>
      <Group>
        <Suspense fallback={<VersionRow label={t('rows.version')} version={currentVersion()} />}>
          <UpdateNotice />
        </Suspense>
      </Group>

      <Group className="mt-8">
        <SignOutRow label={t('rows.signOut')} />
      </Group>
    </>
  );
}
