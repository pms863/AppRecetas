'use client';

import { useState, useEffect, FormEvent, useCallback, Suspense } from 'react';
import { Header } from '../components/layout/header';
import { RecipeList } from '../components/recipe/recipe-list';
import { RecipeListWrapper } from '../components/recipe/recipe-list-wrapper';
import AIAssistant from '../components/ai/AIAssistant';
import { searchRecipesByName, searchRecipesByIngredient, getRecipeById } from '../lib/api';
import type { Meal, MealSummary } from '../lib/types';
import { useToast } from "../hooks/use-toast";

export default function HomePage() {
  const { toast } = useToast();

  // State for recipe search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<'name' | 'ingredient'>('name');
  const [recipes, setRecipes] = useState<(Meal | MealSummary)[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  // Elimina todo el state de AI
  // const [aiIngredients, setAiIngredients] = useState<string>('');
  // const [aiVariations, setAiVariations] = useState<string[]>([]);
  // const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  // const [aiError, setAiError] = useState<string | null>(null);

  const fetchInitialRecipes = useCallback(async () => {
    setIsLoadingRecipes(true);
    setRecipeError(null);
    try {
      const data = await searchRecipesByName('Beef');
      if (data && data.length > 0) {
        setRecipes(data);
      } else {
        setRecipes([]);
        setRecipeError('No recipes found for "Beef". Try another search!');
      }
    } catch (error) {
      console.error('Failed to fetch initial recipes:', error);
      setRecipeError('Failed to fetch recipes. Please check your connection and try again.');
      setRecipes([]);
      toast({
        title: "Error",
        description: "Could not fetch initial recipes.",
        variant: "destructive",
      });
    }
    setIsLoadingRecipes(false);
  }, [toast]);

  useEffect(() => {
    fetchInitialRecipes();
  }, [fetchInitialRecipes]);

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      toast({ title: "Search term empty", description: "Please enter something to search.", variant: "destructive" });
      return;
    }

    setIsLoadingRecipes(true);
    setRecipeError(null);
    setRecipes([]);

    try {
      let data: (Meal[] | MealSummary[] | null) = null;
      if (searchType === 'name') {
        data = await searchRecipesByName(searchTerm);
      } else {
        const summaryData = await searchRecipesByIngredient(searchTerm);
        if (summaryData && summaryData.length > 0) {
          const detailedRecipesPromises = summaryData.slice(0, 8).map(meal => getRecipeById(meal.idMeal));
          const detailedResults = (await Promise.all(detailedRecipesPromises)).filter(Boolean) as Meal[];
          data = detailedResults.length > 0 ? detailedResults : summaryData;
        } else {
          data = summaryData;
        }
      }

      if (data && data.length > 0) {
        setRecipes(data);
      } else {
        setRecipes([]);
        setRecipeError(`No recipes found for "${searchTerm}".`);
      }
    } catch (error) {
      console.error(`Failed to search recipes for "${searchTerm}":`, error);
      setRecipeError('Failed to fetch recipes. Please try again later.');
      setRecipes([]);
      toast({
        title: "Search Error",
        description: "Could not perform search. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoadingRecipes(false);
  };

  // Elimina handleGetVariations

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchType={searchType}
        setSearchType={setSearchType}
        onSearch={handleSearch}
        isLoading={isLoadingRecipes}
      />      <main className="flex-grow">
        <div className="container mx-auto px-4">
          <RecipeListWrapper>
            <RecipeList recipes={recipes} isLoading={isLoadingRecipes} error={recipeError} />
          </RecipeListWrapper>
        </div>
        {/* Quita RecipeAIAssistant */}
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Gourmet Navigator. All rights reserved.</p>
      </footer>
      <AIAssistant />
    </div>
  );
}