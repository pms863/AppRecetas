'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting recipe variations based on a given recipe and available ingredients.
 *
 * - suggestRecipeVariations - A function that takes a recipe and a list of available ingredients and returns suggestions for recipe variations.
 * - SuggestRecipeVariationsInput - The input type for the suggestRecipeVariations function.
 * - SuggestRecipeVariationsOutput - The return type for the suggestRecipeVariations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeVariationsInputSchema = z.object({
  recipe: z.string().describe('The original recipe.'),
  availableIngredients: z.array(z.string()).describe('A list of available ingredients.'),
});
export type SuggestRecipeVariationsInput = z.infer<typeof SuggestRecipeVariationsInputSchema>;

const SuggestRecipeVariationsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggested recipe variations.'),
});
export type SuggestRecipeVariationsOutput = z.infer<typeof SuggestRecipeVariationsOutputSchema>;

export async function suggestRecipeVariations(input: SuggestRecipeVariationsInput): Promise<SuggestRecipeVariationsOutput> {
  return suggestRecipeVariationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeVariationsPrompt',
  input: {schema: SuggestRecipeVariationsInputSchema},
  output: {schema: SuggestRecipeVariationsOutputSchema},
  prompt: `You are a recipe suggestion expert. Given a recipe and a list of available ingredients, suggest recipe variations that can be made with those ingredients.

Recipe: {{{recipe}}}
Available Ingredients: {{#each availableIngredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Suggest some recipe variations using only the available ingredients. Return a list of recipe variations.

{{#if availableIngredients.length}}
  Here are some variations you can make:
{{else}}
  You need to supply a list of available ingredients to get recipe variation suggestions.
{{/if}}`,
});

const suggestRecipeVariationsFlow = ai.defineFlow(
  {
    name: 'suggestRecipeVariationsFlow',
    inputSchema: SuggestRecipeVariationsInputSchema,
    outputSchema: SuggestRecipeVariationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
