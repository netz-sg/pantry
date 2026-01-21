'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getWeeklyPlan,
  removeMealPlan,
  generateWeeklyShoppingList,
} from '@/app/actions/planner';
import { getRecipes } from '@/app/actions/recipes';
import MealSlot from '@/components/planner/meal-slot';
import AddMealDialog from '@/components/planner/add-meal-dialog';

export const dynamic = 'force-dynamic';

interface MealPlan {
  id: string;
  date: string;
  mealType: string;
  servings: number;
  recipe: {
    id: string;
    titleDe: string | null;
    titleEn: string | null;
    imageUrl: string | null;
    prepTime: number | null;
    cookTime: number | null;
  };
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
};

export default function PlannerPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: string } | null>(null);
  const locale = 'de';

  useEffect(() => {
    loadWeeklyPlan();
    loadRecipes();
  }, [currentWeekStart, locale]);

  const loadWeeklyPlan = async () => {
    const startDate = formatDate(currentWeekStart);
    const plans = await getWeeklyPlan(startDate);
    setMealPlans(plans as any);
  };

  const loadRecipes = async () => {
    const data = await getRecipes();
    setRecipes(data);
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleJumpToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const handleAddMeal = (date: string, mealType: string) => {
    setSelectedSlot({ date, mealType });
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedSlot(null), 300); // Wait for animation
      loadWeeklyPlan();
    }
  };

  const handleRemoveMeal = async (planId: string) => {
    // Optimistic update could be added here
    await removeMealPlan(planId);
    loadWeeklyPlan();
  };

  const handleGenerateShoppingList = async () => {
    const count = await generateWeeklyShoppingList(formatDate(currentWeekStart));
    // Could use toast here instead of alert
    alert(`${count} Artikel zur Einkaufsliste hinzugefügt!`);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getMealForSlot = (date: Date, mealType: string) => {
    const dateStr = formatDate(date);
    return mealPlans.find((plan) => plan.date === dateStr && plan.mealType === mealType);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/60">
        <div className="space-y-1">
           <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900">Wochenplaner</h1>
           <div className="flex items-center gap-2 text-zinc-500 font-medium">
                <CalendarIcon size={18} />
                <span>{formatWeekRange(currentWeekStart)}</span>
           </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="flex items-center bg-white rounded-xl shadow-sm border border-zinc-200 p-1">
                <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="h-9 w-9 hover:bg-zinc-100 rounded-lg text-zinc-500">
                    <ChevronLeft size={20} />
                </Button>
                <div className="w-px h-5 bg-zinc-200 mx-1" />
                <Button onClick={handleJumpToToday} variant="ghost" className="h-9 px-3 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg">
                    Heute
                </Button>
                <div className="w-px h-5 bg-zinc-200 mx-1" />
                <Button onClick={handleNextWeek} variant="ghost" size="icon" className="h-9 w-9 hover:bg-zinc-100 rounded-lg text-zinc-500">
                    <ChevronRight size={20} />
                </Button>
             </div>
             
             <Button 
                onClick={handleGenerateShoppingList} 
                className="h-11 px-5 rounded-xl gap-2 font-semibold shadow-lg shadow-blue-500/20 bg-zinc-900 hover:bg-zinc-800 text-white"
             >
                <ShoppingBag size={18} />
                <span className="hidden md:inline">Einkaufsliste</span>
            </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {weekDays.map((date) => {
            const isCurrentDay = isToday(date);
            return (
                <div 
                    key={date.toISOString()} 
                    className={`
                        flex flex-col gap-4 p-5 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group/day
                        ${isCurrentDay 
                            ? 'bg-gradient-to-br from-blue-50/50 to-white border-blue-200/60 shadow-xl shadow-blue-500/5' 
                            : 'bg-white border-zinc-100/80 shadow-sm hover:shadow-xl hover:shadow-zinc-900/5 hover:border-zinc-200/60'
                        }
                    `}
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-zinc-50/50 rounded-bl-[4rem] -z-10 opacity-0 group-hover/day:opacity-100 transition-opacity" />

                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                        <div className="flex flex-col">
                            <span className={`text-xs font-bold uppercase tracking-[0.2em] mb-0.5 ${isCurrentDay ? 'text-blue-600' : 'text-zinc-400'}`}>
                                {date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { weekday: 'long' })}
                            </span>
                            <span className="text-sm text-zinc-500 font-medium">
                                {date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', { month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-black transition-all shadow-sm ${
                            isCurrentDay 
                            ? 'bg-blue-600 text-white shadow-blue-600/20' 
                            : 'bg-zinc-50 text-zinc-900 group-hover/day:bg-zinc-100'
                        }`}>
                            {date.getDate()}
                        </div>
                    </div>

                    {/* Meal Slots */}
                    <div className="flex-1 flex flex-col gap-3 min-h-[200px]">
                        {MEAL_TYPES.map((mealType) => {
                            const meal = getMealForSlot(date, mealType);
                            return (
                                <MealSlot
                                    key={mealType}
                                    mealType={mealType}
                                    mealTypeLabel={MEAL_TYPE_LABELS[mealType]}
                                    meal={meal}
                                    locale={locale}
                                    onAdd={() => handleAddMeal(formatDate(date), mealType)}
                                    onRemove={() => meal && handleRemoveMeal(meal.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Add Meal Dialog */}
      {selectedSlot && (
        <AddMealDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          locale={locale}
          date={selectedSlot.date}
          mealType={selectedSlot.mealType}
          recipes={recipes}
        />
      )}
    </div>
  );
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date: Date): string {
  // Use local time instead of ISO (UTC) to avoid timezone shifts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${startDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
