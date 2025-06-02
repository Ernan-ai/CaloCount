import { create } from 'zustand';
import type { Meal, MealCategory } from '../types';

interface MealsState {
  meals: Meal[];
  categories: MealCategory[];
  selectedMeal: Meal | null;
  loading: boolean;
  setMeals: (meals: Meal[]) => void;
  setCategories: (categories: MealCategory[]) => void;
  setSelectedMeal: (meal: Meal | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMealsStore = create<MealsState>((set) => ({
  meals: [],
  categories: [],
  selectedMeal: null,
  loading: false,
  setMeals: (meals) => set({ meals }),
  setCategories: (categories) => set({ categories }),
  setSelectedMeal: (meal) => set({ selectedMeal: meal }),
  setLoading: (loading) => set({ loading }),
}));
