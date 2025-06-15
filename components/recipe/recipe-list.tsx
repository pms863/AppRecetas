import type { Meal, MealSummary } from '@/lib/types';
import { RecipeCard } from './recipe-card';
import { RecipeListShimmer } from '@/components/ui/shimmer';

interface RecipeListProps {
  recipes: (Meal | MealSummary)[];
  isLoading: boolean;
  error?: string | null;
  variant?: 'default' | 'profile'; // Nueva prop para diferentes layouts
}

export function RecipeList({ recipes, isLoading, error, variant = 'default' }: RecipeListProps) {
  if (isLoading) {
    return <RecipeListShimmer variant={variant} />;
  }

  if (error) {
    return <p className="text-destructive text-center py-8">{error}</p>;
  }

  if (!recipes || recipes.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No recipes found. Try a different search!</p>;
  }  // Grid diferente según la variante
  const gridClasses = variant === 'profile'
    ? "grid grid-cols-1 md:grid-cols-2 gap-6" // Sin padding vertical para scrolleable
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8"; // Layout original

  return (
    <div className={gridClasses}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.idMeal} recipe={recipe} />
      ))}
    </div>
  );
}
