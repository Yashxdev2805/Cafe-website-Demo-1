'use client';

import React from 'react';
import { MenuCategory } from '@/types/cafe';

interface CategoryBarProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <nav aria-label="Menu categories" className="sticky top-0 z-20 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-sm py-2.5 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold scale-102'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              {cat.icon && <span className="text-sm">{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
