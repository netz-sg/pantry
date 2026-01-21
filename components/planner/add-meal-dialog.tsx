'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addMealPlan } from '@/app/actions/planner';
import { Search, Loader2, Minus, Plus, ChefHat } from 'lucide-react';
import Image from 'next/image';

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
  const [servings, setServings] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const title = (locale === 'de' ? recipe.titleDe : recipe.titleEn) || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [recipes, searchQuery, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    setIsSubmitting(true);
    try {
        const formData = new FormData();
        formData.append('recipeId', selectedRecipeId);
        formData.append('date', date);
        formData.append('mealType', mealType);
        formData.append('servings', servings.toString());

        await addMealPlan(formData);
        onOpenChange(false);
        // Reset state
        setSelectedRecipeId('');
        setSearchQuery('');
        setServings(2);
    } finally {
        setIsSubmitting(false);
    }
  };

  const activeRecipe = recipes.find(r => r.id === selectedRecipeId);

  // If a recipe is selected, set default servings if not already set by user interaction
  // Actually simpler to just default to recipe servings when selecting
  const handleSelectRecipe = (recipe: typeof recipes[0]) => {
      setSelectedRecipeId(recipe.id);
      setServings(recipe.servings || 2);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
        if (!isSubmitting) onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden bg-zinc-900 border-white/10 text-white">
        <DialogHeader className="px-6 py-4 border-b border-white/5 flex-shrink-0">
          <DialogTitle className="text-white">Gericht auswählen</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar: Search & List */}
            <div className={`flex flex-col w-full ${activeRecipe ? 'hidden md:flex md:w-1/2 border-r border-white/5' : 'w-full'} transition-all`}>
                 <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <Input 
                            placeholder="Rezept suchen..." 
                            className="pl-9 bg-zinc-950 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredRecipes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                             <ChefHat size={32} className="mb-2 opacity-50"/>
                             <p className="text-sm">Keine Rezepte gefunden</p>
                        </div>
                    ) : (
                        filteredRecipes.map((recipe) => {
                             const title = locale === 'de' ? recipe.titleDe : recipe.titleEn;
                             const isSelected = selectedRecipeId === recipe.id;
                             return (
                                 <div 
                                    key={recipe.id}
                                    onClick={() => handleSelectRecipe(recipe)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                        isSelected ? 'bg-zinc-800 ring-1 ring-white/10' : 'hover:bg-zinc-800/50'
                                    }`}
                                 >
                                    <div className="w-12 h-12 rounded-md bg-zinc-800 overflow-hidden flex-shrink-0 relative">
                                        {recipe.imageUrl ? (
                                            <Image src={recipe.imageUrl} alt={title || ''} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-lg">🥘</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                            {title}
                                        </p>
                                    </div>
                                 </div>
                             )
                        })
                    )}
                 </div>
            </div>

             {/* Right Side: Details & Configuration */}
             {activeRecipe && (
                 <div className="flex flex-col w-full md:w-1/2 animate-in slide-in-from-right-10 duration-200 bg-zinc-900">
                     <div className="flex-1 p-6 overflow-y-auto">
                        <div className="aspect-video w-full rounded-xl bg-zinc-800 overflow-hidden relative mb-4 shadow-sm border border-white/5">
                             {activeRecipe.imageUrl ? (
                                 <Image 
                                    src={activeRecipe.imageUrl} 
                                    alt="Preview" 
                                    fill 
                                    className="object-cover"
                                 />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-600">
                                     <ChefHat size={48} />
                                 </div>
                             )}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-6 text-white">
                            {locale === 'de' ? activeRecipe.titleDe : activeRecipe.titleEn}
                        </h3>

                        <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-white/5">
                            <Label className="text-zinc-400 uppercase tracking-wider text-xs font-bold">Portionen anpassen</Label>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-black tabular-nums text-white">{servings}</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-full border-white/10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                    >
                                        <Minus size={16} />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-full border-white/10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
                                        onClick={() => setServings(servings + 1)}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 text-right">
                                Originalrezept: {activeRecipe.servings || 2} P.
                            </p>
                        </div>
                     </div>

                     <div className="p-4 border-t border-white/5 bg-zinc-900">
                         <Button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting} 
                            className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-zinc-200"
                         >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : null}
                            Zum Plan hinzufügen
                         </Button>
                     </div>
                 </div>
             )}
              {/* Empty State for Right Side on large screens */}
             {!activeRecipe && (
                 <div className="hidden md:flex w-1/2 flex-col items-center justify-center text-zinc-500 p-8 text-center bg-zinc-950/50">
                     <ChefHat size={48} className="mb-4 opacity-20" />
                     <p>Wähle ein Gericht aus der Liste</p>
                 </div>
             )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
