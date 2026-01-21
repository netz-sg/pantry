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
      className="group cursor-pointer bg-white rounded-[24px] hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-300 flex flex-col overflow-hidden relative border border-transparent hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={title || 'Recipe'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-100 transition-colors">
            <span className="text-4xl filter grayscale opacity-50">📷</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Badges over image */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
           <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
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
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-red-500"
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h4 className="translate-y-0 group-hover:-translate-y-1 transition-transform duration-300 text-xl font-bold text-zinc-900 mb-2 leading-tight line-clamp-1">
          {title || 'Untitled Recipe'}
        </h4>
        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-6 font-medium">
          {description || 'Keine Beschreibung verfügbar.'}
        </p>
        
        <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex -space-x-2">
           {/* Mock avatars or just a nice generic indicator */}
            <div className="w-6 h-6 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] text-zinc-400">🍽️</div>
            <span className="pl-3 text-xs font-bold text-zinc-400 self-center uppercase tracking-wider">
              {recipe.servings} Portionen
            </span>
          </div>
          <span className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-colors duration-300">
            <Maximize2 size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
