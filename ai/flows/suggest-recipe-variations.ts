'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestRecipeVariationsInputSchema = z.object({
  recipe: z.string().describe('The original recipe (optional).').optional(),
  availableIngredients: z.array(z.string()).describe('A list of available ingredients.'),
});
export type SuggestRecipeVariationsInput = z.infer<typeof SuggestRecipeVariationsInputSchema>;

const SuggestRecipeVariationsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggested recipes you can make.'),
});
export type SuggestRecipeVariationsOutput = z.infer<typeof SuggestRecipeVariationsOutputSchema>;

export async function suggestRecipeVariations(input: SuggestRecipeVariationsInput): Promise<SuggestRecipeVariationsOutput> {
  return suggestRecipeVariationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeVariationsPrompt',
  input: { schema: SuggestRecipeVariationsInputSchema },
  output: { schema: SuggestRecipeVariationsOutputSchema },
  prompt: `Eres un experto en cocina. Basándote en los ingredientes disponibles, sugiere recetas específicas que se puedan hacer con esos ingredientes.

Ingredientes disponibles: {{#each availableIngredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Sugiere 4-5 recetas específicas que se puedan hacer con estos ingredientes. Para cada receta incluye:
- Nombre de la receta
- Breve descripción de cómo prepararla (2-3 líneas máximo)

Haz que las sugerencias sean prácticas, deliciosas y fáciles de preparar. Responde en español.

{{#if availableIngredients.length}}
Aquí tienes algunas recetas que puedes hacer:
{{else}}
Necesitas proporcionar una lista de ingredientes para obtener sugerencias de recetas.
{{/if}}`,
});

const suggestRecipeVariationsFlow = ai.defineFlow(
  {
    name: 'suggestRecipeVariationsFlow',
    inputSchema: SuggestRecipeVariationsInputSchema,
    outputSchema: SuggestRecipeVariationsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);