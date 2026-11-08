'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Group } from '@/components/ui/list';
import { authClient } from '@/lib/auth-client';

type Errors = { current?: string; next?: string; repeat?: string; form?: string };
type ErrorKey = 'mismatch' | 'tooShort' | 'tooLong' | 'same' | 'wrong' | 'rateLimit' | 'generic';

/** Übersetzt die Fehlercodes von Better-Auth in eigene Texte. */
function errorKey(err: { code?: string; status?: number }): ErrorKey {
  if (err.status === 429) return 'rateLimit';
  switch (err.code) {
    case 'INVALID_PASSWORD':
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'wrong';
    case 'PASSWORD_TOO_SHORT':
      return 'tooShort';
    case 'PASSWORD_TOO_LONG':
      return 'tooLong';
    default:
      return 'generic';
  }
}

export function PasswordForm({ username }: { username: string }) {
  const t = useTranslations('settings.password');
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const local: Errors = {};
    if (next.length < 8) local.next = t('errors.tooShort');
    else if (next.length > 128) local.next = t('errors.tooLong');
    else if (next === current) local.next = t('errors.same');
    if (repeat !== next) local.repeat = t('errors.mismatch');
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    setBusy(true);
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) {
      const key = errorKey(error);
      const msg = t(`errors.${key}`);
      setErrors(
        key === 'wrong'
          ? { current: msg }
          : key === 'tooShort' || key === 'tooLong'
            ? { next: msg }
            : { form: msg },
      );
      toast.error(msg);
      return;
    }
    setErrors({});
    setCurrent('');
    setNext('');
    setRepeat('');
    toast.success(t('saved'));
    router.refresh();
  };

  const type = show ? 'text' : 'password';
  const invalid = (k: keyof Errors) =>
    errors[k] ? { 'aria-invalid': true, 'aria-describedby': `pw-${k}-error` } : {};

  return (
    <form onSubmit={submit} noValidate>
      {/* Hilft Passwort-Managern, das Konto zuzuordnen */}
      <input type="text" name="username" autoComplete="username" value={username} readOnly hidden />
      <Group className="mt-3 grid gap-4 p-4">
        <Field label={t('current')} htmlFor="pw-current" error={errors.current}>
          <Input
            id="pw-current"
            type={type}
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            {...invalid('current')}
          />
        </Field>
        <Field label={t('new')} htmlFor="pw-next" error={errors.next} hint={t('hint')}>
          <Input
            id="pw-next"
            type={type}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            minLength={8}
            maxLength={128}
            required
            {...invalid('next')}
          />
        </Field>
        <Field label={t('repeat')} htmlFor="pw-repeat" error={errors.repeat}>
          <Input
            id="pw-repeat"
            type={type}
            autoComplete="new-password"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            required
            {...invalid('repeat')}
          />
        </Field>
        <Button
          type="button"
          variant="plain"
          className="h-11 justify-self-start px-1"
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />} {show ? t('hide') : t('show')}
        </Button>
      </Group>

      <div className="mx-5 mt-4 flex items-start gap-3 rounded-card bg-orange-soft p-4 md:mx-12">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-orange" aria-hidden />
        <p className="text-subhead text-label">{t('warning')}</p>
      </div>

      {errors.form ? (
        <p className="mx-5 mt-3 text-footnote text-red md:mx-12" role="alert">
          {errors.form}
        </p>
      ) : null}

      <div className="mx-5 mt-4 flex justify-end md:mx-12">
        <Button type="submit" className="h-11" disabled={busy || !current || !next || !repeat}>
          {t('submit')}
        </Button>
      </div>
    </form>
  );
}
