'use client';

import { Clock, Flame, ArrowRight, ChefHat, Timer } from 'lucide-react';
import Link from 'next/link';

interface FeaturedRecipeProps {
  recipe: {
    id: string;
    titleDe?: string | null;
    titleEn?: string | null;
    descriptionDe?: string | null;
    descriptionEn?: string | null;
    imageUrl?: string | null;
    prepTime?: number | null;
    cookTime?: number | null;
    calories?: number | null;
    tags?: string[] | null;
  };
  locale: string;
}

export default function FeaturedRecipe({ recipe, locale }: FeaturedRecipeProps) {
  const title = locale === 'de' ? recipe.titleDe : recipe.titleEn;
  const description = locale === 'de' ? recipe.descriptionDe : recipe.descriptionEn;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group relative block bg-zinc-900/40 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl shadow-black/20 hover:shadow-blue-900/10 transition-all duration-500 border border-white/5"
    >
      <div className="flex flex-col md:flex-row min-h-[450px]">
        {/* Visual Side (Mobile: Top, Desktop: Right) */}
        <div className="relative h-64 md:h-auto md:w-3/5 order-1 md:order-2 overflow-hidden">
            {recipe.imageUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={recipe.imageUrl}
                  alt={title || 'Recipe'}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#09090b] via-transparent to-transparent opacity-90" />
              </div>
            ) : (
               <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center border-l border-white/5">
                  <ChefHat size={48} className="text-zinc-600" />
               </div>
            )}
            
            {/* Floating Tags */}
             <div className="absolute top-6 right-6 flex flex-wrap gap-2 justify-end z-10">
              {recipe.tags && recipe.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-black/60 backdrop-blur-md text-white border border-white/10 text-xs font-bold rounded-full shadow-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
        </div>

        {/* Content Side (Mobile: Bottom, Desktop: Left) */}
        <div className="relative p-8 md:p-12 md:w-2/5 flex flex-col justify-between order-2 md:order-1 bg-transparent">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
                <ChefHat size={12} />
                Tipp des Tages
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[0.9] group-hover:text-blue-400 transition-colors">
                  {title || 'Untitled Recipe'}
                </h3>
                
                <p className="text-zinc-400 text-lg leading-relaxed line-clamp-3 font-medium">
                  {description || 'Entdecke dieses Highlight aus deiner Küche.'}
                </p>
              </div>
           </div>

           <div className="pt-8 mt-6 border-t border-white/10 flex items-end justify-between">
              <div className="flex gap-8">
                {totalTime > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Zeit</span>
                    <span className="flex items-center gap-2 text-zinc-200 font-bold text-lg">
                      <Timer size={18} className="text-zinc-500" /> {totalTime} min
                    </span>
                  </div>
                )}
                {recipe.calories && (
                   <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Kalorien</span>
                    <span className="flex items-center gap-2 text-zinc-200 font-bold text-lg">
                       <Flame size={18} className="text-zinc-500" /> {recipe.calories}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 shadow-sm group-hover:shadow-blue-500/50 group-hover:scale-110">
                 <ArrowRight size={24} className="group-hover:-rotate-45 transition-transform duration-300" />
              </div>
           </div>
        </div>
      </div>
    </Link>
  );
}
