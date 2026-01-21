'use client';

import { Heart, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { toggleFavorite } from '@/app/actions/recipes';
import { useTransition } from 'react';

interface RecipeCardProps {
  recipe: {
    id: string;
    titleDe?: string | null;
    titleEn?: string | null;
    descriptionDe?: string | null;
    descriptionEn?: string | null;
    imageUrl?: string | null;
    prepTime?: number | null;
    cookTime?: number | null;
    servings: number;
    category?: string | null;
    favorites?: any[];
  };
  locale: string;
}

export default function RecipeCard({ recipe, locale }: RecipeCardProps) {
  const [isPending, startTransition] = useTransition();
  const title = locale === 'de' ? recipe.titleDe : recipe.titleEn;
  const description = locale === 'de' ? recipe.descriptionDe : recipe.descriptionEn;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const isFavorite = recipe.favorites && recipe.favorites.length > 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(() => {
      toggleFavorite(recipe.id);
    });
  };

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group cursor-pointer bg-zinc-900/50 backdrop-blur-md rounded-[24px] hover:shadow-2xl hover:shadow-black/20 hover:bg-zinc-900/80 transition-all duration-300 flex flex-col overflow-hidden relative border border-white/5 hover:border-white/10 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800/50">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={title || 'Recipe'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center text-zinc-600 group-hover:bg-zinc-800 transition-colors">
            <span className="text-4xl filter grayscale opacity-50">📷</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        {/* Badges over image */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
           <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
            {recipe.category || 'Rezept'}
          </span>
          {totalTime > 0 && (
            <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[11px] font-semibold border border-white/10 flex items-center gap-1">
              ⌛ {totalTime}m
            </span>
          )}
        </div>

        {isFavorite && (
          <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-xl shadow-lg shadow-red-500/20 animate-in zoom-in duration-300">
            <Heart size={14} fill="currentColor" />
          </div>
        )}
        
        <button
          onClick={handleFavoriteClick}
          disabled={isPending}
          className="absolute top-4 right-4 bg-black/20 backdrop-blur-md border border-white/10 p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:border-red-500 hover:text-white"
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h4 className="translate-y-0 group-hover:-translate-y-1 transition-transform duration-300 text-xl font-bold text-white mb-2 leading-tight line-clamp-1">
          {title || 'Untitled Recipe'}
        </h4>
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-6 font-medium group-hover:text-zinc-300 transition-colors">
          {description || 'Keine Beschreibung verfügbar.'}
        </p>
        
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex -space-x-2">
           {/* Mock avatars or just a nice generic indicator */}
            <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#121214] flex items-center justify-center text-[10px] text-zinc-500">🍽️</div>
            <span className="pl-3 text-xs font-bold text-zinc-500 self-center uppercase tracking-wider group-hover:text-zinc-400">
              {recipe.servings} Portionen
            </span>
          </div>
          <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:text-black transition-colors duration-300">
            <Maximize2 size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
