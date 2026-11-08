'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Camera, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/app/avatar';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Group } from '@/components/ui/list';
import { removeAvatarAction, updateProfileAction, uploadAvatarAction } from '@/server/actions/settings';

const MAX = 12 * 1024 * 1024;

export function ProfileForm({ user }: { user: { name: string; username: string; image: string | null } }) {
  const t = useTranslations('settings.profile');
  const tc = useTranslations('common.actions');
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(user.image);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [saving, startSaving] = useTransition();

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX) {
      toast.error(t('photoHint'));
      return;
    }
    const before = preview;
    const local = URL.createObjectURL(file);
    setPreview(local);
    setUploading(true);
    const form = new FormData();
    form.set('file', file);
    const res = await uploadAvatarAction(form);
    URL.revokeObjectURL(local);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if (!res.ok) {
      setPreview(before);
      toast.error(res.error.message);
      return;
    }
    setPreview(res.data);
    toast.success(t('photoSaved'));
    router.refresh();
  };

  const remove = async () => {
    const before = preview;
    setPreview(null);
    const res = await removeAvatarAction();
    if (!res.ok) {
      setPreview(before);
      toast.error(res.error.message);
      return;
    }
    toast.success(t('photoRemoved'));
    router.refresh();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      const res = await updateProfileAction({ name, username });
      if (!res.ok) {
        setErrors(res.error.fieldErrors ?? {});
        toast.error(res.error.message);
        return;
      }
      setErrors({});
      toast.success(t('saved'));
      router.refresh();
    });
  };

  const dirty = name.trim() !== user.name || username.trim() !== user.username;

  return (
    <>
      <Group className="mt-3">
        <div className="flex flex-col items-center gap-3 px-4 py-6">
          <div className="relative" aria-busy={uploading || undefined}>
            <Avatar name={name || user.name} image={preview} size={96} />
            {uploading ? (
              <span className="absolute inset-0 animate-pulse rounded-full bg-fill-strong" aria-hidden />
            ) : null}
          </div>
          <span className="sr-only" role="status">
            {uploading ? t('uploading') : ''}
          </span>
          <input
            ref={fileRef}
            id="avatar-file"
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-label={t('photo')}
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="tinted"
              className="h-11"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Camera aria-hidden /> {preview ? t('changePhoto') : t('choosePhoto')}
            </Button>
            {preview ? (
              <Button
                type="button"
                variant="secondary"
                className="h-11"
                disabled={uploading}
                onClick={remove}
              >
                <Trash2 aria-hidden /> {t('removePhoto')}
              </Button>
            ) : null}
          </div>
          <p className="text-footnote text-label-2">{t('photoHint')}</p>
        </div>
      </Group>

      <form onSubmit={submit} noValidate>
        <Group className="mt-6 grid gap-4 p-4">
          <Field label={t('name')} htmlFor="profile-name" error={errors.name}>
            <Input
              id="profile-name"
              name="name"
              autoComplete="name"
              value={name}
              maxLength={80}
              required
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'profile-name-error' : undefined}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field
            label={t('username')}
            htmlFor="profile-username"
            error={errors.username}
            hint={t('usernameHint')}
          >
            <Input
              id="profile-username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              minLength={3}
              maxLength={32}
              required
              aria-invalid={errors.username ? true : undefined}
              aria-describedby={errors.username ? 'profile-username-error' : undefined}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>
        </Group>
        <div className="mx-5 mt-4 flex justify-end gap-2 md:mx-12">
          <Button
            type="button"
            variant="secondary"
            className="h-11"
            disabled={!dirty || saving}
            onClick={() => {
              setName(user.name);
              setUsername(user.username);
              setErrors({});
            }}
          >
            {tc('cancel')}
          </Button>
          <Button type="submit" className="h-11" disabled={!dirty || saving}>
            {t('save')}
          </Button>
        </div>
      </form>
    </>
  );
}
