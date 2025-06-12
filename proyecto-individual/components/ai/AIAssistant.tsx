'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestions = async () => {
    if (!ingredients.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableIngredients: ingredients.split(',').map(i => i.trim()).filter(i => i)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions(['Error al obtener sugerencias. Por favor, intenta de nuevo.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 z-50"
        style={{ backgroundColor: 'rgb(180, 211, 178)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(148, 177, 146)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(106, 160, 103)'}
        aria-label="Asistente de cocina IA"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Panel lateral */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-96 bg-white text-black border-l z-50 overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Asistente de Cocina IA</SheetTitle>
            <SheetDescription>
              Dime qué ingredientes tienes y te sugiero recetas que puedes hacer
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ingredients">¿Qué ingredientes tienes? *</Label>
              <Textarea 
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Ejemplo: pollo, arroz, tomate, cebolla, ajo..."
                className="mt-1"
                rows={4}
              />
            </div>
            
            <Button 
              onClick={handleGetSuggestions} 
              disabled={!ingredients.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando recetas...
                </>
              ) : (
                '¿Qué puedo cocinar?'
              )}
            </Button>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recetas que puedes hacer:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, i) => (
                    <div key={i} className="p-3 bg-green-50 rounded-lg text-sm border border-green-200">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}