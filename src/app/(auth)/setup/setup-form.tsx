'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { setupAccount, type SetupState } from '@/server/actions/auth';

export function SetupForm({ needsToken }: { needsToken: boolean }) {
  const t = useTranslations('auth');
  const [state, action, pending] = useActionState<SetupState, FormData>(setupAccount, null);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4">
      <Field label={t('name')} htmlFor="name" error={fe.name}>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          required
          aria-invalid={!!fe.name}
        />
      </Field>
      <Field label={t('username')} htmlFor="username" error={fe.username} hint={t('usernameHint')}>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          minLength={3}
          maxLength={32}
          pattern="[a-zA-Z0-9_.\-]+"
          aria-invalid={!!fe.username}
        />
      </Field>
      <Field label={t('password')} htmlFor="password" error={fe.password} hint={t('passwordHint')}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          aria-invalid={!!fe.password}
        />
      </Field>
      {needsToken ? (
        <Field label={t('setupToken')} htmlFor="setupToken" error={fe.setupToken} hint={t('setupTokenHint')}>
          <Input
            id="setupToken"
            name="setupToken"
            autoComplete="off"
            required
            aria-invalid={!!fe.setupToken}
          />
        </Field>
      ) : null}
      {state?.error && !Object.keys(fe).length ? (
        <p className="rounded-[12px] bg-red-soft px-3.5 py-2.5 text-subhead text-red" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
        {pending ? t('creating') : t('createAccount')}
      </Button>
    </form>
  );
}
