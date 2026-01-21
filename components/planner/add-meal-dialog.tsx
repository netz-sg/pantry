'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addMealPlan } from '@/app/actions/planner';

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
  date: string;
  mealType: string;
  recipes: Array<{
    id: string;
    titleDe: string | null;
    titleEn: string | null;
    servings: number | null;
    imageUrl: string | null;
  }>;
}

export default function AddMealDialog({
  open,
  onOpenChange,
  locale,
  date,
  mealType,
  recipes,
}: AddMealDialogProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [servings, setServings] = useState<number>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    const formData = new FormData();
    formData.append('recipeId', selectedRecipeId);
    formData.append('date', date);
    formData.append('mealType', mealType);
    formData.append('servings', servings.toString());

    await addMealPlan(formData);
    onOpenChange(false);
    setSelectedRecipeId('');
    setServings(1);
  };

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rezept hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipe">Rezept *</Label>
            <select
              id="recipe"
              value={selectedRecipeId}
              onChange={(e) => {
                setSelectedRecipeId(e.target.value);
                const recipe = recipes.find((r) => r.id === e.target.value);
                if (recipe) {
                  setServings(recipe.servings || 1);
                }
              }}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
              required
            >
              <option value="">Wähle ein Rezept</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {locale === 'de' ? recipe.titleDe : recipe.titleEn}
                </option>
              ))}
            </select>
          </div>

          {selectedRecipe && (
            <div className="space-y-2">
              <Label htmlFor="servings">Portionen</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                >
                  -
                </Button>
                <Input
                  id="servings"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  min="1"
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setServings(servings + 1)}
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Original: {selectedRecipe.servings || 1} Portion(en)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={!selectedRecipeId}>
              Hinzufügen
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
