import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { getISOWeek } from 'date-fns';
import { PageHeader } from '@/components/ui/page-header';
import { PlanBoard } from '@/components/plan/plan-board';
import { WeekActions } from '@/components/plan/week-actions';
import { WeekNav } from '@/components/plan/week-nav';
import { isSlot, noon, type BoardEntry, type RecipeOption } from '@/components/plan/types';
import { isValidDateKey, today } from '@/lib/dates';
import { totalMinutes } from '@/lib/utils';
import { requirePageUser } from '@/server/lib/session';
import { getWeek } from '@/server/services/plan';
import { listRecipes } from '@/server/services/recipes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('plan');
  return { title: t('title') };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const validDate = (v: string | string[] | undefined) => {
  const s = one(v);
  return s && isValidDateKey(s) ? s : undefined;
};

export default async function PlanPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePageUser();
  const sp = await searchParams;
  const t = await getTranslations('plan');
  const f = await getFormatter();

  const todayKey = today();
  const add = validDate(sp.add);
  const day = validDate(sp.day);
  const slotParam = one(sp.slot);
  const anchor = validDate(sp.week) ?? add ?? day ?? todayKey;

  const week = getWeek(user.id, anchor);
  const { start, days } = week;
  const end = days[6]!;

  const entries: BoardEntry[] = week.entries.map((e) => ({
    id: e.id,
    date: e.date,
    slot: e.slot,
    recipeId: e.recipeId,
    title: e.title,
    servings: e.servings,
    note: e.note,
    cooked: e.cooked,
    recipe: e.recipe
      ? {
          id: e.recipe.id,
          title: e.recipe.title,
          imagePath: e.recipe.imagePath,
          servings: e.recipe.servings,
          totalMinutes: totalMinutes(e.recipe),
        }
      : null,
  }));

  const recipes: RecipeOption[] = listRecipes(user.id, { limit: 30 }).items.map((r) => ({
    id: r.id,
    title: r.title,
    imagePath: r.imagePath,
    servings: r.servings,
    totalMinutes: r.totalMinutes,
    ingredientCount: r.ingredientCount,
    missingCount: r.missingCount,
  }));

  const inWeek = (k?: string) => (k && days.includes(k) ? k : undefined);
  const initialDay = inWeek(day) ?? inWeek(add) ?? inWeek(todayKey) ?? start;
  const initialAdd = inWeek(add)
    ? { date: add!, slot: isSlot(slotParam) ? slotParam : ('dinner' as const) }
    : null;

  // Datumsbereich ohne Strich, z. B. „9. bis 15. November“
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  const showYear = end.slice(0, 4) !== todayKey.slice(0, 4);
  const range = t('range', {
    from: f.dateTime(noon(start), sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' }),
    to: f.dateTime(
      noon(end),
      showYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' },
    ),
  });
  const isCurrent = days.includes(todayKey);

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle', { week: getISOWeek(noon(start)), range })}
        actions={
          <>
            <WeekNav start={start} isCurrent={isCurrent} className="max-md:hidden" />
            <WeekActions start={start} end={end} variant="menu" className="max-md:hidden lg:hidden" />
          </>
        }
      />
      <div className="flex items-center justify-between px-4 pb-1 md:hidden">
        <WeekNav start={start} isCurrent={isCurrent} />
        <WeekActions start={start} end={end} variant="menu" />
      </div>
      <WeekActions start={start} end={end} variant="bar" className="max-lg:hidden" />
      <PlanBoard
        key={start}
        start={start}
        days={days}
        today={todayKey}
        entries={entries}
        recipes={recipes}
        initialDay={initialDay}
        initialAdd={initialAdd}
      />
    </>
  );
}
