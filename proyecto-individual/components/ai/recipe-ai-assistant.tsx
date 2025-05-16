"use client";

import type { FormEvent } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Wand2 } from 'lucide-react';
import { Spinner } from '../common/spinner';

interface RecipeAIAssistantProps {
  ingredients: string;
  setIngredients: (ingredients: string) => void;
  variations: string[];
  onGetVariations: (event: FormEvent) => void;
  isLoading: boolean;
  error?: string | null;
}

export function RecipeAIAssistant({
  ingredients,
  setIngredients,
  variations,
  onGetVariations,
  isLoading,
  error,
}: RecipeAIAssistantProps) {
  return (
    <section className="py-12 bg-secondary/50">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <Wand2 className="mx-auto h-12 w-12 text-accent mb-2" />
            <CardTitle className="text-2xl font-semibold text-accent">Recipe AI Assistant</CardTitle>
            <CardDescription>
              Got some ingredients? Let our AI suggest delicious variations or new recipes you can make!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onGetVariations} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ai-ingredients" className="text-md font-medium">
                  Enter your available ingredients (comma-separated)
                </Label>
                <Textarea
                  id="ai-ingredients"
                  placeholder="e.g., chicken breast, broccoli, soy sauce, rice"
                  value={ingredients}
                  onChange={(e) => setIngredients((e.target as HTMLTextAreaElement).value)}
                  rows={4}
                  className="text-base"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !ingredients.trim()}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    <span>Generating Ideas...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    <span>Get Variations</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          {(variations.length > 0 || error) && (
            <CardFooter className="flex flex-col items-start space-y-4 pt-6 border-t">
              {error && <p className="text-destructive text-sm">{error}</p>}
              {variations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Recipe Ideas:</h3>
                  <ul className="list-disc list-inside space-y-1 text-foreground/90">
                    {variations.map((variation, index) => (
                      <li key={index}>{variation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </section>
  );
}
