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
      setSuggestions(['Error getting suggestions. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-110 duration-300 z-50 border-2"
        style={{ backgroundColor: 'rgb(102, 187, 106)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(76, 175, 80)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(102, 187, 106)'}
        aria-label="Gourmet's AI assistance"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </button>

      {/* Side panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-96 bg-white text-black border-l z-50 overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Gourmet's AI assistance</SheetTitle>
            <SheetDescription>
              Discover amazing recipes! Tell me what ingredients you have, and let the AI work its magic.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ingredients">What ingredients do you have?</Label>
              <Textarea
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Example: chicken, rice, tomato, onion, garlic..."
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
                  Generating recipes...
                </>
              ) : (
                'What can I cook?'
              )}
            </Button>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recipes you can make:</h4>
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