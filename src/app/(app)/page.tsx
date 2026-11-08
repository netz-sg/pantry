import Link from 'next/link';
import { HeroMedia } from '@/components/ui/hero-media';
import { getFormatter, getTranslations } from 'next-intl/server';
import { CalendarDays, Link2, Package, Play, Plus, ShoppingCart } from 'lucide-react';
import { PosterRow } from '@/components/recipes/poster-row';
import { Avatar } from '@/components/app/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { daysUntil, fromDateKey, weekDays } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { requirePageUser } from '@/server/lib/session';
import { getToday } from '@/server/services/today';
import { getRecipe } from '@/server/services/recipes';
import { checkRecipe, loadStock } from '@/server/services/availability';

export default async function TodayPage() {
  const user = await requirePageUser();
  const t = await getTranslations('today');
  const tc = await getTranslations('common');
  const f = await getFormatter();
  const data = getToday(user.id);
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'morning' : hour < 17 ? 'day' : 'evening';
  const first = user.name.split(' ')[0] ?? user.name;

  const nextRecipe = data.next?.recipeId ? getRecipe(user.id, data.next.recipeId) : null;
  const nextAvail = nextRecipe
    ? checkRecipe(
        nextRecipe.ingredients,
        data.next!.servings / nextRecipe.servings,
        loadStock(user.id),
        data.date,
      )
    : null;
  const usesUp = nextRecipe
    ? data.expiring.find((e) =>
        nextRecipe.ingredients.some(
          (i) =>
            i.name.toLowerCase().includes(e.name.toLowerCase()) ||
            e.name.toLowerCase().includes(i.name.toLowerCase()),
        ),
      )
    : undefined;

  const expiryText = (key: string | null) => {
    if (!key) return '';
    const d = daysUntil(key, data.date);
    return d < 0
      ? t('expiry.expired')
      : d === 0
        ? t('expiry.today')
        : d === 1
          ? t('expiry.tomorrow')
          : t('expiry.inDays', { count: d });
  };

  const dayDate = fromDateKey(data.date);
  // Großes Bild oben. Geplantes Gericht, sonst ein Rezept mit Foto, sonst nur Farbe.
  const featured = data.recent.find((r) => r.imagePath) ?? null;
  const heroImage = nextRecipe?.imagePath ?? featured?.imagePath ?? null;
  const dateLine = f.dateTime(dayDate, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <h1 className="sr-only">{t('title')}</h1>
      <section className="bleed relative isolate overflow-hidden">
        <HeroMedia path={heroImage} alt="" />

        <div className="mx-auto flex min-h-[620px] max-w-[1360px] flex-col justify-end px-5 pt-[calc(env(safe-area-inset-top)+5rem)] pb-[170px] text-white md:min-h-[740px] md:px-12 md:pb-[260px]">
          <Link
            href="/settings"
            className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 md:hidden"
            aria-label={tc('nav.settings')}
          >
            <Avatar name={user.name} image={user.image} size={38} />
          </Link>
          {nextRecipe && data.next ? (
            <>
              <p className="font-semibold text-[#ff9c82]">{t(`next.${data.next.slot}`)}</p>
              <h2 className="headline mt-3 max-w-3xl text-[2.9rem] leading-[0.98] md:text-[4.75rem]">
                {nextRecipe.title}
              </h2>
              <p className="tabular mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/80">
                {[
                  nextRecipe.prepMinutes || nextRecipe.cookMinutes
                    ? tc('minutes', { count: (nextRecipe.prepMinutes ?? 0) + (nextRecipe.cookMinutes ?? 0) })
                    : null,
                  tc('servings', { count: data.next.servings }),
                  usesUp ? t('next.usesUp', { name: usesUp.name }) : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/recipes/${nextRecipe.id}/cook?servings=${data.next.servings}&entry=${data.next.id}`}
                  className={buttonVariants({ variant: 'white', size: 'lg' })}
                >
                  <Play className="fill-current" /> {t('next.cook')}
                </Link>
                <Link
                  href={`/recipes/${nextRecipe.id}?servings=${data.next.servings}`}
                  className="glass-dark inline-flex h-12 items-center rounded-full px-5 text-callout font-semibold"
                >
                  {nextAvail && nextAvail.missingCount
                    ? t('next.missing', { count: nextAvail.missingCount })
                    : t('next.allThere')}
                </Link>
              </div>
            </>
          ) : data.recipeCount === 0 ? (
            <>
              <p className="font-semibold text-[#ff9c82]">{dateLine}</p>
              <h2 className="headline mt-3 max-w-3xl text-[2.9rem] leading-[0.98] md:text-[4.75rem]">
                {t('welcomeTitle')}
              </h2>
              <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/80">{t('welcomeText')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/recipes/new" className={buttonVariants({ variant: 'white', size: 'lg' })}>
                  <Plus /> {t('newRecipe')}
                </Link>
                <Link
                  href="/recipes/new?import=1"
                  className="glass-dark inline-flex h-12 items-center gap-2 rounded-full px-5 text-callout font-semibold"
                >
                  <Link2 className="size-[1.1em]" /> {t('importRecipe')}
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#ff9c82]">{dateLine}</p>
              <h2 className="headline mt-3 max-w-3xl text-[2.9rem] leading-[0.98] md:text-[4.75rem]">
                {t(`greeting.${greet}`, { name: first })}
              </h2>
              <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/80">
                {t('nothingPlanned')}. {t('nothingPlannedText')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/plan" className={buttonVariants({ variant: 'white', size: 'lg' })}>
                  <CalendarDays /> {t('planWeek')}
                </Link>
                {featured ? (
                  <Link
                    href={`/recipes/${featured.id}`}
                    className="glass-dark inline-flex h-12 items-center rounded-full px-5 text-callout font-semibold"
                  >
                    {featured.title}
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="relative -mt-[110px] md:-mt-[150px]">
        {data.recipeCount > 0 ? (
          <>
            {/* Dein Tag als drei breite Bildkarten */}
            <section aria-labelledby="day-title">
              <div className="mb-4 flex items-baseline justify-between gap-4 px-5 md:px-12">
                <h2 id="day-title" className="text-[1.375rem] leading-tight font-bold tracking-[-0.02em]">
                  {t('dayTitle')}
                </h2>
              </div>
              <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible md:px-12">
                {(['breakfast', 'lunch', 'dinner'] as const).map((slot, i) => {
                  const e = data.entries.find((x) => x.slot === slot);
                  const title = e?.recipe?.title ?? e?.title;
                  const isNext = !!e && e.id === data.next?.id;
                  if (e && title) {
                    return (
                      <Link
                        key={slot}
                        href={e.recipeId ? `/recipes/${e.recipeId}?servings=${e.servings}` : '/plan'}
                        className={cn(
                          'group relative block aspect-video w-[82%] shrink-0 snap-start overflow-hidden rounded-[14px] sm:w-auto',
                        )}
                      >
                        <Photo
                          path={e.recipe?.imagePath}
                          alt=""
                          seed={title}
                          className="absolute inset-0 size-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                        <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                          <span className="block text-footnote text-white/75">
                            {e.cooked ? t('eatenSlot', { slot: tc(`slots.${slot}`) }) : tc(`slots.${slot}`)}
                          </span>
                          <span
                            className={cn(
                              'mt-1 line-clamp-2 text-[1.1rem] leading-snug font-bold',
                              e.cooked && 'line-through opacity-70',
                            )}
                          >
                            {title}
                          </span>
                        </span>
                        {/* Rahmen innen, damit ihn der Scrollbereich nicht abschneidet */}
                        {isNext ? (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_3px_var(--tint),inset_0_0_0_6px_var(--bg)]"
                          />
                        ) : null}
                      </Link>
                    );
                  }
                  // Freier Platz mit einem Vorschlag aus den eigenen Rezepten
                  const pool = data.cookable.length ? data.cookable : data.recent;
                  const idea =
                    pool.filter((r) => r.id !== nextRecipe?.id)[i % Math.max(1, pool.length)] ?? null;
                  return (
                    <Link
                      key={slot}
                      href={`/plan?add=${data.date}&slot=${slot}`}
                      className="group flex aspect-video w-[82%] shrink-0 snap-start flex-col justify-end rounded-[14px] bg-[linear-gradient(135deg,var(--tint-soft),var(--surface))] p-4 transition-colors hover:bg-tint-soft sm:w-auto"
                    >
                      <span className="text-footnote text-label-2">{tc(`slots.${slot}`)}</span>
                      <span className="mt-1 text-[1.1rem] leading-snug font-bold">{t('noMeal')}</span>
                      <span className="mt-2 flex items-center gap-1.5 text-subhead font-semibold text-tint">
                        <Plus className="size-4 shrink-0" aria-hidden />
                        <span className="line-clamp-1">
                          {idea ? t('suggestion', { title: idea.title }) : t('planIt')}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Die Woche als Reihe hoher Fotokarten */}
            <section aria-labelledby="week-title" className="mt-14">
              <div className="mb-4 flex items-baseline justify-between gap-4 px-5 md:px-12">
                <h2 id="week-title" className="text-[1.375rem] leading-tight font-bold tracking-[-0.02em]">
                  {t('week')}
                </h2>
                <Link href="/plan" className="tabular text-subhead text-label-2 hover:text-label">
                  {t('weekPlanned', { count: data.week.entries.length })}
                </Link>
              </div>
              <ol className="no-scrollbar row-bleed grid auto-cols-[8.5rem] grid-flow-col gap-3 overflow-x-auto pb-1 md:auto-cols-fr">
                {weekDays(data.week.start).map((day) => {
                  const list = data.week.entries.filter((e) => e.date === day);
                  const main =
                    list.find((e) => e.slot === 'dinner') ?? list.find((e) => e.slot === 'lunch') ?? list[0];
                  const title = main ? (main.recipe?.title ?? main.title) : null;
                  const isToday = day === data.date;
                  const d = fromDateKey(day);
                  return (
                    <li key={day} className="min-w-0">
                      <Link
                        href={
                          main?.recipeId
                            ? `/recipes/${main.recipeId}`
                            : main
                              ? '/plan'
                              : `/plan?add=${day}&slot=dinner`
                        }
                        aria-label={`${f.dateTime(d, { weekday: 'long', day: 'numeric', month: 'long' })}${title ? `, ${title}` : ''}`}
                        className="group block"
                      >
                        <span className={cn('relative block aspect-[3/4] overflow-hidden rounded-[12px]')}>
                          {main ? (
                            <Photo
                              path={main.recipe?.imagePath}
                              alt=""
                              seed={title ?? ''}
                              className="absolute inset-0 size-full transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                            />
                          ) : (
                            <span className="grid size-full place-items-center rounded-[12px] border border-dashed border-label-3/50 text-label-3 transition-colors group-hover:border-tint group-hover:bg-tint-soft group-hover:text-tint">
                              <Plus className="size-5" aria-hidden />
                            </span>
                          )}
                          {isToday ? (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_3px_var(--tint),inset_0_0_0_6px_var(--bg)]"
                            />
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            'mt-2.5 line-clamp-1 text-subhead font-semibold',
                            isToday ? 'text-tint' : main ? '' : 'text-label-2',
                          )}
                        >
                          {title ?? t('freeDay')}
                        </span>
                        <span className="mt-0.5 block text-footnote text-label-2">
                          {isToday ? t('title') : f.dateTime(d, { weekday: 'long' })}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          </>
        ) : null}

        {/* Kurze Hinweise statt Kästen */}
        <nav
          aria-label={t('overview')}
          className={cn('flex flex-wrap gap-2.5 px-5 md:px-12', data.recipeCount > 0 ? 'mt-12' : 'mt-0')}
        >
          <Link
            href="/shopping"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-fill px-5 text-subhead font-semibold transition-colors hover:bg-fill-strong"
          >
            <ShoppingCart className="size-[18px] text-tint" aria-hidden />
            {t('shoppingPill', { count: data.shopping.open })}
          </Link>
          {data.expiring.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              href="/pantry"
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full px-5 text-subhead font-semibold transition-colors',
                p.expiry === 'week'
                  ? 'bg-fill hover:bg-fill-strong'
                  : 'bg-red-soft text-red hover:bg-red-soft/70',
              )}
            >
              {p.name} {expiryText(p.expiresOn)}
            </Link>
          ))}
          <Link
            href="/pantry"
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full px-5 text-subhead font-semibold transition-colors',
              data.pantry.total ? 'bg-fill hover:bg-fill-strong' : 'bg-tint text-on-tint hover:bg-tint-hover',
            )}
          >
            <Package className={cn('size-[18px]', data.pantry.total && 'text-tint')} aria-hidden />
            {data.pantry.total ? t('pantryPill', { count: data.pantry.total }) : t('pantryAdd')}
          </Link>
        </nav>

        {data.recipeCount > 0 ? (
          <>
            {data.cookable.length ? (
              <PosterRow
                title={data.cookableIsAlmost ? t('almost') : t('cookable')}
                link={{ href: '/recipes?filter=cookable', label: t('all') }}
                items={data.cookable.map((r) => ({
                  id: r.id,
                  title: r.title,
                  imagePath: r.imagePath,
                  meta: [
                    r.totalMinutes ? tc('minutes', { count: r.totalMinutes }) : null,
                    r.missingCount ? r.missing[0] : t('next.allThere'),
                  ]
                    .filter(Boolean)
                    .join(', '),
                }))}
              />
            ) : null}
            <PosterRow
              title={tc('nav.recipes')}
              link={{ href: '/recipes', label: t('all') }}
              items={data.recent.map((r) => ({
                id: r.id,
                title: r.title,
                imagePath: r.imagePath,
                meta: r.totalMinutes ? tc('minutes', { count: r.totalMinutes }) : '',
              }))}
            />
          </>
        ) : null}
      </div>
    </>
  );
}
