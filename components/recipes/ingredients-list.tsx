'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

interface Ingredient {
  id: string;
  nameDe?: string | null;
  nameEn?: string | null;
  amount: number;
  unit: string;
  order: number;
}

interface IngredientsListProps {
  ingredients: Ingredient[];
  scale: number;
  locale: string;
}

export default function IngredientsList({ ingredients, scale, locale }: IngredientsListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setChecked(next);
  };

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient) => {
        const name = locale === 'de' ? ingredient.nameDe : ingredient.nameEn;
        const isChecked = checked.has(ingredient.id);

        return (
          <label
            key={ingredient.id}
            className={`flex items-start gap-3 py-2 border-b border-zinc-100 last:border-0 cursor-pointer group select-none transition-all duration-300 ${
              isChecked ? 'opacity-40 grayscale' : 'hover:translate-x-1'
            }`}
          >
             <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
               isChecked ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-transparent group-hover:border-zinc-400'
             }`}>
               <Check
                size={10}
                className={`text-white transition-transform duration-300 ${isChecked ? 'scale-100' : 'scale-0'}`}
                strokeWidth={4}
              />
            </div>
            
            <div className="flex-1 text-sm md:text-base leading-relaxed">
              <span className={`font-semibold text-zinc-900 ${isChecked ? 'line-through decoration-zinc-300' : ''}`}>
                 {(ingredient.amount * scale).toLocaleString(locale, { maximumFractionDigits: 1 })} {ingredient.unit}
              </span> 
              <span className={`font-normal text-zinc-600 ml-1.5 ${isChecked ? 'line-through decoration-zinc-300' : ''}`}>
                 {name || 'Unnamed ingredient'}
              </span>
            </div>
            
            <input
              type="checkbox"
              className="peer sr-only"
              checked={isChecked}
              onChange={() => toggleCheck(ingredient.id)}
            />
          </label>
        );
      })}
    </div>
  );
}
