'use client';

import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isVegOnly: boolean;
  onToggleVegOnly: () => void;
  isBestsellerOnly: boolean;
  onToggleBestsellerOnly: () => void;
  maxPrice: number | null;
  onSelectMaxPrice: (price: number | null) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  isVegOnly,
  onToggleVegOnly,
  isBestsellerOnly,
  onToggleBestsellerOnly,
  maxPrice,
  onSelectMaxPrice,
}) => {
  return (
    <div className="space-y-3 px-4 sm:px-6 pt-3 pb-2 max-w-4xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search specialty coffee, sourdough, desserts..."
          className="w-full pl-10 pr-9 py-2.5 bg-stone-100 dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 placeholder-stone-500 rounded-xl text-sm border border-stone-200 dark:border-stone-700/70 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        {/* Veg Only Toggle */}
        <button
          onClick={onToggleVegOnly}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all shrink-0 active:scale-95 ${
            isVegOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-emerald-500'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center p-0.5">
            <span className="w-1 h-1 rounded-full bg-current" />
          </span>
          <span>Veg Only</span>
        </button>

        {/* Bestsellers Toggle */}
        <button
          onClick={onToggleBestsellerOnly}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all shrink-0 active:scale-95 ${
            isBestsellerOnly
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-500'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Bestsellers</span>
        </button>

        {/* Price Filter: Under ₹300 */}
        <button
          onClick={() => onSelectMaxPrice(maxPrice === 300 ? null : 300)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all shrink-0 active:scale-95 ${
            maxPrice === 300
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-stone-400'
          }`}
        >
          <span>Under ₹300</span>
        </button>
      </div>
    </div>
  );
};
