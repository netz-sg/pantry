'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  mealType,
  mealTypeLabel,
  meal,
  locale,
  onAdd,
  onRemove,
}: MealSlotProps) {
  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🍽️';
      case 'dinner':
        return '🍝';
      case 'snack':
        return '🍪';
      default:
        return '🍴';
    }
  };

  if (!meal) {
    return (
      <button
        onClick={onAdd}
        className="w-full h-20 border-2 border-dashed border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-zinc-600"
      >
        <Plus size={16} />
        <span className="text-xs font-medium">{mealTypeLabel}</span>
      </button>
    );
  }

  const title = locale === 'de' ? meal.recipe.titleDe : meal.recipe.titleEn;
  const totalTime = (meal.recipe.prepTime || 0) + (meal.recipe.cookTime || 0);

  return (
    <div className="relative group bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500"
      >
        <X size={12} />
      </button>

      {/* Content */}
      <Link href={`/recipes/${meal.recipe.id}`} className="block p-2">
        <div className="flex gap-2">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-lg">
            {getMealIcon()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
              {mealTypeLabel}
            </p>
            <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">
              {title}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
              <span>{meal.servings}x</span>
              {totalTime > 0 && <span>• {totalTime} Min</span>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
