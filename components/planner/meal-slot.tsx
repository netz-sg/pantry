'use client';

import { Plus, X, Clock, Users, ChevronRight, ChefHat } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MealSlotProps {
  mealType: string;
  mealTypeLabel: string;
  meal?: {
    id: string;
    servings: number;
    recipe: {
      id: string;
      titleDe: string | null;
      titleEn: string | null;
      imageUrl: string | null;
      prepTime: number | null;
      cookTime: number | null;
    };
  };
  locale: string;
  onAdd: () => void;
  onRemove: () => void;
}

export default function MealSlot({
  mealType, // unused in new design but kept for potential use
  mealTypeLabel,
  meal,
  locale,
  onAdd,
  onRemove,
}: MealSlotProps) {
  
  // Empty State - More interactive button style
  if (!meal) {
    return (
      <button
        onClick={onAdd}
        className="group relative w-full h-[72px] rounded-2xl border border-dashed border-white/10 hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300 flex items-center px-4 gap-4 overflow-hidden"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-zinc-500 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors shadow-sm">
            <Plus size={18} />
        </div>
        <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                {mealTypeLabel} plan
            </span>
             <span className="text-[10px] text-zinc-500 hidden group-hover:inline-block animate-in fade-in slide-in-from-left-1">
                Klicken zum Hinzufügen
             </span>
        </div>
      </button>
    );
  }

  const title = locale === 'de' ? meal.recipe.titleDe : meal.recipe.titleEn;
  const totalTime = (meal.recipe.prepTime || 0) + (meal.recipe.cookTime || 0);

  return (
    <div className="relative group w-full bg-zinc-900 border border-white/5 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden rounded-2xl shadow-sm">
      {/* Remove Button - Subtle & Elegant */}
      <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
        }}
        className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-zinc-900/80 backdrop-blur-md rounded-full shadow-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
        title="Entfernen"
      >
        <X size={14} />
      </button>

      <Link href={`/recipes/${meal.recipe.id}`} className="flex items-center p-3 gap-4 h-[88px]">
        {/* Image - Square thumbnail */}
         <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden shadow-inner bg-zinc-800 border border-white/5">
            {meal.recipe.imageUrl ? (
                 <Image 
                    src={meal.recipe.imageUrl} 
                    alt={title || 'Rezept'} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                 />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-800">
                    <ChefHat size={20} />
                </div>
            )}
         </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    {mealTypeLabel}
                 </span>
            </div>
            
            <h3 className="font-bold text-sm text-zinc-200 truncate pr-6 group-hover:text-blue-400 transition-colors">
                {title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                <div className="flex items-center gap-1.5">
                   <Users size={12} className="text-zinc-600" />
                   <span>{meal.servings} P.</span>
                </div>
                {totalTime > 0 && (
                    <div className="flex items-center gap-1.5">
                       <Clock size={12} className="text-zinc-600" />
                       <span>{totalTime} Min</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* Arrow (Visual cue) */}
        <div className="text-zinc-600 group-hover:text-blue-400 transition-colors pr-1">
            <ChevronRight size={16} />
        </div>
      </Link>
    </div>
  );
}
