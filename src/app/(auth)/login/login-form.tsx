'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await authClient.signIn.username({
            username: String(f.get('username') ?? ''),
            password: String(f.get('password') ?? ''),
          });
          if (res.error) {
            setError(res.error.status === 429 ? t('tooMany') : t('wrongCredentials'));
            return;
          }
          router.replace('/');
          router.refresh();
        });
      }}
    >
      <Field label={t('username')} htmlFor="username">
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
          minLength={3}
        />
      </Field>
      <Field label={t('password')} htmlFor="password" error={error ?? undefined}>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            required
            aria-invalid={!!error}
            aria-describedby={error ? 'password-error' : undefined}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t('hidePassword') : t('showPassword')}
            className="absolute inset-y-0 right-1 grid w-10 place-items-center text-label-2"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? t('signingIn') : t('signIn')}
      </Button>
    </form>
  );
}
