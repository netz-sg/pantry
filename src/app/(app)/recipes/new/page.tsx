import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { requirePageUser } from '@/server/lib/session';
import { listCategories, listTags } from '@/server/services/recipes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('recipes.form');
  return { title: t('newTitle') };
}

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePageUser();
  const sp = await searchParams;
  const categories = listCategories(user.id).map((c) => ({ id: c.id, name: c.name }));
  const tags = listTags(user.id).map((x) => x.name);
  return (
    <RecipeForm
      initial={{ servings: 4, ingredients: [], steps: [] }}
      imagePath={null}
      categories={categories}
      tagSuggestions={tags}
      showImport
      focusImport={sp.import === '1'}
      cancelHref="/recipes"
    />
  );
}
