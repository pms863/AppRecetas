import { NextRequest, NextResponse } from 'next/server';
import { suggestRecipeVariations } from '@/ai/flows/suggest-recipe-variations';

export async function POST(req: NextRequest) {
  try {
    const { availableIngredients } = await req.json();

    if (!availableIngredients || !Array.isArray(availableIngredients) || availableIngredients.length === 0) {
      return NextResponse.json({ 
        error: "Se requiere una lista de ingredientes" 
      }, { status: 400 });
    }

    // Usar tu flow existente
    const result = await suggestRecipeVariations({
      availableIngredients,
      recipe: '' // Campo opcional, lo dejamos vacío para sugerencias generales
    });

    return NextResponse.json({ 
      suggestions: result.suggestions 
    });

  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}