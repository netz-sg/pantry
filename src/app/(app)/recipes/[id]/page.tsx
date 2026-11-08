import Link from 'next/link';
import { HeroMedia } from '@/components/ui/hero-media';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { DeleteRecipeButton } from '@/components/recipes/delete-recipe-button';
import { FavoriteButton } from '@/components/recipes/favorite-button';
import { Flash } from '@/components/recipes/flash';
import { RatingStars } from '@/components/recipes/rating-stars';
import { RecipeView } from '@/components/recipes/recipe-view';
import { ShareButton } from '@/components/recipes/share-button';
import type { ViewIngredient } from '@/components/recipes/types';
import { ChipLink } from '@/components/ui/chip';
import { Group, GroupLabel, Row } from '@/components/ui/list';
import { CompactBar } from '@/components/ui/compact-bar';
import { today } from '@/lib/dates';
import { totalMinutes } from '@/lib/utils';
import { getSessionUser, requirePageUser } from '@/server/lib/session';
import { checkRecipe, loadStock } from '@/server/services/availability';
import { getRecipe } from '@/server/services/recipes';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { id } = await params;
  const user = await getSessionUser();
  const r = user ? getRecipe(user.id, id) : null;
  return r ? { title: r.title, description: r.description ?? undefined } : {};
}

export default async function RecipePage({ params, searchParams }: Props) {
  const user = await requirePageUser();
  const { id } = await params;
  const sp = await searchParams;
  const r = getRecipe(user.id, id);
  if (!r) notFound();

  const t = await getTranslations('recipes');
  const f = await getFormatter();
  const todayKey = today();

  const wanted = Number(one(sp.servings));
  const initialServings = Number.isInteger(wanted) && wanted >= 1 && wanted <= 100 ? wanted : r.servings;
  const flashKey = one(sp.flash);
  const flash = flashKey === 'saved' ? t('flash.saved') : flashKey === 'cooked' ? t('flash.cooked') : null;
  const cleanHref = `/recipes/${r.id}${one(sp.servings) ? `?servings=${initialServings}` : ''}`;

  const avail = checkRecipe(r.ingredients, 1, loadStock(user.id), todayKey);
  const ingredients: ViewIngredient[] = r.ingredients.map((i, idx) => ({
    id: i.id,
    groupName: i.groupName,
    amount: i.amount,
    unit: i.unit,
    name: i.name,
    note: i.note,
    optional: i.optional,
    status: avail.checks[idx]?.status ?? 'unknown',
    haveAmount: avail.checks[idx]?.haveAmount ?? null,
  }));
  const steps = r.steps.map((s) => ({ id: s.id, text: s.text, timerSeconds: s.timerSeconds }));

  const minutes = totalMinutes(r);
  const info = [
    minutes ? { label: t('detail.time'), value: f.number(minutes), unit: t('detail.minutesUnit') } : null,
    r.calories ? { label: t('detail.energy'), value: f.number(r.calories), unit: t('detail.kcal') } : null,
    r.difficulty
      ? {
          label: t('detail.effort'),
          value: t(`detail.difficulty.${r.difficulty}`),
          unit: t('detail.effortLevel', { level: r.difficulty }),
        }
      : null,
  ].filter((x) => x !== null);

  const nutrition = [
    r.calories
      ? { label: t('detail.calories'), value: t('detail.kcalValue', { value: f.number(r.calories) }) }
      : null,
    r.protein != null
      ? {
          label: t('detail.protein'),
          value: t('detail.grams', { value: f.number(r.protein, { maximumFractionDigits: 1 }) }),
        }
      : null,
    r.fat != null
      ? {
          label: t('detail.fat'),
          value: t('detail.grams', { value: f.number(r.fat, { maximumFractionDigits: 1 }) }),
        }
      : null,
    r.carbs != null
      ? {
          label: t('detail.carbs'),
          value: t('detail.grams', { value: f.number(r.carbs, { maximumFractionDigits: 1 }) }),
        }
      : null,
  ].filter((x) => x !== null);

  let sourceHost: string | null = null;
  if (r.sourceUrl) {
    try {
      sourceHost = new URL(r.sourceUrl).hostname.replace(/^www\./, '');
    } catch {
      sourceHost = r.sourceUrl;
    }
  }

  return (
    <article>
      <Flash message={flash} cleanHref={cleanHref} />

      <section className="bleed relative isolate overflow-hidden print:mx-0 print:w-auto">
        <HeroMedia path={r.imagePath} alt={r.title} className="print:hidden" />

        <div className="mx-auto flex min-h-[520px] max-w-[1360px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[120px] text-white md:min-h-[660px] md:px-12 md:pt-24 md:pb-[170px] print:min-h-0 print:p-0 print:text-label">
          <div className="no-print flex items-center justify-between">
            <Link
              href="/recipes"
              aria-label={t('detail.back')}
              className="glass-dark grid size-11 place-items-center rounded-full"
            >
              <ChevronLeft className="size-6" />
            </Link>
            <div className="flex items-center gap-2">
              <ShareButton title={r.title} className="glass-dark" />
              <FavoriteButton id={r.id} value={r.isFavorite} size="lg" className="size-11" />
            </div>
          </div>
          <div className="mt-auto pt-16">
            {r.category ? <p className="font-semibold text-[#ff9c82]">{r.category.name}</p> : null}
            <h1 className="headline mt-3 max-w-4xl text-[2.6rem] leading-[0.98] md:text-[4.5rem]">
              {r.title}
            </h1>
            <CompactBar>{r.title}</CompactBar>
            {r.description ? (
              <p className="mt-5 line-clamp-3 max-w-2xl text-[1.05rem] leading-relaxed text-white/80">
                {r.description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="relative -mt-[90px] px-5 md:-mt-[120px] md:px-12 print:mt-4 print:px-0">
        <div className="px-1">
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <RatingStars id={r.id} value={r.rating} />
          </div>
        </div>

        {info.length ? (
          <dl className="my-4 grid" style={{ gridTemplateColumns: `repeat(${info.length}, minmax(0, 1fr))` }}>
            {info.map((x, i) => (
              <div
                key={x.label}
                className={
                  'relative grid justify-items-center gap-px text-center ' +
                  (i
                    ? 'before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-px before:origin-left before:scale-x-50 before:bg-separator'
                    : '')
                }
              >
                <dt className="text-caption font-semibold text-label-2">{x.label}</dt>
                <dd className="tabular text-[1.35rem] leading-tight font-extrabold tracking-[-0.02em] text-label">
                  {x.value}
                </dd>
                <dd className="text-caption text-label-2">{x.unit}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="h-4" />
        )}

        <RecipeView
          id={r.id}
          baseServings={r.servings}
          initialServings={initialServings}
          ingredients={ingredients}
          steps={steps}
          today={todayKey}
        >
          {r.notes ? (
            <>
              <GroupLabel className="mx-1 md:mx-1">{t('detail.notes')}</GroupLabel>
              <div className="rounded-card bg-surface p-4 text-subhead leading-relaxed whitespace-pre-line shadow-elevated print:shadow-none">
                {r.notes}
              </div>
            </>
          ) : null}

          <div className="grid gap-x-6 md:grid-cols-2">
            {nutrition.length ? (
              <div>
                <GroupLabel className="mx-1 md:mx-1">{t('detail.nutrition')}</GroupLabel>
                <Group inset={false}>
                  {nutrition.map((n) => (
                    <Row key={n.label} title={n.label} end={<span className="tabular">{n.value}</span>} />
                  ))}
                </Group>
              </div>
            ) : null}

            <div>
              <GroupLabel className="mx-1 md:mx-1">{t('detail.info')}</GroupLabel>
              <Group inset={false}>
                <Row
                  title={t('detail.cookCount', { count: r.cookCount })}
                  subtitle={
                    r.lastCookedAt
                      ? t('detail.lastCooked', {
                          date: f.dateTime(r.lastCookedAt, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }),
                        })
                      : undefined
                  }
                />
                {r.sourceUrl ? (
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="relative flex min-h-[3.25rem] items-center gap-3 px-4 py-2.5 before:absolute before:top-0 before:right-0 before:left-4 before:h-px before:origin-top before:scale-y-50 before:bg-separator hover:bg-fill/50"
                  >
                    <span className="flex-1 text-body">{t('detail.source')}</span>
                    <span className="truncate text-subhead text-tint">{sourceHost}</span>
                    <ExternalLink className="size-4 shrink-0 text-label-3" aria-hidden />
                  </a>
                ) : null}
              </Group>
            </div>
          </div>

          {r.tags.length ? (
            <div className="no-print mt-4 flex flex-wrap gap-2" aria-label={t('detail.tags')}>
              {r.tags.map((tag) => (
                <ChipLink key={tag} href={`/recipes?tag=${encodeURIComponent(tag)}`}>
                  #{tag}
                </ChipLink>
              ))}
            </div>
          ) : null}

          <div className="no-print mt-6">
            <DeleteRecipeButton id={r.id} title={r.title} />
          </div>
        </RecipeView>
      </div>
    </article>
  );
}
