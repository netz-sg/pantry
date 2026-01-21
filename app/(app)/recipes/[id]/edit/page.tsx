import RecipeForm from '@/components/recipes/recipe-form';
import { getRecipeById } from '@/app/actions/recipes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = 'de';

  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <Link
          href={`/recipes/${id}`}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rezept bearbeiten</h1>
          <p className="text-zinc-500 text-sm">
            {locale === 'de' ? recipe.titleDe : recipe.titleEn}
          </p>
        </div>
      </div>

      {/* Form */}
      <RecipeForm locale={locale} recipeId={id} initialData={recipe} />
    </div>
  );
}
