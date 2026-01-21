'use client';

import { Minus, Plus } from 'lucide-react';

interface IngredientScalerProps {
  scale: number;
  onScaleChange: (scale: number) => void;
}

export default function IngredientScaler({ scale, onScaleChange }: IngredientScalerProps) {
  const handleDecrease = () => {
    onScaleChange(Math.max(0.5, scale - 0.5));
  };

  const handleIncrease = () => {
    onScaleChange(scale + 0.5);
  };

  return (
    <div className="flex items-center bg-zinc-50 rounded-lg border border-zinc-200 p-0.5">
      <button
        onClick={handleDecrease}
        className="w-7 h-7 flex items-center justify-center hover:bg-white rounded shadow-sm text-zinc-500 transition-colors"
        aria-label="Decrease servings"
      >
        <Minus size={12} />
      </button>
      <span className="w-8 text-center text-xs font-bold tabular-nums">{scale}x</span>
      <button
        onClick={handleIncrease}
        className="w-7 h-7 flex items-center justify-center hover:bg-white rounded shadow-sm text-zinc-500 transition-colors"
        aria-label="Increase servings"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
