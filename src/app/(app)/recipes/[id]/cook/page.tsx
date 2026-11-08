import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CookMode } from '@/components/recipes/cook-mode';
import type { ViewIngredient } from '@/components/recipes/types';
import { today } from '@/lib/dates';
import { getSessionUser, requirePageUser } from '@/server/lib/session';
import { checkRecipe, loadStock } from '@/server/services/availability';
import { getRecipe } from '@/server/services/recipes';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const user = await getSessionUser();
  const r = user ? getRecipe(user.id, (await params).id) : null;
  return r ? { title: r.title } : {};
}

export default async function CookPage({ params, searchParams }: Props) {
  const user = await requirePageUser();
  const { id } = await params;
  const sp = await searchParams;
  const r = getRecipe(user.id, id);
  if (!r) notFound();

  const wanted = Number(one(sp.servings));
  const servings = Number.isInteger(wanted) && wanted >= 1 && wanted <= 100 ? wanted : r.servings;
  const entryRaw = one(sp.entry);
  const entry = entryRaw && /^[\w-]{1,64}$/.test(entryRaw) ? entryRaw : null;

  const avail = checkRecipe(r.ingredients, 1, loadStock(user.id), today());
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

  return (
    <CookMode
      id={r.id}
      title={r.title}
      baseServings={r.servings}
      servings={servings}
      entry={entry}
      ingredients={ingredients}
      steps={r.steps.map((s) => ({ id: s.id, text: s.text, timerSeconds: s.timerSeconds }))}
    />
  );
}
