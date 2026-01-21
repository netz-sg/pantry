import { Plus } from 'lucide-react';
import { getRecipes } from '@/app/actions/recipes';
import RecipeCard from '@/components/recipes/recipe-card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
  const locale = 'de';

  const recipes = await getRecipes();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Rezepte</h1>
          <p className="text-zinc-400 text-lg">Verwalte deine kulinarischen Meisterwerke.</p>
        </div>
        <Link
          href="/recipes/new"
          className="flex items-center gap-2 px-5 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all hover:-translate-y-0.5 shadow-lg shadow-white/5"
        >
          <Plus size={18} /> Neues Rezept
        </Link>
      </div>
      
      <div className="h-px bg-white/10" />

      {/* Recipe Grid */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center border-4 border-dashed border-white/10 rounded-3xl bg-zinc-900/50 backdrop-blur-md">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
            <Plus size={32} className="text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Deine Sammlung ist leer</h2>
          <p className="text-zinc-400 max-w-md mb-8 text-lg">
            Es wird Zeit, den Kochlöffel zu schwingen.
          </p>
          <Link
            href="/recipes/new"
            className="px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors font-medium"
          >
            Erstes Rezept erstellen
          </Link>
        </div>
      )}
    </div>
  );
}
