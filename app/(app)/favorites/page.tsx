import { Heart } from 'lucide-react';
import { getFavoriteRecipes } from '@/app/actions/recipes';
import RecipeCard from '@/components/recipes/recipe-card';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const locale = 'en' as 'de' | 'en';
  const t = await getTranslations('favorites');

  const favoriteRecipes = await getFavoriteRecipes();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{t('title')}</h1>
        <p className="text-zinc-400 text-lg">{t('subtitle')}</p>
      </div>

      <div className="h-px bg-white/10" />

      {/* Favorites Grid */}
      {favoriteRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="col-span-full py-32 text-center border-4 border-dashed border-white/10 rounded-3xl bg-zinc-900/50 backdrop-blur-md">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
            <Heart className="text-red-500 fill-red-500/20" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('noFavorites')}</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            {t('noFavoritesDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
