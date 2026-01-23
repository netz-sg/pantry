import { getRecipeById } from '@/app/actions/recipes';
import { notFound } from 'next/navigation';
import RecipeDetailClient from './recipe-detail-client';

export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = 'en' as 'de' | 'en';

  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return <RecipeDetailClient recipe={recipe} locale={locale} />;
}
