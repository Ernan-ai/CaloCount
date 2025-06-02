import type { Meal, MealCategory } from '../types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const mealService = {
  async searchMeals(query: string): Promise<Meal[]> {
    const response = await fetch(`${BASE_URL}/search.php?s=${query}`);
    const data = await response.json();
    return data.meals || [];
  },

  async getMealsByCategory(category: string): Promise<Meal[]> {
    const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals || [];
  },

  async getMealById(id: string): Promise<Meal | null> {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals?.[0] || null;
  },

  async getCategories(): Promise<MealCategory[]> {
    const response = await fetch(`${BASE_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
  },

  async getRandomMeals(count: number = 20): Promise<Meal[]> {
    const promises = Array(count).fill(0).map(() => 
      fetch(`${BASE_URL}/random.php`).then(res => res.json())
    );
    const results = await Promise.all(promises);
    return results.map(result => result.meals[0]).filter(Boolean);
  }
};