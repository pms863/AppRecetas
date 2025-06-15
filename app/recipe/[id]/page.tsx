'use client';

import { useEffect, useState } from 'react';
// useRouter y usePathname para obtener parámetros de ruta en App Router (Client Components)
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { RecipeDetailView } from '@/components/recipe/recipe-detail-view';
import { Spinner } from '@/components/common/spinner';
import { getRecipeById } from '@/lib/api';
import type { Meal } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

// Para metadatos dinámicos en App Router, se usa generateMetadata
// export async function generateMetadata({ params }: { params: { id: string } }) {
//   const recipe = await getRecipeById(params.id);
//   if (!recipe) {
//     return {
//       title: 'Recipe Not Found - Gourmet Navigator',
//       description: 'The recipe you are looking for could not be found.',
//     };
//   }
//   return {
//     title: `${recipe.strMeal} - Gourmet Navigator`,
//     description: `Details for ${recipe.strMeal}`,
//   };
// }


export default function RecipePage() {
  const params = useParams(); // Hook para obtener los parámetros de la ruta
  const id = params?.id as string | undefined; // El id puede ser un string o un array de strings si es catch-all
  const { toast } = useToast();

  const [recipe, setRecipe] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      setIsLoading(true);
      setError(null);
      getRecipeById(id)
        .then((data) => {
          if (data) {
            setRecipe(data);
          } else {
            setError('Recipe not found.');
            toast({
              title: "Not Found",
              description: "The recipe you're looking for doesn't exist.",
              variant: "destructive",
            });
          }
        })
        .catch((err) => {
          console.error('Failed to fetch recipe:', err);
          setError('Failed to load recipe details. Please try again later.');
          toast({
            title: "Error",
            description: "Could not load recipe details.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (params && !id) { // params existe pero id no es un string válido (o no está)
      setIsLoading(false);
      setError('Recipe ID is missing or invalid.');
      toast({
        title: "Error",
        description: "Recipe ID is missing or invalid in the URL.",
        variant: "destructive",
      });
    }
    // params puede no estar disponible inmediatamente en la primera renderización, por eso se incluye
  }, [id, params, toast]);


  return (
    <>
      {/* El título y la descripción se pueden manejar con generateMetadata o client-side si es necesario */}
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow">
          {isLoading && (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
              <Spinner className="h-12 w-12 text-primary" />
            </div>
          )}
          {error && (
            <div className="container mx-auto py-12 text-center">
              <p className="text-destructive text-xl">{error}</p>
            </div>
          )}
          {!isLoading && !error && recipe && (
            <RecipeDetailView recipe={recipe} />
          )}
          {!isLoading && !error && !recipe && !isLoading && ( // Condición extra para evitar mostrar "not found" mientras carga
            <div className="container mx-auto py-12 text-center">
              <p className="text-muted-foreground text-xl">Recipe not found or still loading.</p>
            </div>
          )}
        </main>
        <footer className="py-6 text-center text-muted-foreground border-t">
          <p>&copy; {new Date().getFullYear()} Gourmet Navigator. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
