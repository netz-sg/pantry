'use client';

import { Command } from 'cmdk';
import { Dialog } from 'radix-ui';
import {
  BookOpen,
  CalendarDays,
  House,
  Link2,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Photo } from '@/components/ui/photo';

const EVENT = 'pantry:open-command';
export function openCommandPalette() {
  window.dispatchEvent(new Event(EVENT));
}

type Hit = { id: string; title: string; imagePath: string | null; totalMinutes: number };

/** Befehlspalette für Suche und Aktionen, mit ⌘K oder Strg+K erreichbar. */
export function CommandPalette() {
  const t = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const ctl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/recipes?limit=8${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ''}`,
          { signal: ctl.signal },
        );
        if (res.ok) setHits(((await res.json()) as { data: Hit[] }).data);
      } catch {
        /* abgebrochen */
      }
    }, 120);
    return () => {
      clearTimeout(id);
      ctl.abort();
    };
  }, [q, open]);

  const go = (href: string) => {
    setOpen(false);
    setQ('');
    router.push(href);
  };

  const item =
    'flex h-11 cursor-pointer items-center gap-3 rounded-[10px] px-3 text-callout data-[selected=true]:bg-fill';

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-[12vh] left-1/2 z-[70] w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-[20px] bg-surface shadow-2xl outline-none">
          <Dialog.Title className="sr-only">{t('nav.search')}</Dialog.Title>
          <Dialog.Description className="sr-only">{t('search.placeholder')}</Dialog.Description>
          <Command shouldFilter={false} loop>
            <div className="flex items-center gap-2.5 border-b border-separator px-4">
              <Search className="size-5 text-label-2" />
              <Command.Input
                value={q}
                onValueChange={setQ}
                placeholder={t('search.placeholder')}
                className="h-14 flex-1 bg-transparent text-body outline-none placeholder:text-label-3"
              />
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-6 text-center text-subhead text-label-2">
                {t('search.empty')}
              </Command.Empty>
              {hits.length ? (
                <Command.Group
                  heading={t('search.recipes')}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-footnote [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-label-2"
                >
                  {hits.map((h) => (
                    <Command.Item
                      key={h.id}
                      value={`r-${h.id}`}
                      onSelect={() => go(`/recipes/${h.id}`)}
                      className={item}
                    >
                      <Photo path={h.imagePath} alt="" seed={h.title} className="size-8 rounded-[8px]" />
                      <span className="flex-1 truncate">{h.title}</span>
                      {h.totalMinutes ? (
                        <span className="text-footnote text-label-2">
                          {t('minutes', { count: h.totalMinutes })}
                        </span>
                      ) : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}
              <Command.Group
                heading={t('search.actions')}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-footnote [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-label-2"
              >
                <Command.Item value="new" onSelect={() => go('/recipes/new')} className={item}>
                  <Plus className="size-5 text-tint" />
                  {t('search.newRecipe')}
                </Command.Item>
                <Command.Item value="import" onSelect={() => go('/recipes/new?import=1')} className={item}>
                  <Link2 className="size-5 text-tint" />
                  {t('search.importRecipe')}
                </Command.Item>
                <Command.Item
                  value="shop"
                  onSelect={() => go(`/shopping${q.trim() ? `?add=${encodeURIComponent(q.trim())}` : ''}`)}
                  className={item}
                >
                  <ShoppingCart className="size-5 text-tint" />
                  {t('search.addShopping')}
                  {q.trim() ? <span className="truncate text-label-2">„{q.trim()}“</span> : null}
                </Command.Item>
                <Command.Item
                  value="pantry"
                  onSelect={() => go(`/pantry?add=${encodeURIComponent(q.trim())}`)}
                  className={item}
                >
                  <Package className="size-5 text-tint" />
                  {t('search.addPantry')}
                </Command.Item>
              </Command.Group>
              <Command.Group
                heading={t('search.goTo')}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-footnote [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-label-2"
              >
                {[
                  ['/', House, t('nav.today')],
                  ['/recipes', BookOpen, t('nav.recipes')],
                  ['/plan', CalendarDays, t('nav.planLong')],
                  ['/shopping', ShoppingCart, t('nav.shopping')],
                  ['/pantry', Package, t('nav.pantry')],
                  ['/settings', Settings, t('nav.settings')],
                ].map(([href, Icon, label]) => {
                  const I = Icon as typeof House;
                  return (
                    <Command.Item
                      key={href as string}
                      value={`go-${href}`}
                      onSelect={() => go(href as string)}
                      className={item}
                    >
                      <I className="size-5 text-label-2" />
                      {label as string}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
