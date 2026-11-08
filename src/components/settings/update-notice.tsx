import { getTranslations } from 'next-intl/server';
import { CircleArrowUp, ExternalLink, Info } from 'lucide-react';
import { Row, RowIcon } from '@/components/ui/list';
import { getUpdateInfo } from '@/server/services/updates';
import { CodeBlock, RowAnchor } from './rows';

export function VersionRow({ label, version, status }: { label: string; version: string; status?: string }) {
  return (
    <Row
      icon={
        <RowIcon color="var(--tint)">
          <Info />
        </RowIcon>
      }
      title={label}
      subtitle={status}
      end={<span className="tabular">{version}</span>}
    />
  );
}

/** Version und Hinweis auf eine neuere Ausgabe. Lädt getrennt, damit die Seite nicht wartet. */
export async function UpdateNotice() {
  const t = await getTranslations('settings.about');
  const label = (await getTranslations('settings.rows'))('version');
  const info = await getUpdateInfo();
  if (!info.available || !info.latest) {
    return (
      <VersionRow label={label} version={info.current} status={info.latest ? t('upToDate') : undefined} />
    );
  }
  return (
    <>
      <VersionRow label={label} version={info.current} />
      <div className="relative px-4 py-3 before:absolute before:top-0 before:right-0 before:left-[3.75rem] before:h-px before:origin-top before:scale-y-50 before:bg-separator">
        <div className="flex items-center gap-3">
          <RowIcon color="var(--green)">
            <CircleArrowUp />
          </RowIcon>
          <p className="text-body font-semibold">{t('available', { version: info.latest.version })}</p>
        </div>
        <div className="mt-2.5 grid gap-2 md:ml-11">
          <p className="text-footnote text-label-2">{t('howTo')}</p>
          <CodeBlock>{'docker compose pull && docker compose up -d'}</CodeBlock>
          <p className="text-footnote text-label-2">{t('noAuto')}</p>
        </div>
      </div>
      <RowAnchor
        href={info.latest.url}
        external
        icon={<span className="size-8" aria-hidden />}
        title={<span className="text-tint">{t('release')}</span>}
        end={<ExternalLink className="size-4" aria-hidden />}
      />
    </>
  );
}
