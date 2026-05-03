import api from "@/lib/api";

export interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  recipeId: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  recipe: {
    id: string;
    title: string;
    cookingTimeMinutes: number;
    difficulty: string;
    images?: { url: string }[];
  };
}

export interface MealPlan {
  id: string;
  name: string;
  weekStart: string;
  userId: string;
  createdAt: string;
  entries: MealPlanEntry[];
  _count?: {
    entries: number;
  };
}

export const mealPlanService = {
  async getMealPlans() {
    const response = await api.get('/meal-plans');
    return response.data.data as MealPlan[];
  },

  async getMealPlan(id: string) {
    const response = await api.get(`/meal-plans/${id}`);
    return response.data.data as MealPlan;
  },

  async createMealPlan(name: string, weekStart: string) {
    const response = await api.post('/meal-plans', { name, weekStart });
    return response.data.data as MealPlan;
  },

  async updateMealPlan(id: string, name?: string, weekStart?: string) {
    const response = await api.put(`/meal-plans/${id}`, { name, weekStart });
    return response.data.data as MealPlan;
  },

  async deleteMealPlan(id: string) {
    const response = await api.delete(`/meal-plans/${id}`);
    return response.data.data;
  },

  async addEntry(mealPlanId: string, recipeId: string, date: string, mealType: string): Promise<MealPlanEntry> {
    const response = await api.post(`/meal-plans/${mealPlanId}/entries`, {
      recipeId,
      date,
      mealType
    });
    return response.data.data;
  },

  async bulkUpdateEntries(mealPlanId: string, entries: { recipeId: string, date: string, mealType: string }[]): Promise<MealPlan> {
    const response = await api.put(`/meal-plans/${mealPlanId}/entries/bulk`, entries);
    return response.data.data;
  },

  async removeEntry(mealPlanId: string, entryId: string): Promise<void> {
    const response = await api.delete(`/meal-plans/${mealPlanId}/entries/${entryId}`);
    return response.data.data;
  },

  async generateShoppingList(mealPlanId: string) {
    const response = await api.post(`/meal-plans/${mealPlanId}/shopping-list`);
    return response.data.data;
  }
};
