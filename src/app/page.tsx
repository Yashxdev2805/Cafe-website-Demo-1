'use client';

import React, { useState, useMemo } from 'react';
import { useCafe } from '@/context/CafeContext';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/customer/Header';
import { CategoryBar } from '@/components/customer/CategoryBar';
import { SearchFilter } from '@/components/customer/SearchFilter';
import { MenuCard } from '@/components/customer/MenuCard';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { BookingModal } from '@/components/customer/BookingModal';
import { InfoModal } from '@/components/customer/InfoModal';
import { LoyaltyModal } from '@/components/customer/LoyaltyModal';
import { Sparkles, MapPin, Camera, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function CafeMenuPage() {
  const { config, categories, items } = useCafe();
  const { tableSwitchedAlert, dismissTableSwitchedAlert } = useCart();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isBestsellerOnly, setIsBestsellerOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id || '');

  // Modal open states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      // Veg only filter (includes vegan)
      if (isVegOnly && item.dietary !== 'veg' && item.dietary !== 'vegan') {
        return false;
      }

      // Bestseller filter
      if (isBestsellerOnly && !item.isBestseller) {
        return false;
      }

      // Max price filter
      if (maxPrice !== null && item.price > maxPrice) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, isVegOnly, isBestsellerOnly, maxPrice]);

  // Group filtered items by category
  const categorizedItems = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        items: filteredItems.filter((item) => item.categoryId === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, filteredItems]);

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    const element = document.getElementById(`section-${categoryId}`);
    if (element) {
      const yOffset = -70; // offset for sticky category bar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-28">
      {/* Table Context Switch Alert Banner */}
      {tableSwitchedAlert && (
        <aside aria-label="Table notification banner" className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-md sticky top-0 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">📍</span>
            <span>
              Now ordering for <strong>Table #{tableSwitchedAlert.current}</strong> (switched from Table #{tableSwitchedAlert.previous})
            </span>
          </div>
          <button
            onClick={dismissTableSwitchedAlert}
            className="px-2 py-0.5 bg-stone-950/15 hover:bg-stone-950/25 text-stone-950 rounded-md font-bold text-[11px] transition-colors"
          >
            Acknowledge
          </button>
        </aside>
      )}

      {/* 1. Cafe Hero Header */}
      <Header
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />

      {/* 2. Sticky Category Bar */}
      <CategoryBar
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* 3. Search and Quick Filter Chips */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isVegOnly={isVegOnly}
        onToggleVegOnly={() => setIsVegOnly(!isVegOnly)}
        isBestsellerOnly={isBestsellerOnly}
        onToggleBestsellerOnly={() => setIsBestsellerOnly(!isBestsellerOnly)}
        maxPrice={maxPrice}
        onSelectMaxPrice={setMaxPrice}
      />

      {/* 4. Menu Items Feed */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 space-y-8">
        {categorizedItems.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6">
            <span className="text-4xl">🔍</span>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              No matching items found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              Try adjusting your search query or clearing your dietary filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setIsVegOnly(false);
                setIsBestsellerOnly(false);
                setMaxPrice(null);
              }}
              className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          categorizedItems.map(({ category, items: groupItems }) => (
            <section
              key={category.id}
              id={`section-${category.id}`}
              className="space-y-3.5 scroll-mt-20"
            >
              {/* Category Section Header */}
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <h2 className="text-lg font-extrabold text-stone-900 dark:text-white font-serif">
                    {category.name}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-stone-400">
                  {groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {category.description && (
                <p className="text-xs text-stone-500 dark:text-stone-400 -mt-2">
                  {category.description}
                </p>
              )}

              {/* Items Grid (1 col on mobile, 2 col on tablet/desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {groupItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* 5. Instagram & Ambiance Gallery Preview (P1-13 requirement) */}
        {config.enabledModules.gallery && (
          <section className="pt-8 border-t border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-1.5 font-serif">
                  <Camera className="w-4 h-4 text-pink-500" />
                  <span>Cafe Ambiance & Moments</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Tag us on Instagram @artisanalroast.blr</p>
              </div>
              {config.contact.instagramUrl && (
                <a
                  href={config.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Follow Us →
                </a>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 rounded-2xl overflow-hidden">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800">
                <Image
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80"
                  alt="Cafe interior"
                  fill
                  sizes="(max-width: 768px) 33vw, 250px"
                  className="object-cover hover:scale-105 transition-transform"
                />
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800">
                <Image
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=400&q=80"
                  alt="Latte art"
                  fill
                  sizes="(max-width: 768px) 33vw, 250px"
                  className="object-cover hover:scale-105 transition-transform"
                />
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800">
                <Image
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
                  alt="Fresh sourdough"
                  fill
                  sizes="(max-width: 768px) 33vw, 250px"
                  className="object-cover hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 6. Footer */}
      <footer className="mt-8 border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-500 dark:text-stone-400 space-y-1">
        <p className="font-semibold text-stone-800 dark:text-stone-200">
          {config.name}
        </p>
        <p className="text-[11px]">
          {config.contact.address}
        </p>
        <p className="text-[10px] text-stone-400 pt-2">
          Powered by Cafe QR Platform • Instant WhatsApp Ordering
        </p>
      </footer>

      {/* 7. Slide-over Cart & Sticky Checkout Bar */}
      <CartDrawer />

      {/* 8. Interactive Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      <LoyaltyModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
      />
    </div>
  );
}
