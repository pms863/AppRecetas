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
  onSearch: (event: React.FormEvent) => void;
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
    <form onSubmit={onSearch} className="w-full">
      <div className="flex flex-row gap-2 items-center p-2 rounded-lg bg-card">
        <Input
          type="text"
          placeholder={searchType === 'name' ? "Search by recipe name..." : "Search by ingredient..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
          aria-label="Search term"
          disabled={isLoading}
        />
        <Select
          value={searchType}
          onValueChange={(value: 'name' | 'ingredient') => setSearchType(value)}
          disabled={isLoading}
        >          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Search type" />
          </SelectTrigger>
          <SelectContent className="bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-lg border border-border/40">
            <SelectItem value="name">By Name</SelectItem>
            <SelectItem value="ingredient">By Ingredient</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isLoading || !searchTerm.trim()} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
