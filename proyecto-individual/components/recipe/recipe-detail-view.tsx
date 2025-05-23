'use client';

import type { Meal } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Youtube, MapPin, Tag, ScrollText, ListChecks, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RecipeDetailViewProps {
  recipe: Meal;
}

interface IngredientMeasure {
  ingredient: string;
  measure: string;
}

export function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ingredientsList: IngredientMeasure[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}` as keyof Meal] as string | null;
    const measure = recipe[`strMeasure${i}` as keyof Meal] as string | null;

    if (ingredient && ingredient.trim() !== "") {
      ingredientsList.push({ ingredient, measure: measure || "" });
    }
  }

  useEffect(() => {
  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/recipe/favourite/check?recipeId=${recipe.idMeal}&userId=1`);
      
      // Check if the response is ok and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Response is not JSON");
      }

      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      toast({
        title: "Error",
        description: "Failed to check favorite status",
        variant: "destructive",
      });
    }
  };

  checkFavoriteStatus();
}, [recipe.idMeal, toast]);

const handleFavoriteClick = async (e?: React.MouseEvent) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  setIsLoading(true);
  
  try {
    const endpoint = isFavorite ? '/api/recipe/favourite/delete' : '/api/recipe/favourite/add';
    const response = await fetch(endpoint, {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipeId: recipe.idMeal,
        userId: '1', // TODO: Replace with actual user ID from auth context
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      setIsFavorite(!isFavorite); // Toggle the favorite state
      toast({
        title: "Success",
        description: data.message,
      });
    } else {
      throw new Error(data.error || 'Failed to update favorites');
    }
  } catch (error) {
    console.error('Failed to update favorites:', error);
    toast({
      title: "Error",
      description: "Failed to update favorites",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="overflow-hidden shadow-2xl">
        <CardHeader className="p-0 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/50 backdrop-blur-sm hover:bg-background/75"
            onClick={handleFavoriteClick}
            disabled={isLoading}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star 
              className={`h-6 w-6 transition-colors ${
                isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
              }`}
            />
          </Button>
          <div className="w-full h-[300px] md:h-[450px] relative">
            <Image
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint="recipe food"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center -mt-16 relative z-10">
             <CardTitle className="text-3xl md:text-4xl font-bold text-primary bg-background/80 backdrop-blur-sm inline-block p-3 rounded-lg shadow-md">
                {recipe.strMeal}
              </CardTitle>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            {recipe.strCategory && (
              <Badge variant="secondary" className="text-sm py-1 px-3">
                <Tag className="mr-2 h-4 w-4" />
                {recipe.strCategory}
              </Badge>
            )}
            {recipe.strArea && (
              <Badge variant="secondary" className="text-sm py-1 px-3">
                <MapPin className="mr-2 h-4 w-4" />
                {recipe.strArea}
              </Badge>
            )}
          </div>

          {recipe.strTags && (
            <div className="flex flex-wrap gap-2 justify-center">
              {recipe.strTags.split(',').map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag.trim()}</Badge>
              ))}
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-6 pt-6">
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold mb-3 text-accent flex items-center">
                <ListChecks className="mr-2 h-5 w-5" /> Ingredients
              </h3>
              {ingredientsList.length > 0 ? (
                <ul className="space-y-2 text-foreground/90 list-disc list-inside pl-2">
                  {ingredientsList.map(({ ingredient, measure }, index) => (
                    <li key={index}>
                      <span className="font-medium">{ingredient}</span>: {measure}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No ingredients listed.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-3 text-accent flex items-center">
                <ScrollText className="mr-2 h-5 w-5" /> Instructions
              </h3>
              <p className="whitespace-pre-line leading-relaxed text-foreground/90 text-justify">
                {recipe.strInstructions}
              </p>
            </div>
          </div>

          {recipe.strYoutube && (
            <div className="text-center pt-6">
              <Button asChild variant="default" size="lg">
                <a href={recipe.strYoutube} target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-5 w-5" />
                  Watch on YouTube
                </a>
              </Button>
            </div>
          )}

          {recipe.strSource && (
             <div className="text-center pt-4 text-sm text-muted-foreground">
                Original Source: <a href={recipe.strSource} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{recipe.strSource}</a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}