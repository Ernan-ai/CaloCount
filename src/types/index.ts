export interface User {
    id: string;
    email: string;
    displayName: string;
    height?: number;
    weight?: number;
    age?: number;
    gender?: 'male' | 'female';
    targetWeight?: number;
    dailyCalorieGoal?: number;
    followers: string[];
    following: string[];
  }
  
  export interface Meal {
    idMeal: string;
    strMeal: string;
    strCategory: string;
    strArea: string;
    strInstructions: string;
    strMealThumb: string;
    strYoutube?: string;
    [key: string]: string | undefined;
  }
  
  export interface ConsumedMeal {
    id: string;
    userId: string;
    mealId: string;
    mealName: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    calories: number;
    date: string;
    createdAt: string;
  }
  
  export interface MealCategory {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
  }