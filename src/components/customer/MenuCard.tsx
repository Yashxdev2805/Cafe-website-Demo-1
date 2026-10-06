'use client';

import React from 'react';
import { MenuItem } from '@/types/cafe';
import { useCart } from '@/context/CartContext';
import { useCafe } from '@/context/CafeContext';
import { DietaryBadge } from './DietaryBadge';
import { Plus, Minus, Flame, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface MenuCardProps {
  item: MenuItem;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { config } = useCafe();
  const { cart, addToCart, updateQuantity } = useCart();

  const cartEntry = cart.find((ci) => ci.item.id === item.id);
  const quantity = cartEntry ? cartEntry.quantity : 0;

  return (
    <article aria-label={item.name} className={`relative flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-stone-900 shadow-xs hover:shadow-md ${
      item.isAvailable
        ? 'border-stone-200 dark:border-stone-800 hover:border-amber-500/40'
        : 'border-stone-200/60 dark:border-stone-800/60 opacity-60 bg-stone-50 dark:bg-stone-950'
    }`}>
      {/* Left Details Column */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Badges Row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <DietaryBadge type={item.dietary} showLabel />
            {item.isBestseller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                Bestseller
              </span>
            )}
            {item.spicyLevel && item.spicyLevel > 0 ? (
              <span className="inline-flex items-center text-[10px] text-rose-600 dark:text-rose-400 font-semibold gap-0.5">
                <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                Spicy
              </span>
            ) : null}
          </div>

          {/* Item Name */}
          <h3 className="font-bold text-stone-900 dark:text-white text-base leading-snug">
            {item.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-extrabold text-stone-950 dark:text-amber-400">
              {config.currencySymbol}{item.price}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-stone-400 line-through">
                {config.currencySymbol}{item.originalPrice}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1.5 font-light leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Preparation Meta */}
        {item.preparationTimeMinutes && (
          <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-2 font-medium">
            <Clock className="w-3 h-3" />
            <span>~{item.preparationTimeMinutes} mins</span>
          </div>
        )}
      </div>

      {/* Right Image & Action Column */}
      <div className="relative w-28 sm:w-32 flex flex-col items-center justify-between shrink-0">
        <div className="relative w-28 h-24 sm:w-32 sm:h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-inner">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="128px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-stone-400">
              ☕
            </div>
          )}

          {/* Sold Out Overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-1 z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-800">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Action Button: Add or Stepper */}
        <div className="mt-2 w-full flex justify-center">
          {!item.isAvailable ? (
            <span className="text-[11px] text-stone-400 font-medium py-1">Unavailable</span>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(item)}
              className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 border border-amber-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between bg-stone-900 dark:bg-stone-800 text-white rounded-xl px-2 py-1 shadow-md border border-stone-700">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="p-1 hover:text-amber-400 active:scale-90 transition-transform"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-amber-400 px-1">{quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="p-1 hover:text-amber-400 active:scale-90 transition-transform"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
