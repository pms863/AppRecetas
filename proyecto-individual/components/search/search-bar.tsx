"use client";

import type { FormEvent } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: 'name' | 'ingredient';
  setSearchType: (type: 'name' | 'ingredient') => void;
  onSearch: (event: FormEvent) => void;
  isLoading: boolean;
}

export function SearchBar({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  onSearch,
  isLoading,
}: SearchBarProps) {
  return (
    <form onSubmit={onSearch} className="py-8 px-4 md:px-0 bg-background sticky top-16 z-40 border-b">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-primary">Discover Your Next Meal</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-lg shadow-md bg-card">
          <Input
            type="text"
            placeholder={searchType === 'name' ? "Search by recipe name (e.g., Pizza)" : "Search by main ingredient (e.g., Chicken)"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow text-base"
            aria-label="Search term"
            disabled={isLoading}
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              value={searchType}
              onValueChange={(value: 'name' | 'ingredient') => setSearchType(value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">By Name</SelectItem>
                <SelectItem value="ingredient">By Ingredient</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading || !searchTerm.trim()} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" /> {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
