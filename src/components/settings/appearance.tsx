'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition, type ReactNode } from 'react';
import { Languages, SunMoon } from 'lucide-react';
import { RowIcon } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { callAction } from '@/lib/action-client';
import { setLocaleAction, setThemeAction } from '@/server/actions/settings';

type Theme = 'system' | 'light' | 'dark';
type Locale = 'de' | 'en' | 'zh';

function applyTheme(theme: Theme) {
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

function SegmentRow({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="relative px-4 py-3 before:absolute before:top-0 before:right-0 before:left-[3.75rem] before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-body leading-tight">{title}</span>
      </div>
      <div className="mt-2.5 md:ml-11">{children}</div>
    </div>
  );
}

/** Theme und Sprache. Wirkt sofort, die Auswahl liegt in der Datenbank. */
export function AppearanceRows({
  theme: initialTheme,
  locale: initialLocale,
}: {
  theme: Theme;
  locale: Locale;
}) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [pending, startTransition] = useTransition();

  const changeTheme = (next: Theme) => {
    const prev = theme;
    setTheme(next);
    // Sofortige Rückmeldung, bevor das Layout neu geladen ist
    applyTheme(next);
    startTransition(async () => {
      const res = await setThemeAction(next);
      if (!res.ok) {
        setTheme(prev);
        applyTheme(prev);
        await callAction(Promise.resolve(res));
        return;
      }
      router.refresh();
    });
  };

  const changeLocale = (next: Locale) => {
    const prev = locale;
    setLocale(next);
    startTransition(async () => {
      const res = await setLocaleAction(next);
      if (!res.ok) {
        setLocale(prev);
        await callAction(Promise.resolve(res));
        return;
      }
      document.documentElement.lang = next;
      router.refresh();
    });
  };

  return (
    <div aria-busy={pending || undefined}>
      <SegmentRow
        icon={
          <RowIcon color="var(--blue)">
            <SunMoon />
          </RowIcon>
        }
        title={t('rows.theme')}
      >
        <Segmented
          label={t('rows.theme')}
          value={theme}
          onChange={changeTheme}
          className="max-w-md [&>button]:h-11"
          items={(['system', 'light', 'dark'] as const).map((v) => ({ value: v, label: t(`theme.${v}`) }))}
        />
      </SegmentRow>
      <SegmentRow
        icon={
          <RowIcon color="var(--green)">
            <Languages />
          </RowIcon>
        }
        title={t('rows.language')}
      >
        <Segmented
          label={t('language.label')}
          value={locale}
          onChange={changeLocale}
          className="max-w-md [&>button]:h-11"
          items={(['de', 'en', 'zh'] as const).map((v) => ({ value: v, label: t(`language.${v}`) }))}
        />
      </SegmentRow>
    </div>
  );
}
