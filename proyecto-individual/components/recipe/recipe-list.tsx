import type { Meal, MealSummary } from '../../lib/types';
import { RecipeCard } from './recipe-card';
import { Skeleton } from '../ui/skeleton';

interface RecipeListProps {
  recipes: (Meal | MealSummary)[];
  isLoading: boolean;
  error?: string | null;
}

export function RecipeList({ recipes, isLoading, error }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[170px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center py-8">{error}</p>;
  }

  if (!recipes || recipes.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No recipes found. Try a different search!</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.idMeal} recipe={recipe} />
      ))}
    </div>
  );
}
