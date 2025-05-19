
'use client';

import type { Meal } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Youtube, MapPin, Tag, ScrollText, ListChecks } from 'lucide-react';

interface RecipeDetailViewProps {
  recipe: Meal;
}

interface IngredientMeasure {
  ingredient: string;
  measure: string;
}

export function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const ingredientsList: IngredientMeasure[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}` as keyof Meal] as string | null;
    const measure = recipe[`strMeasure${i}` as keyof Meal] as string | null;

    if (ingredient && ingredient.trim() !== "") {
      ingredientsList.push({ ingredient, measure: measure || "" });
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="overflow-hidden shadow-2xl">
        <CardHeader className="p-0 relative">
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
