import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Meal, MealSummary } from '@/lib/types';
import { Utensils, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RecipeCardProps {
  recipe: Meal | MealSummary;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ id?: string } | null>(null);
  const { toast } = useToast();
  const isFullMeal = (recipe as Meal).strInstructions !== undefined;
  const category = isFullMeal ? (recipe as Meal).strCategory : null;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/recipe/favourite/check?recipeId=${recipe.idMeal}&userId=1`);
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [recipe.idMeal]);

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

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
    <Link href={`/recipe/${recipe.idMeal}`} passHref legacyBehavior={false} className="block group h-full cursor-pointer">
      <Card className="relative flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out h-full">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/50 backdrop-blur-sm hover:bg-background/75"
          onClick={user ? handleFavoriteClick : undefined}
          disabled={isLoading || !user}
          title={user ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login to add favorites"}
          aria-label={user ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login to add favorites"}
        >
          <Star 
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-green-500 text-green-500' : 
              user ? 'text-gray-400 hover:text-green-500' : 'text-gray-300'
            }`}
          />
        </Button>

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