"use client";

import React, { useState, useEffect, useCallback, DragEvent } from 'react';
import { format } from 'date-fns-tz';
import { startOfWeek, addDays } from 'date-fns';
import { mealPlanService, MealPlan, MealPlanEntry } from '../../services/mealPlanService';
import { recipeService } from '../../services/recipeService';
import { Recipe } from '../../store/slices/recipeSlice';

import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Save, X, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

// ─── Recipe Card (draggable from sidebar) ─────────────────────────────────────

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(recipe));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all border mb-3
        bg-white border-zinc-100 hover:border-emerald-200 shadow-sm hover:shadow-md
        active:opacity-50 active:scale-95 select-none"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-zinc-300 flex-none" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-emerald-900 truncate">{recipe.title}</div>
          <div className="text-xs text-zinc-500 mt-1 flex justify-between font-medium">
            <span>{recipe.cookingTimeMinutes}m</span>
            <span className="uppercase tracking-widest">{recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Droppable Slot (each cell in the 7×4 grid) ──────────────────────────────

function MealSlot({
  date,
  mealType,
  entry,
  onDrop,
  onRemove,
}: {
  date: Date;
  mealType: MealType;
  entry?: MealPlanEntry;
  onDrop: (recipe: Recipe, date: Date, mealType: MealType) => void;
  onRemove: (entryId: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);

    try {
      const recipeJson = e.dataTransfer.getData('application/json');
      if (!recipeJson) return;
      const recipe = JSON.parse(recipeJson) as Recipe;
      onDrop(recipe, date, mealType);
    } catch (err) {
      console.error('Drop parse error:', err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[100px] p-2 rounded-2xl border-2 transition-all relative group
        ${isOver
          ? 'bg-emerald-50 border-emerald-500 scale-[1.02] shadow-lg shadow-emerald-100/50'
          : 'bg-zinc-50/50 border-dashed border-zinc-200 hover:border-emerald-200'
        }
      `}
    >
      {entry ? (
        <div className="bg-white rounded-xl p-3 border border-zinc-100 shadow-sm h-full relative group/card flex flex-col justify-center">
          <div
            className="text-[11px] font-bold text-emerald-900 line-clamp-3 pr-5 leading-tight"
            title={entry.recipe.title}
          >
            {entry.recipe.title}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(entry.id);
            }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className={`flex items-center justify-center h-full text-[10px] font-bold uppercase tracking-widest
          ${isOver ? 'text-emerald-600 opacity-100' : 'text-zinc-400 opacity-40'}
        `}>
          {isOver ? '↓ Drop here' : 'Drop Here'}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MealPlannerPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  // Local entries drives the UI; changes saved on "Save Plan"
  const [localEntries, setLocalEntries] = useState<MealPlanEntry[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calendar
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const recipesRes = await recipeService.getRecipes({ limit: 50 });
      setRecipes(recipesRes.data);

      const plans = await mealPlanService.getMealPlans();
      let planId: string;
      if (plans.length > 0) {
        planId = plans[0].id;
      } else {
        const newPlan = await mealPlanService.createMealPlan(
          `Week of ${format(weekStart, 'MMM d, yyyy')}`,
          weekStart.toISOString()
        );
        planId = newPlan.id;
      }

      // Fetch the FULL plan with entries + recipe data (list endpoint only returns _count)
      const activePlan = await mealPlanService.getMealPlan(planId);
      setMealPlan(activePlan);
      setLocalEntries(activePlan.entries || []);
    } catch (error) {
      console.error('Failed to fetch meal plan data', error);
      toast.error('Failed to load meal planner');
    } finally {
      setLoading(false);
    }
  };

  // ── Drop Handler: add/replace recipe in a slot ──

  const handleSlotDrop = useCallback(
    (recipe: Recipe, date: Date, mealType: MealType) => {
      if (!mealPlan) return;

      const dropDateKey = date.toISOString().split('T')[0];

      setLocalEntries((prev) => {
        // Remove any existing entry in this exact slot (day + mealType)
        const filtered = prev.filter(
          (e) =>
            !(
              e.mealType === mealType &&
              new Date(e.date).toISOString().split('T')[0] === dropDateKey
            )
        );

        const newEntry: MealPlanEntry = {
          id: `temp-${Date.now()}`,
          mealPlanId: mealPlan.id,
          recipeId: recipe.id,
          date: date.toISOString(),
          mealType: mealType,
          recipe: recipe,
        };

        return [...filtered, newEntry];
      });

      setHasUnsavedChanges(true);
      toast.success(`Added "${recipe.title}" to ${mealType}`);
    },
    [mealPlan]
  );

  const handleRemoveEntry = useCallback((entryId: string) => {
    setLocalEntries((prev) => prev.filter((e) => e.id !== entryId));
    setHasUnsavedChanges(true);
  }, []);

  // ── Save ──

  const handleSavePlan = async () => {
    if (!mealPlan) return;
    try {
      setIsSaving(true);
      const entriesToSave = localEntries.map((e) => ({
        recipeId: e.recipeId,
        date: e.date,
        mealType: e.mealType,
      }));
      console.log({ entriesToSave, mealPlan });

      const updatedPlan = await mealPlanService.bulkUpdateEntries(mealPlan.id, entriesToSave);
      setMealPlan(updatedPlan);
      setLocalEntries(updatedPlan.entries || []);
      setHasUnsavedChanges(false);
      toast.success('Meal plan saved!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save meal plan');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Generate Shopping List ──

  const handleGenerateList = async () => {
    if (!mealPlan) return;
    if (hasUnsavedChanges) {
      toast.error('Please save your plan first.');
      return;
    }
    try {
      setIsGenerating(true);
      const list = await mealPlanService.generateShoppingList(mealPlan.id);
      toast.success('Shopping list generated!');
      router.push(`/shopping-list/${list.id}`);
    } catch (error) {
      toast.error('Failed to generate shopping list');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Helper ──

  const getEntry = (day: Date, type: string) => {
    const dayKey = day.toISOString().split('T')[0];
    return localEntries.find(
      (e) =>
        e.mealType === type &&
        new Date(e.date).toISOString().split('T')[0] === dayKey
    );
  };

  // ── Loading ──

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />

      <main className="md:ml-64 pt-24 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black text-emerald-900 tracking-tight">Meal Planner</h2>
            <p className="text-sm font-medium text-zinc-500 mt-2">{mealPlan?.name}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleSavePlan}
              disabled={isSaving || !hasUnsavedChanges}
              variant={hasUnsavedChanges ? 'default' : 'outline'}
              className={`rounded-xl h-12 px-6 font-bold shadow-sm transition-all ${hasUnsavedChanges
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-none'
                : 'border-zinc-200 text-zinc-400 bg-white'
                }`}
            >
              {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              {hasUnsavedChanges ? 'Save Plan*' : 'Plan Saved'}
            </Button>

            <Button
              onClick={handleGenerateList}
              disabled={isGenerating || localEntries.length === 0 || hasUnsavedChanges}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              Generate Shopping List
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Recipe Library (drag source) ── */}
          <aside className="lg:col-span-3 space-y-4">
            <h3 className="text-xl font-bold text-emerald-900">
              Your Recipes
              <span className="text-xs text-zinc-400 ml-2 font-medium">drag to assign →</span>
            </h3>
            <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm min-h-[400px] lg:max-h-[800px] overflow-y-auto">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
              {recipes.length === 0 && (
                <div className="text-center text-zinc-400 mt-10 text-sm font-bold">
                  No recipes found. Create some first!
                </div>
              )}
            </div>
          </aside>

          {/* ── Calendar Grid (drop targets) ── */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 overflow-x-auto">
              <div className="min-w-[900px]">

                {/* Day headers */}
                <div className="grid grid-cols-8 gap-4 mb-4">
                  <div className="col-span-1" />
                  {days.map((day, idx) => (
                    <div key={idx} className="col-span-1 text-center bg-zinc-50/50 py-3 rounded-2xl border border-zinc-100">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-xl font-black text-emerald-900">{format(day, 'd')}</div>
                    </div>
                  ))}
                </div>

                {/* Meal type rows */}
                <div className="flex flex-col gap-4">
                  {mealTypes.map((type) => (
                    <div key={type} className="grid grid-cols-8 gap-4">
                      {/* Row label */}
                      <div className="col-span-1 flex items-center justify-end pr-4">
                        <span
                          className="text-xs font-black uppercase tracking-widest text-emerald-700/70 -rotate-180"
                          style={{ writingMode: 'vertical-rl' }}
                        >
                          {type}
                        </span>
                      </div>

                      {/* 7 droppable slots */}
                      {days.map((day, dayIdx) => {
                        const entry = getEntry(day, type);
                        return (
                          <MealSlot
                            key={`${dayIdx}-${type}`}
                            date={day}
                            mealType={type}
                            entry={entry}
                            onDrop={handleSlotDrop}
                            onRemove={handleRemoveEntry}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
