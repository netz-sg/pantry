'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { Row, RowIcon } from '@/components/ui/list';
import { Switch } from './switch';

const noop = () => () => undefined;
const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

/** Wandelt einen Base64url-Schlüssel in Bytes um, wie ihn pushManager.subscribe erwartet. */
function keyBytes(b64url: string) {
  const b64 = (b64url + '='.repeat((4 - (b64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function registration() {
  // In der Entwicklung meldet die App den Service Worker nicht selbst an
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

/** Schalter für Ablauf-Erinnerungen per Web-Push. */
export function PushToggle({ publicKey }: { publicKey: string }) {
  const t = useTranslations('settings.push');
  const supported = useSyncExternalStore(noop, pushSupported, () => null);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    let alive = true;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription() ?? null)
      .then((sub) => alive && setSubscribed(Boolean(sub)))
      .catch(() => alive && setSubscribed(false));
    return () => {
      alive = false;
    };
  }, [supported]);

  const denied = supported === true && (blocked || Notification.permission === 'denied');

  const enable = async () => {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      setBlocked(perm === 'denied');
      toast.error(t('denied'));
      return;
    }
    const reg = await registration();
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) }));
    const res = await fetch('/api/v1/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    });
    if (!res.ok) {
      await sub.unsubscribe().catch(() => undefined);
      throw new Error(`push ${res.status}`);
    }
    setSubscribed(true);
    toast.success(t('on'));
  };

  const disable = async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/v1/push', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setSubscribed(false);
    toast.success(t('off'));
  };

  const toggle = async (on: boolean) => {
    setBusy(true);
    try {
      await (on ? enable() : disable());
    } catch {
      toast.error(t('failed'));
    } finally {
      setBusy(false);
    }
  };

  const hint = supported === false ? t('unsupported') : denied ? t('denied') : t('expiryHint');

  return (
    <Row
      icon={
        <RowIcon color="var(--red)">
          <Bell />
        </RowIcon>
      }
      title={t('expiry')}
      subtitle={
        <span id="push-hint" className="whitespace-normal">
          {hint}
        </span>
      }
      end={
        <Switch
          checked={subscribed === true}
          onChange={toggle}
          label={t('expiry')}
          describedBy="push-hint"
          disabled={!supported || denied || busy || subscribed === null}
        />
      }
    />
  );
}
