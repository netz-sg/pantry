'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { toast } from 'sonner';

/** Meldet den Service Worker an und zeigt einen Hinweis, wenn die Verbindung fehlt. */
export function ServiceWorker() {
  const t = useTranslations('common');
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
      } else {
        // In der Entwicklung keinen Cache, sonst zeigt der Browser alte Dateien
        void navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => void r.unregister()));
        if ('caches' in window) void caches.keys().then((keys) => keys.forEach((k) => void caches.delete(k)));
      }
    }
    const off = () => toast(t('offline'), { id: 'offline', duration: Infinity });
    const on = () => toast.dismiss('offline');
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    return () => {
      window.removeEventListener('offline', off);
      window.removeEventListener('online', on);
    };
  }, [t]);
  return null;
}
