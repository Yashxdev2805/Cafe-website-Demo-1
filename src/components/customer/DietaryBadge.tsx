import React from 'react';
import { DietaryType } from '@/types/cafe';

interface DietaryBadgeProps {
  type: DietaryType;
  showLabel?: boolean;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ type, showLabel = false }) => {
  if (type === 'veg') {
    return (
      <span className="inline-flex items-center gap-1.5" title="Vegetarian">
        <span className="w-4 h-4 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5 bg-white shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
        </span>
        {showLabel && <span className="text-xs font-medium text-emerald-700">Veg</span>}
      </span>
    );
  }

  if (type === 'non-veg') {
    return (
      <span className="inline-flex items-center gap-1.5" title="Non-Vegetarian">
        <span className="w-4 h-4 border-2 border-rose-600 rounded-sm flex items-center justify-center p-0.5 bg-white shadow-xs">
          <span className="w-2 h-2 bg-rose-600 rounded-full" />
        </span>
        {showLabel && <span className="text-xs font-medium text-rose-700">Non-Veg</span>}
      </span>
    );
  }

  if (type === 'egg') {
    return (
      <span className="inline-flex items-center gap-1.5" title="Contains Egg">
        <span className="w-4 h-4 border-2 border-amber-600 rounded-sm flex items-center justify-center p-0.5 bg-white shadow-xs">
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
        </span>
        {showLabel && <span className="text-xs font-medium text-amber-700">Egg</span>}
      </span>
    );
  }

  // Vegan
  return (
    <span className="inline-flex items-center gap-1.5" title="100% Plant-Based Vegan">
      <span className="w-4 h-4 border-2 border-green-600 rounded-sm flex items-center justify-center p-0.5 bg-white shadow-xs">
        <span className="w-2 h-2 bg-green-500 rounded-xs rotate-45" />
      </span>
      {showLabel && <span className="text-xs font-medium text-green-700">Vegan</span>}
    </span>
  );
};
