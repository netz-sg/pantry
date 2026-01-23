'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/config';

const languageNames: Record<Locale, string> = {
    en: 'English',
    zh: '中文',
    de: 'Deutsch'
};

export default function LanguageSwitcher() {
    const locale = useLocale() as Locale;
    const [isPending, startTransition] = useTransition();

    const handleChange = (newLocale: Locale) => {
        startTransition(() => {
            // Set cookie and reload
            document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
            window.location.reload();
        });
    };

    return (
        <div className="flex gap-2">
            {locales.map((loc) => (
                <button
                    key={loc}
                    onClick={() => handleChange(loc)}
                    disabled={isPending || locale === loc}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${locale === loc
                            ? 'bg-white text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {languageNames[loc]}
                </button>
            ))}
        </div>
    );
}
