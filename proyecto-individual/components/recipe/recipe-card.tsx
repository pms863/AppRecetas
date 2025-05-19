
import Image from 'next/image';
import Link from 'next/link'; // Asegurarse que es de next/link
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Meal, MealSummary } from '@/lib/types';
import { Utensils } from 'lucide-react';

interface RecipeCardProps {
  recipe: Meal | MealSummary;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const isFullMeal = (recipe as Meal).strInstructions !== undefined;
  const category = isFullMeal ? (recipe as Meal).strCategory : null;

  return (
    <Link href={`/recipe/${recipe.idMeal}`} passHref legacyBehavior={false} className="block group h-full cursor-pointer">
        <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out h-full">
          <CardHeader>
            <CardTitle className="text-lg truncate" title={recipe.strMeal}>
              {recipe.strMeal}
            </CardTitle>
            {category && (
              <CardDescription className="flex items-center text-sm text-muted-foreground">
                <Utensils className="mr-1 h-4 w-4" /> {category}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden">
              <Image
                src={recipe.strMealThumb || "https://placehold.co/300x200.png"}
                alt={recipe.strMeal}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="food recipe"
              />
            </div>
          </CardContent>
        </Card>
    </Link>
  );
}
