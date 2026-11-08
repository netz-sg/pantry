import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { requirePageUser } from '@/server/lib/session';
import { getRecipe, listCategories, listTags } from '@/server/services/recipes';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations('recipes.form');
  const user = await requirePageUser();
  const r = getRecipe(user.id, (await params).id);
  return { title: r ? `${t('editTitle')}, ${r.title}` : t('editTitle') };
}

export default async function EditRecipePage({ params }: Props) {
  const user = await requirePageUser();
  const { id } = await params;
  const r = getRecipe(user.id, id);
  if (!r) notFound();
  const categories = listCategories(user.id).map((c) => ({ id: c.id, name: c.name }));
  const tags = listTags(user.id).map((x) => x.name);
  return (
    <RecipeForm
      key={r.updatedAt?.getTime() ?? r.id}
      recipeId={r.id}
      initial={{
        title: r.title,
        description: r.description,
        categoryId: r.categoryId,
        servings: r.servings,
        prepMinutes: r.prepMinutes,
        cookMinutes: r.cookMinutes,
        restMinutes: r.restMinutes,
        difficulty: r.difficulty,
        calories: r.calories,
        protein: r.protein,
        fat: r.fat,
        carbs: r.carbs,
        sourceUrl: r.sourceUrl,
        notes: r.notes,
        tags: r.tags,
        ingredients: r.ingredients.map((i) => ({
          groupName: i.groupName,
          amount: i.amount,
          unit: i.unit,
          name: i.name,
          note: i.note,
          optional: i.optional,
        })),
        steps: r.steps.map((s) => ({ text: s.text, timerSeconds: s.timerSeconds })),
      }}
      imagePath={r.imagePath}
      categories={categories}
      tagSuggestions={tags}
      cancelHref={`/recipes/${r.id}`}
    />
  );
}
