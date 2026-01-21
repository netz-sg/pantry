import { Heart } from 'lucide-react';
import { getFavoriteRecipes } from '@/app/actions/recipes';
import RecipeCard from '@/components/recipes/recipe-card';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const locale = 'de';

  const favoriteRecipes = await getFavoriteRecipes();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Favoriten</h1>
        <p className="text-zinc-500 text-lg">Deine kuratierte Auswahl an Lieblingsgerichten.</p>
      </div>
      
      <div className="h-px bg-zinc-100" />

      {/* Favorites Grid */}
      {favoriteRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="col-span-full py-32 text-center border-4 border-dashed border-zinc-100 rounded-3xl bg-white">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-red-300 fill-red-100" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Keine Favoriten</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Markiere Rezepte mit dem Herz-Symbol, um sie hier wiederzufinden.
          </p>
        </div>
      )}
    </div>
  );
}
