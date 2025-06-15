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
      {/* Floating button */}      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-110 duration-300 z-50 border-2"
        style={{ backgroundColor: 'rgb(102, 187, 106)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(76, 175, 80)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(102, 187, 106)'}
        aria-label="AI Culinary Assistant"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </button>

      {/* Side panel */}      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-[480px] bg-white text-black border-l z-50 overflow-y-auto"
        >          <SheetHeader className="pb-6">
            <SheetTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-green-500" />
              AI Culinary Assistant
            </SheetTitle>
            <SheetDescription className="text-gray-600 text-base">
              Discover amazing recipes! Tell me what ingredients you have, and let the AI work its magic.
            </SheetDescription>
          </SheetHeader><div className="space-y-6 py-4">            <div className="space-y-3">
            <Label htmlFor="ingredients" className="text-base font-semibold text-gray-700">
              What ingredients do you have available?
            </Label>
            <Textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Example: chicken, rice, tomato, onion, garlic, peppers..."
              className="mt-1 min-h-[100px] text-base p-4 border-2 border-gray-200 focus:border-green-400 rounded-lg resize-none"
              rows={4}
            />
          </div><Button
            onClick={handleGetSuggestions}
            disabled={!ingredients.trim() || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
          >              {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span className="text-base">Generating recipes...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              <span className="text-base">What can I cook?</span>
            </>
          )}
            </Button>            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Recipes you can make:</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {suggestions.map((suggestion, i) => (
                    <div key={i} className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl text-sm border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <p className="text-gray-700 leading-relaxed">{suggestion}</p>
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