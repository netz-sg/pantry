'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getWeeklyPlan,
  addMealPlan,
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

  const handleAddMeal = (date: string, mealType: string) => {
    setSelectedSlot({ date, mealType });
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedSlot(null);
      loadWeeklyPlan();
    }
  };

  const handleRemoveMeal = async (planId: string) => {
    await removeMealPlan(planId);
    loadWeeklyPlan();
  };

  const handleGenerateShoppingList = async () => {
    const count = await generateWeeklyShoppingList(formatDate(currentWeekStart));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/50">
        <div>
           <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Wochenplaner</h1>
          <p className="text-zinc-500 font-medium">
             Planung für: <span className="text-black">{formatWeekRange(currentWeekStart)}</span>
          </p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
           <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="hover:bg-zinc-100 rounded-lg">
            <ChevronLeft size={20} />
          </Button>
          <div className="h-full w-px bg-zinc-100" />
           <Button variant="ghost" onClick={handleGenerateShoppingList} className="gap-2 font-semibold text-zinc-600 hover:text-black">
            <ShoppingBag size={18} />
             <span className="hidden md:inline">Einkaufsliste</span>
          </Button>
           <div className="h-full w-px bg-zinc-100" />
          <Button onClick={handleNextWeek} variant="ghost" size="icon" className="hover:bg-zinc-100 rounded-lg">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((date) => (
          <div key={date.toISOString()} className={`space-y-4 rounded-2xl p-4 min-h-[400px] border transition-all ${isToday(date) ? 'bg-white shadow-lg shadow-black/5 border-black/5 ring-1 ring-black/5' : 'bg-white/50 border-transparent hover:bg-white hover:shadow-md'}`}>
            {/* Day Header */}
            <div className="text-center pb-3 border-b border-zinc-100">
              <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isToday(date) ? 'text-blue-600' : 'text-zinc-400'}`}>
                {date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
                  weekday: 'short',
                })}
              </div>
              <div
                className={`text-2xl font-black ${
                  isToday(date) ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-700'
                }`}
              >
                {date.getDate()}
              </div>
            </div>

            {/* Meal Slots */}
            <div className="space-y-2">
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
        ))}
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
  return date.toISOString().split('T')[0];
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
