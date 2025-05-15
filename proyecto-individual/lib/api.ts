import type { Meal, MealSummary, MealDBResponse } from './types';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export async function searchRecipesByName(name: string): Promise<Meal[] | null> {
  if (!name.trim()) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/search.php?s=${name}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data: MealDBResponse<Meal> = await response.json();
    return data.meals;
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    throw error; // Re-throw to be caught by the caller
  }
}

export async function searchRecipesByIngredient(ingredient: string): Promise<MealSummary[] | null> {
  if (!ingredient.trim()) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/filter.php?i=${ingredient}`);
     if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data: MealDBResponse<MealSummary> = await response.json();
    return data.meals;
  } catch (error) {
    console.error('Error searching recipes by ingredient:', error);
    throw error;
  }
}

export async function getRecipeById(id: string): Promise<Meal | null> {
  if (!id.trim()) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data: MealDBResponse<Meal> = await response.json();
    return data.meals ? data.meals[0] : null;
  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    throw error;
  }
}
