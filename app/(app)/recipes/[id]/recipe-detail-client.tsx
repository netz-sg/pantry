'use client';

import { ArrowLeft, Heart, Printer, Share2, Clock, Flame, Users, ShoppingBag, Trash2, Edit, Check, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import IngredientScaler from '@/components/recipes/ingredient-scaler';
import IngredientsList from '@/components/recipes/ingredients-list';
import { toggleFavorite, deleteRecipe } from '@/app/actions/recipes';

interface RecipeDetailClientProps {
  recipe: any;
  locale: string;
}

export default function RecipeDetailClient({ recipe, locale }: RecipeDetailClientProps) {
  const [scale, setScale] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const title = locale === 'de' ? recipe.titleDe : recipe.titleEn;
  const description = locale === 'de' ? recipe.descriptionDe : recipe.descriptionEn;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const isFavorite = recipe.favorites && recipe.favorites.length > 0;

  const handleFavoriteClick = () => {
    startTransition(() => {
      toggleFavorite(recipe.id);
    });
  };

  const handleDelete = () => {
    if (confirm('Möchtest du dieses Rezept wirklich löschen?')) {
      startTransition(() => {
        deleteRecipe(recipe.id);
      });
    }
  };

  const toggleStep = (stepNumber: number) => {
    const next = new Set(completedSteps);
    if (next.has(stepNumber)) {
        next.delete(stepNumber);
    } else {
        next.add(stepNumber);
    }
    setCompletedSteps(next);
  };

  const progress = recipe.instructions?.length ? (completedSteps.size / recipe.instructions.length) * 100 : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-transparent min-h-screen">
      {/* Fullscreen Hero Section */}
      <div className="relative w-[100vw] ml-[calc(50%-50vw)] -mt-36 h-[85vh] min-h-[700px] mb-8 overflow-hidden bg-[#09090b]">
        {/* Background Image */}
        {recipe.imageUrl ? (
          <div className="absolute inset-0">
             <img
              src={recipe.imageUrl}
              className="w-full h-full object-cover scale-105 animate-in zoom-in-50 duration-[2s] opacity-70"
              alt={title || 'Recipe'}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b] via-[#09090b]/40 to-transparent opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-100" />
          </div>
        ) : (
          <div className="w-full h-full bg-[#09090b] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#09090b] to-[#09090b] opacity-50" />
            <div className="text-zinc-800 text-9xl animate-pulse">🍽️</div>
          </div>
        )}

        {/* ... (Actions same as before but ensure consistency) ... */}
        {/* Floating Action Bar */}
        <div className="absolute top-28 right-6 md:right-12 z-50 flex gap-3">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300"
            title="Bearbeiten"
          >
            <Edit size={20} strokeWidth={2} />
          </Link>
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            className={`w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300 ${
                isFavorite 
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                  : 'bg-black/40 border-white/10 text-white hover:bg-white hover:text-red-500'
            }`}
            title="Favorisieren"
          >
            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
          </button>
          {/* ... other buttons ... */}
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto w-full px-6 md:px-12">
            
            <div className="flex flex-wrap gap-2 mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
              <span className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-bold tracking-wide">
                {recipe.category || 'Rezept'}
              </span>
              {recipe.tags &&
                recipe.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95] mb-6 drop-shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-1000">
              {title || 'Untitled Recipe'}
            </h1>

            <div className="flex flex-col md:flex-row md:items-end gap-12 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
              <p className="text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-2xl">
                {description || 'Keine Beschreibung verfügbar.'}
              </p>

              <div className="flex items-center gap-8 md:ml-auto border-t border-white/10 pt-6 md:pt-0 md:border-t-0">
                <div className="flex items-center gap-3">
                  <Clock className="text-zinc-500" size={24} />
                  <div>
                    <span className="block text-white font-bold text-xl leading-none">{totalTime}</span>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">Min</span>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-white/10" />
                
                <div className="flex items-center gap-3">
                   <Flame className="text-zinc-500" size={24} />
                   <div>
                    <span className="block text-white font-bold text-xl leading-none">{recipe.calories || '-'}</span>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">Kcal</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/10" />

                <div className="flex items-center gap-3">
                   <Users className="text-zinc-500" size={24} />
                   <div>
                    <span className="block text-white font-bold text-xl leading-none">{recipe.servings * scale}</span>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">Pers.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Ingredients Column - Left Side */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-4">
            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-sm relative overflow-hidden">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h2 className="font-bold text-lg text-white flex items-center gap-2">
                    <ShoppingBag size={20} className="text-zinc-500"/>
                    Zutaten
                  </h2>
                  <IngredientScaler scale={scale} onScaleChange={setScale} />
                </div>
                
                <hr className="border-dashed border-white/10 mb-4" />

                <div className="relative z-10 text-zinc-300">
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <IngredientsList ingredients={recipe.ingredients} scale={scale} locale={locale} />
                  ) : (
                     <div className="py-8 text-center text-zinc-500 text-sm">
                        Keine Zutaten erforderlich
                     </div>
                  )}
                </div>

                {/* Compact Action */}
                 <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                    <button className="text-xs font-semibold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                        <ShoppingBag size={14} /> 
                        Alle zur Einkaufsliste hinzufügen
                    </button>
                 </div>
            </div>
          </div>

          {/* Instructions Column - Right Side */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex items-center justify-between mb-2">
               <div>
                  <h2 className="font-bold text-2xl text-white tracking-tight">Zubereitung</h2>
                  <p className="text-zinc-500 text-sm font-medium mt-1">
                      {completedSteps.size} von {recipe.instructions?.length || 0} Schritten erledigt
                  </p>
               </div>
               
                {/* Progress Circle Visual */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                        <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-green-500 transition-all duration-500 ease-out" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <span className="text-[10px] font-bold text-white absolute">{Math.round(progress)}%</span>
                </div>
            </div>
            
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <div className="space-y-3">
                {recipe.instructions.map((instruction: any, index: number) => {
                  const stepNum = instruction.stepNumber;
                  const isCompleted = completedSteps.has(stepNum);
                  const text = locale === 'de' ? instruction.instructionDe : instruction.instructionEn;
                  
                  return (
                    <div 
                      key={instruction.id} 
                      onClick={() => toggleStep(stepNum)}
                      className={`
                        relative group p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-5 md:gap-6 items-start
                        ${isCompleted 
                            ? 'bg-zinc-900/30 border-white/5 opacity-50' 
                            : 'bg-zinc-900/50 backdrop-blur-sm border-white/5 shadow-sm hover:border-white/10 hover:bg-zinc-800/50'
                        }
                      `}
                    >
                      {/* Checkbox Visual */}
                      <div className={`
                          flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-300
                          ${isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-transparent border-zinc-700 text-transparent group-hover:border-zinc-500'
                          }
                      `}>
                         <Check size={16} strokeWidth={3} className={`transition-transform duration-300 ${isCompleted ? 'scale-100' : 'scale-75'}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className={`font-bold text-sm mb-1 uppercase tracking-wider ${isCompleted ? 'text-zinc-600' : 'text-zinc-300'}`}>
                           Schritt {stepNum}
                        </h3>
                        <p className={`text-zinc-100 leading-relaxed text-base transition-colors ${isCompleted ? 'text-zinc-500 line-through decoration-zinc-600' : ''}`}>
                          {text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
                // Empty state...
              <div className="flex flex-col items-center justify-center py-12 bg-zinc-900/50 rounded-2xl border border-dashed border-white/10 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Clock size={20} className="text-zinc-500" />
                </div>
                <p className="text-zinc-400 font-medium">Keine Anleitung</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
