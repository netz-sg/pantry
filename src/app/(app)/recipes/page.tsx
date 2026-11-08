import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BookOpen, Link2, Plus, SearchX } from 'lucide-react';
import { Flash } from '@/components/recipes/flash';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { SearchField } from '@/components/recipes/search-field';
import { SortSelect } from '@/components/recipes/sort-select';
import { buttonVariants } from '@/components/ui/button';
import { ChipLink, ChipRow } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { requirePageUser } from '@/server/lib/session';
import { listCategories, listRecipes, listTags } from '@/server/services/recipes';

type SP = Record<string, string | string[] | undefined>;

const SORTS = ['recent', 'title', 'time', 'cooked'] as const;
type Sort = (typeof SORTS)[number];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('recipes');
  return { title: t('title') };
}

export default async function RecipesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePageUser();
  const t = await getTranslations('recipes');
  const sp = await searchParams;

  const q = one(sp.q)?.slice(0, 200);
  const filterRaw = one(sp.filter);
  const filter = filterRaw === 'favorites' || filterRaw === 'cookable' ? filterRaw : undefined;
  const maxNum = Number(one(sp.max));
  const max = Number.isInteger(maxNum) && maxNum > 0 && maxNum <= 10000 ? maxNum : undefined;
  const category = one(sp.category)?.slice(0, 64);
  const tag = one(sp.tag)?.slice(0, 40);
  const sortRaw = one(sp.sort);
  const sort: Sort = SORTS.includes(sortRaw as Sort) ? (sortRaw as Sort) : 'recent';
  const flash = one(sp.flash) === 'deleted' ? t('flash.deleted') : null;

  const { items, total } = listRecipes(user.id, {
    q,
    favorites: filter === 'favorites' || undefined,
    cookable: filter === 'cookable' || undefined,
    maxMinutes: max,
    categoryId: category,
    tag,
    sort,
    limit: 200,
  });
  const categories = listCategories(user.id);
  const tags = listTags(user.id)
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const state = {
    q,
    filter,
    max: max ? String(max) : undefined,
    category,
    tag,
    sort: sort === 'recent' ? undefined : sort,
  };
  const href = (patch: Partial<typeof state>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...state, ...patch })) if (v) p.set(k, v);
    const qs = p.toString();
    return qs ? `/recipes?${qs}` : '/recipes';
  };
  const anyFilter = Boolean(filter || max || category || tag);
  const cleanHref = href({});

  return (
    <>
      <Flash message={flash} cleanHref={cleanHref} />
      <PageHeader
        title={t('title')}
        subtitle={<span className="tabular">{t('count', { count: total })}</span>}
        actions={
          <>
            <Link
              href="/recipes/new?import=1"
              className={buttonVariants({ variant: 'plain', size: 'icon' })}
              aria-label={t('importFromLink')}
              title={t('importFromLink')}
            >
              <Link2 />
            </Link>
            <Link
              href="/recipes/new"
              className={buttonVariants({ variant: 'plain', size: 'icon', className: 'text-[1.45rem]' })}
              aria-label={t('newRecipe')}
              title={t('newRecipe')}
            >
              <Plus />
            </Link>
          </>
        }
      />

      <div className="flex items-center gap-2 px-5 pt-2 pb-1 md:px-12">
        <SearchField initial={q ?? ''} className="min-w-0 flex-1" />
        <SortSelect value={sort} />
      </div>

      <nav aria-label={t('filters.label')}>
        <ChipRow className="pt-2 pb-4 md:flex-wrap md:overflow-visible">
          <ChipLink
            href={href({ filter: undefined, max: undefined, category: undefined, tag: undefined })}
            active={!anyFilter}
          >
            {t('filters.all')}
          </ChipLink>
          <ChipLink
            href={href({ filter: filter === 'favorites' ? undefined : 'favorites' })}
            active={filter === 'favorites'}
          >
            {t('filters.favorites')}
          </ChipLink>
          <ChipLink
            href={href({ filter: filter === 'cookable' ? undefined : 'cookable' })}
            active={filter === 'cookable'}
          >
            {t('filters.cookable')}
          </ChipLink>
          <ChipLink href={href({ max: max === 30 ? undefined : '30' })} active={max === 30}>
            {t('filters.quick')}
          </ChipLink>
          {categories.map((c) => (
            <ChipLink
              key={c.id}
              href={href({ category: category === c.id ? undefined : c.id })}
              active={category === c.id}
            >
              {c.name}
            </ChipLink>
          ))}
          {tags.map((x) => (
            <ChipLink
              key={x.name}
              href={href({ tag: tag === x.name ? undefined : x.name })}
              active={tag === x.name}
            >
              #{x.name}
            </ChipLink>
          ))}
        </ChipRow>
      </nav>

      {items.length ? (
        <ul className="grid grid-cols-1 gap-x-3 gap-y-6 px-5 sm:grid-cols-2 md:grid-cols-3 md:gap-x-4 md:gap-y-[22px] md:px-12 lg:grid-cols-4">
          {items.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} priority={i < 4} />
          ))}
        </ul>
      ) : anyFilter || q ? (
        <EmptyState
          icon={<SearchX />}
          title={t('noResults.title')}
          text={t('noResults.text')}
          action={
            <Link href="/recipes" className={buttonVariants({ variant: 'secondary' })}>
              {t('noResults.reset')}
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon={<BookOpen />}
          title={t('empty.title')}
          text={t('empty.text')}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/recipes/new" className={buttonVariants({ size: 'lg' })}>
                <Plus /> {t('empty.create')}
              </Link>
              <Link
                href="/recipes/new?import=1"
                className={buttonVariants({ size: 'lg', variant: 'secondary' })}
              >
                <Link2 /> {t('empty.import')}
              </Link>
            </div>
          }
        />
      )}
    </>
  );
}
