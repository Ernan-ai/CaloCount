import { create } from 'zustand';
import type { ConsumedMeal } from '../types';

interface ConsumedMealsState {
  consumedMeals: ConsumedMeal[];
  loading: boolean;
  setConsumedMeals: (meals: ConsumedMeal[]) => void;
  addConsumedMeal: (meal: ConsumedMeal) => void;
  updateConsumedMeal: (meal: ConsumedMeal) => void;
  removeConsumedMeal: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useConsumedMealsStore = create<ConsumedMealsState>((set) => ({
  consumedMeals: [],
  loading: false,
  setConsumedMeals: (meals) => set({ consumedMeals: meals }),
  addConsumedMeal: (meal) => set((state) => ({ 
    consumedMeals: [...state.consumedMeals, meal] 
  })),
  updateConsumedMeal: (meal) => set((state) => ({
    consumedMeals: state.consumedMeals.map(m => m.id === meal.id ? meal : m)
  })),
  removeConsumedMeal: (id) => set((state) => ({
    consumedMeals: state.consumedMeals.filter(m => m.id !== id)
  })),
  setLoading: (loading) => set({ loading }),
}));