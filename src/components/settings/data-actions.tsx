'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { BookOpen, Check, Copy, FileUp, HardDrive, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RowButton, RowIcon } from '@/components/ui/list';
import type { Result } from '@/server/lib/errors';
import { backupAction, importPaprikaAction, importPantryAction } from '@/server/actions/settings';

const MAX = 12 * 1024 * 1024;

const Busy = ({ label }: { label: string }) => (
  <span className="flex items-center gap-1.5 text-footnote">
    <LoaderCircle className="size-4 animate-spin" aria-hidden /> {label}
  </span>
);

/** Zeile, die eine Datei wählen lässt und sie an eine Server Action schickt. */
function ImportRow<T>({
  id,
  icon,
  title,
  subtitle,
  accept,
  action,
  onDone,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  accept: string;
  action: (form: FormData) => Promise<Result<T>>;
  onDone: (data: T) => void;
}) {
  const t = useTranslations('settings.data');
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX) {
      toast.error(t('tooLarge'));
      return;
    }
    setBusy(true);
    const form = new FormData();
    form.set('file', file);
    try {
      const res = await action(form);
      if (res.ok) onDone(res.data);
      else toast.error(res.error.message);
    } catch {
      toast.error(t('tooLarge'));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <>
      <RowButton
        icon={icon}
        title={title}
        subtitle={<span className="whitespace-normal">{subtitle}</span>}
        end={busy ? <Busy label={t('importing')} /> : undefined}
        disabled={busy}
        onClick={() => ref.current?.click()}
      />
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-label={title}
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </>
  );
}

export function ImportRows() {
  const t = useTranslations('settings.data');
  return (
    <>
      <ImportRow
        id="import-pantry"
        icon={
          <RowIcon color="var(--blue)">
            <FileUp />
          </RowIcon>
        }
        title={t('importPantry')}
        subtitle={t('importPantryHint')}
        accept="application/json,.json"
        action={importPantryAction}
        onDone={(d) => toast.success(t('importedPantry', d))}
      />
      <ImportRow
        id="import-paprika"
        icon={
          <RowIcon color="var(--red)">
            <BookOpen />
          </RowIcon>
        }
        title={t('importPaprika')}
        subtitle={t('importPaprikaHint')}
        accept=".paprikarecipes"
        action={importPaprikaAction}
        onDone={(d) =>
          toast.success(
            t('importedPaprika', { imported: d.imported }),
            d.skipped ? { description: t('skipped', { count: d.skipped }) } : undefined,
          )
        }
      />
    </>
  );
}

export function BackupRow() {
  const t = useTranslations('settings.data');
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const res = await backupAction();
    setBusy(false);
    if (res.ok) toast.success(t('backupDone'), { description: res.data });
    else toast.error(res.error.message);
  };
  return (
    <RowButton
      icon={
        <RowIcon color="var(--green)">
          <HardDrive />
        </RowIcon>
      }
      title={t('backup')}
      subtitle={<span className="whitespace-normal">{t('backupHint')}</span>}
      end={busy ? <Busy label={t('backingUp')} /> : undefined}
      disabled={busy}
      onClick={run}
    />
  );
}

/** Adresse zum Kopieren, etwa für das Kalender-Abo. */
export function CopyLink({ url, label }: { url: string; label: string }) {
  const t = useTranslations('settings.data');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('copyFailed'));
    }
  };
  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        aria-label={label}
        onFocus={(e) => e.currentTarget.select()}
        className="h-11 min-w-0 flex-1 rounded-[12px] bg-fill px-3.5 font-mono text-footnote text-label outline-none focus:ring-2 focus:ring-tint/50"
      />
      <Button type="button" variant="tinted" size="icon-lg" onClick={copy} aria-label={t('copy')}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
    </div>
  );
}
