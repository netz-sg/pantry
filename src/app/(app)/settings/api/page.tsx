import { getTranslations } from 'next-intl/server';
import { FileJson } from 'lucide-react';
import { CodeBlock, GroupNote, RowAnchor, SettingsHeader } from '@/components/settings/rows';
import { Group, RowIcon } from '@/components/ui/list';
import { env } from '@/env';
import { requirePageUser } from '@/server/lib/session';

export async function generateMetadata() {
  const t = await getTranslations('settings.api');
  return { title: t('title') };
}

export default async function ApiPage() {
  const user = await requirePageUser();
  const t = await getTranslations('settings');
  const base = env.APP_URL.replace(/\/$/, '');
  const signIn = [
    `curl -i -X POST ${base}/api/auth/sign-in/username \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -d '{"username":"${user.username ?? ''}","password":"${t('api.passwordPlaceholder')}"}'`,
  ].join('\n');
  const call = [
    `curl ${base}/api/v1/today \\`,
    `  -H 'Authorization: Bearer ${t('api.tokenPlaceholder')}'`,
  ].join('\n');

  return (
    <>
      <SettingsHeader title={t('api.title')} back={t('back')} />
      <GroupNote className="mt-0">{t('api.intro')}</GroupNote>

      <Group className="mt-5 grid gap-3 p-4">
        <p className="flex gap-3 text-subhead">
          <span
            aria-hidden
            className="grid size-6 shrink-0 place-items-center rounded-full bg-tint text-footnote font-bold text-on-tint"
          >
            1
          </span>
          {t('api.step1')}
        </p>
        <CodeBlock>{signIn}</CodeBlock>
      </Group>

      <Group className="mt-5 grid gap-3 p-4">
        <p className="flex gap-3 text-subhead">
          <span
            aria-hidden
            className="grid size-6 shrink-0 place-items-center rounded-full bg-tint text-footnote font-bold text-on-tint"
          >
            2
          </span>
          {t('api.step2')}
        </p>
        <CodeBlock>{call}</CodeBlock>
      </Group>
      <GroupNote>{t('api.step3')}</GroupNote>

      <Group className="mt-6">
        <RowAnchor
          href="/api/v1/openapi.json"
          external
          icon={
            <RowIcon color="var(--tint)">
              <FileJson />
            </RowIcon>
          }
          title={t('api.openapi')}
          subtitle={t('api.openapiHint')}
        />
      </Group>
    </>
  );
}
