import RecipeForm from '@/components/recipes/recipe-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function NewRecipePage() {
  const locale = 'en' as 'de' | 'en';
  const t = await getTranslations('recipes');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <Link
          href="/recipes"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('newRecipe')}</h1>
          <p className="text-zinc-400 text-sm">{t('newRecipeDescription')}</p>
        </div>
      </div>

      {/* Form */}
      <RecipeForm locale={locale} />
    </div>
  );
}
