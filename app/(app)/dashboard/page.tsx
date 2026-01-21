import { auth } from '@/lib/auth';
import { Search, Plus } from 'lucide-react';
import { getRecipes } from '@/app/actions/recipes';
import FeaturedRecipe from '@/components/recipes/featured-recipe';
import RecipeCard from '@/components/recipes/recipe-card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const locale = 'de';
  const session = await auth();

  const allRecipes = await getRecipes();
  const featuredRecipe = allRecipes[0];
  const recentRecipes = allRecipes.slice(1, 4);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12 pt-6">
      {/* Hero Welcome Area */}
      <div className="relative bg-black rounded-[32px] p-8 md:p-12 overflow-hidden shadow-2xl shadow-zinc-900/20 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium backdrop-blur-md">
              👋 Willkommen zurück, {session?.user?.name?.split(' ')[0]}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
              Was kochen wir <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">heute?</span>
            </h1>
            <p className="text-zinc-300 text-lg leading-relaxed max-w-lg">
              Du hast <strong className="text-white">{allRecipes.length} Rezepte</strong> in deiner Sammlung. 
              Entdecke neue Ideen oder plane deine Woche.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
             <Link
              href="/recipes/new"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-100 transition-all hover:scale-105 shadow-xl shadow-white/10"
            >
              <Plus size={20} />
              Neues Rezept
            </Link>
            <div className="relative w-full md:w-80 h-14 group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-sm group-hover:bg-white/10 transition-all" />
                <div className="relative h-full flex items-center px-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl hover:bg-white/15 transition-colors">
                  <Search className="text-zinc-400 mr-3" size={20} />
                  <input
                    type="text"
                    placeholder="Suche nach Rezepten..."
                    className="bg-transparent border-none focus:outline-none text-white w-full placeholder:text-zinc-400 placeholder:font-medium"
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Recipe */}
      {featuredRecipe && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-1 h-8 bg-white rounded-full" />
             <h2 className="text-2xl font-bold text-white tracking-tight">Empfehlung des Tages</h2>
          </div>
          <FeaturedRecipe recipe={featuredRecipe} locale={locale} />
        </section>
      )}

      {/* Recent Recipes Grid */}
      {recentRecipes.length > 0 && (
        <section className="space-y-8">
          <div className="flex justify-between items-end px-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Frisch gekocht</h2>
               <p className="text-zinc-400 text-sm font-medium">Deine neuesten Kreationen</p>
            </div>
            <Link
              href="/recipes"
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-300 hover:text-white hover:border-white hover:bg-white/10 transition-all"
            >
              Alle ansehen
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {allRecipes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center border-4 border-dashed border-white/10 rounded-[32px] bg-zinc-900/50 backdrop-blur-md">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner ring-1 ring-white/10">
            <Plus size={40} className="text-zinc-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Deine Küche ist leer</h2>
          <p className="text-zinc-400 max-w-md mb-8 text-lg">
            Starte deine kulinarische Reise und füge dein allererstes Rezept hinzu.
          </p>
          <Link
            href="/recipes/new"
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all hover:-translate-y-1 shadow-xl shadow-white/5"
          >
            Erstes Rezept erstellen
          </Link>
        </div>
      )}
    </div>
  );
}
