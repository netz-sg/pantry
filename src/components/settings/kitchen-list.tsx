'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Archive, Box, Plus, Refrigerator, Snowflake, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Confirm } from '@/components/ui/confirm';
import { Field, Input, Select } from '@/components/ui/field';
import { Group, GroupLabel, Row, RowIcon } from '@/components/ui/list';
import {
  createCategoryAction,
  createLocationAction,
  deleteCategoryAction,
  deleteLocationAction,
} from '@/server/actions/settings';

type Kind = 'fridge' | 'freezer' | 'pantry' | 'other';
type Item = { id: string; name: string; kind?: Kind };

const KINDS: Kind[] = ['fridge', 'freezer', 'pantry', 'other'];

const KIND_ICON: Record<Kind, { icon: ReactNode; color: string }> = {
  fridge: { icon: <Refrigerator />, color: 'var(--blue)' },
  freezer: { icon: <Snowflake />, color: 'var(--blue)' },
  pantry: { icon: <Archive />, color: 'var(--orange)' },
  other: { icon: <Box />, color: 'var(--green)' },
};

/** Liste mit Hinzufügen und Löschen, für Lagerorte und Kategorien. */
export function KitchenList({ type, items }: { type: 'locations' | 'categories'; items: Item[] }) {
  const t = useTranslations(`settings.${type}`);
  const tl = useTranslations('settings.locations');
  const tc = useTranslations('common.actions');
  const router = useRouter();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Kind>('pantry');
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const isLoc = type === 'locations';

  const add = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    startTransition(async () => {
      const res = isLoc ? await createLocationAction(n, kind) : await createCategoryAction(n);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setError(undefined);
      setName('');
      toast.success(t('added', { name: res.data.name }));
      router.refresh();
    });
  };

  const remove = (item: Item) => {
    startTransition(async () => {
      const res = isLoc ? await deleteLocationAction(item.id) : await deleteCategoryAction(item.id);
      if (!res.ok) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('deleted', { name: item.name }));
      router.refresh();
    });
  };

  return (
    <>
      <Group className="mt-4" aria-busy={pending || undefined}>
        {items.length ? (
          <ul>
            {items.map((item) => {
              const k = item.kind ?? 'other';
              return (
                <li
                  key={item.id}
                  className="relative before:absolute before:top-0 before:right-4 before:left-[3.75rem] before:h-px before:origin-top before:scale-y-50 before:bg-separator first:before:hidden"
                >
                  <Row
                    className="before:hidden"
                    icon={
                      isLoc ? (
                        <RowIcon color={KIND_ICON[k].color}>{KIND_ICON[k].icon}</RowIcon>
                      ) : (
                        <RowIcon color="var(--orange)">
                          <Tag />
                        </RowIcon>
                      )
                    }
                    title={item.name}
                    subtitle={isLoc && tl(`kinds.${k}`) !== item.name ? tl(`kinds.${k}`) : undefined}
                    end={
                      <Confirm
                        title={t('deleteTitle', { name: item.name })}
                        text={t('deleteText')}
                        confirmLabel={tc('delete')}
                        cancelLabel={tc('cancel')}
                        onConfirm={() => remove(item)}
                        trigger={
                          <Button
                            variant="plain"
                            size="icon-lg"
                            className="-mr-2 text-red"
                            aria-label={t('deleteLabel', { name: item.name })}
                            disabled={pending}
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        }
                      />
                    }
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-4 text-subhead text-label-2">{t('empty')}</p>
        )}
      </Group>

      <GroupLabel>{t('add')}</GroupLabel>
      <form onSubmit={add} noValidate>
        <Group className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <Field label={t('name')} htmlFor={`${type}-name`} error={error}>
            <Input
              id={`${type}-name`}
              value={name}
              maxLength={isLoc ? 40 : 60}
              placeholder={t('namePlaceholder')}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${type}-name-error` : undefined}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          {isLoc ? (
            <Field label={tl('kind')} htmlFor="locations-kind">
              <Select
                id="locations-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as Kind)}
                className="md:w-48"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {tl(`kinds.${k}`)}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Button type="submit" className="h-11" disabled={pending || !name.trim()}>
            <Plus aria-hidden /> {tc('add')}
          </Button>
        </Group>
      </form>
    </>
  );
}
