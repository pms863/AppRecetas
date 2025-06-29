'use client';

import type { Meal } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Youtube, MapPin, Tag, ScrollText, ListChecks, Star, DollarSign, Calculator, EuroIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RecipeDetailViewProps {
  recipe: Meal;
}

interface IngredientMeasure {
  ingredient: string;
  measure: string;
}

interface IngredientCost {
  ingredient: string;
  measure: string;
  price: number | null;
  currency: string;
  found: boolean;
  searchedTerm: string;
  parsedQuantity?: {
    amount: number;
    unit: string;
    originalText: string;
  };
  pricePerKilo?: number;
  calculatedPrice?: number;
  pricePerKiloText?: string;
}

interface CostCalculationResponse {
  ingredients: IngredientCost[];
  totalCost: number;
  currency: string;
  estimatedCost: boolean;
  source: string;
}

export function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCostLoading, setIsCostLoading] = useState(false);
  const [costData, setCostData] = useState<CostCalculationResponse | null>(null);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const [user, setUser] = useState<{ id?: string } | null>(null);
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
    const session = localStorage.getItem('session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/recipe/favourite/check?recipeId=${recipe.idMeal}&userId=${user.id}`);
        if (!response.ok) return;

        const data = await response.json();
        setIsFavorite(data.isFavorite);
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [recipe.idMeal, user?.id]);

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
          userId: user?.id,
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
  const handleCostCalculation = async () => {
    setIsCostLoading(true);
    setShowCostDetails(false); // Hide previous results while loading
    setCostData(null);

    try {
      toast({
        title: "Calculating Cost",
        description: "Searching for ingredient prices online...",
      });

      const response = await fetch('/api/recipe/cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredientsList
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate cost');
      }

      const data: CostCalculationResponse = await response.json();
      setCostData(data);
      setShowCostDetails(true); toast({
        title: "Cost Calculated Successfully!",
        description: `Total estimated cost: ${data.totalCost}€ (${data.source})`,
      });
    } catch (error) {
      console.error('Failed to calculate cost:', error);
      toast({
        title: "Error",
        description: "Failed to calculate recipe cost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCostLoading(false);
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
            onClick={user ? handleFavoriteClick : undefined}
            disabled={isLoading || !user}
            title={user ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login to add favorites"}
            aria-label={user ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login to add favorites"}
          >
            <Star
              className={`h-6 w-6 transition-colors ${isFavorite ? 'fill-yellow-400 text-yellow-400' :
                user ? 'text-gray-400' : 'text-gray-300'
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
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary bg-white/40 backdrop-blur-xl inline-block p-3 rounded-lg shadow-lg">
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

          <div className="grid md:grid-cols-3 gap-6 pt-6">            <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-accent flex items-center">
                <ListChecks className="mr-2 h-5 w-5" /> Ingredients
              </h3>
              <Button
                onClick={handleCostCalculation}
                disabled={isCostLoading || ingredientsList.length === 0}
                size="sm"
                variant="outline"
                className={`gap-2 ${!isCostLoading && 'hover:bg-primary hover:text-black hover:shadow-lg transition-all duration-300'}`}
              >
                {isCostLoading ? 'Calculating...' : 'Estimate Cost'}
                {isCostLoading ? (
                  <Calculator className="h-4 w-4 animate-spin" />
                ) : (
                  <EuroIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isCostLoading && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-semibold text-blue-800">Calculating costs...</span>
                </div>
                <p className="text-xs text-blue-600">
                  Searching online for ingredient prices. This may take a moment.
                </p>
              </div>
            )}

            {ingredientsList.length > 0 ? (
              <ul className="space-y-2 text-foreground/90">
                {ingredientsList.map(({ ingredient, measure }, index) => {
                  const costInfo = costData?.ingredients.find(c => c.ingredient === ingredient);
                  return (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        <span className="font-medium">{ingredient}</span>
                        {measure && <span className="text-muted-foreground">: {measure}</span>}
                      </span>
                      {costInfo && showCostDetails && (
                        <div className="flex flex-col items-end text-sm">
                          <span className={`font-medium ${costInfo.found ? 'text-green-600' : 'text-amber-600'}`}>
                            unit cost: {costInfo.price?.toFixed(2)} €
                            {!costInfo.found && <span className="text-xs text-amber-600 ml-1">*estimated</span>}
                          </span>
                          {costInfo.pricePerKiloText && (
                            <span className="text-xs text-gray-500">
                              {costInfo.pricePerKiloText}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">No ingredients listed.</p>
            )}

            {/* Resumen total - movido después de la lista de ingredientes */}
            {costData && showCostDetails && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg text-green-800">Total Cost:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {costData.totalCost} €
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-green-700">
                  <span>{costData.source}</span>
                  <span>
                    {costData.ingredients.filter(i => i.found).length}/{costData.ingredients.length} found online
                  </span>
                </div>
                {costData.estimatedCost && (
                  <p className="text-sm text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ Some prices are estimated as ingredients weren't found online
                  </p>
                )}
              </div>
            )}</div>

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