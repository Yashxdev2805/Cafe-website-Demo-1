'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { useCart } from '@/context/CartContext';
import { MapPin, Phone, Wifi, Clock, CalendarDays, Award, Edit2, Check } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenInfo: () => void;
  onOpenLoyalty: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onOpenInfo, onOpenLoyalty }) => {
  const { config, isOpenNow } = useCafe();
  const { tableNumber, setTableNumber } = useCart();
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [tempTable, setTempTable] = useState(tableNumber);

  const handleSaveTable = () => {
    if (tempTable.trim()) {
      setTableNumber(tempTable.trim());
    }
    setIsEditingTable(false);
  };

  return (
    <header className="relative w-full bg-stone-900 text-white overflow-hidden shadow-lg">
      {/* Background Hero Banner with Gradient Overlay */}
      <div className="relative h-44 sm:h-52 w-full">
        <Image
          src={config.heroImageUrl}
          alt={config.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover opacity-60 scale-105 transition-transform duration-700 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
      </div>

      {/* Main Cafe Details Header Card */}
      <div className="relative -mt-16 px-4 sm:px-6 pb-4 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-amber-600/40 bg-stone-900 shadow-xl shrink-0">
              <Image
                src={config.logoUrl}
                alt={config.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                  isOpenNow ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {isOpenNow ? 'OPEN NOW' : 'CLOSED'}
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {config.hours.openingTime} - {config.hours.closingTime}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
                {config.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 line-clamp-1 mt-0.5 font-light">
                {config.tagline}
              </p>
            </div>
          </div>

          {/* Table Number Pill with Quick Edit */}
          <div className="self-start sm:self-end bg-stone-800/90 backdrop-blur-md border border-stone-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs shadow-md">
            <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Table</span>
            {isEditingTable ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempTable}
                  onChange={(e) => setTempTable(e.target.value)}
                  className="w-12 bg-stone-900 border border-amber-500 rounded px-1.5 py-0.5 text-center text-white text-xs font-bold focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTable}
                  className="p-1 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold text-sm">#{tableNumber}</span>
                <button
                  onClick={() => {
                    setTempTable(tableNumber);
                    setIsEditingTable(true);
                  }}
                  className="text-stone-400 hover:text-white p-0.5 rounded transition-colors"
                  title="Change Table Number"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar text-xs">
          {config.enabledModules.tableBookings && (
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-sm shrink-0 active:scale-95"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Book Table</span>
            </button>
          )}

          {config.enabledModules.loyaltyCard && (
            <button
              onClick={onOpenLoyalty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-lg font-medium transition-colors shrink-0 active:scale-95"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Stamp Card</span>
            </button>
          )}

          <button
            onClick={onOpenInfo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg font-medium transition-colors shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Location & Wi-Fi</span>
          </button>

          <a
            href={`tel:${config.contact.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg font-medium transition-colors shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Cafe</span>
          </a>
        </div>
      </div>
    </header>
  );
};
