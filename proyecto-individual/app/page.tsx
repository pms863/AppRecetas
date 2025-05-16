'use client';


import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Header } from '../components/layout/header';
import { SearchBar } from '../components/search/search-bar';
import { RecipeList } from '../components/recipe/recipe-list';
import { RecipeAIAssistant } from '../components/ai/recipe-ai-assistant';
import { searchRecipesByName, searchRecipesByIngredient, getRecipeById } from '../lib/api';
import { suggestRecipeVariations, SuggestRecipeVariationsInput, SuggestRecipeVariationsOutput } from '../ai/flows/suggest-recipe-variations';
import type { Meal, MealSummary } from '../lib/types';
import { useToast } from "../hooks/use-toast";

export default function HomePage() {
  const { toast } = useToast();

  // State for recipe search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<'name' | 'ingredient'>('name');
  const [recipes, setRecipes] = useState<(Meal | MealSummary)[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true); // Start true for initial load
  const [recipeError, setRecipeError] = useState<string | null>(null);

  // State for AI Assistant
  const [aiIngredients, setAiIngredients] = useState<string>('');
  const [aiVariations, setAiVariations] = useState<string[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchInitialRecipes = useCallback(async () => {
    setIsLoadingRecipes(true);
    setRecipeError(null);
    try {
      const data = await searchRecipesByName('Arrabiata'); // Default search
      if (data && data.length > 0) {
        setRecipes(data);
      } else {
        setRecipes([]);
        setRecipeError('No recipes found for "Arrabiata". Try another search!');
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
        // TheMealDB filter by ingredient returns MealSummary. For consistency, we might want full Meal details.
        // This would involve fetching each meal by ID after getting the summary list.
        // For now, let's use the summary directly if it's an ingredient search.
        const summaryData = await searchRecipesByIngredient(searchTerm);
        if (summaryData && summaryData.length > 0) {
           // Fetch full details for up to N recipes to provide richer cards
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

  const handleGetVariations = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiIngredients.trim()) {
      toast({ title: "Ingredients missing", description: "Please enter some ingredients.", variant: "destructive" });
      return;
    }

    setIsLoadingAi(true);
    setAiError(null);
    setAiVariations([]);

    const ingredientsArray = aiIngredients.split(',').map(s => s.trim()).filter(s => s !== '');
    if (ingredientsArray.length === 0) {
      setAiError("Please enter valid, comma-separated ingredients.");
      setIsLoadingAi(false);
      return;
    }

    const input: SuggestRecipeVariationsInput = {
      // Using a generic recipe prompt as the user is primarily providing ingredients
      recipe: "A delicious meal that can be prepared with the ingredients I have.",
      availableIngredients: ingredientsArray,
    };

    try {
      const result: SuggestRecipeVariationsOutput = await suggestRecipeVariations(input);
      if (result.suggestions && result.suggestions.length > 0) {
        setAiVariations(result.suggestions);
      } else {
        setAiError("The AI couldn't come up with variations for these ingredients. Try adding more or different ones!");
      }
    } catch (error) {
      console.error('Failed to get AI recipe variations:', error);
      setAiError('An error occurred while generating recipe ideas. Please try again.');
      toast({
        title: "AI Error",
        description: "Could not get recipe variations from AI.",
        variant: "destructive",
      });
    }
    setIsLoadingAi(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          setSearchType={setSearchType}
          onSearch={handleSearch}
          isLoading={isLoadingRecipes}
        />
        <div className="container mx-auto px-4">
          <RecipeList recipes={recipes} isLoading={isLoadingRecipes} error={recipeError} />
        </div>
        <RecipeAIAssistant
          ingredients={aiIngredients}
          setIngredients={setAiIngredients}
          variations={aiVariations}
          onGetVariations={handleGetVariations}
          isLoading={isLoadingAi}
          error={aiError}
        />
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Gourmet Navigator. All rights reserved.</p>
      </footer>
    </div>
  );
}
