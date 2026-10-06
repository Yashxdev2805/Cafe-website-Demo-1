'use client';

import React, { useState, useEffect } from 'react';
import { useCafe } from '@/context/CafeContext';
import { X, Award, Coffee, Gift, Check, Sparkles } from 'lucide-react';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({ isOpen, onClose }) => {
  const { config } = useCafe();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stamps, setStamps] = useState(4); // Default demo stamps (4 of 8)
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem('cafe_loyalty_phone');
      if (savedPhone) {
        setPhoneNumber(savedPhone);
        const savedStamps = localStorage.getItem(`cafe_loyalty_${savedPhone}`);
        if (savedStamps) {
          setStamps(parseInt(savedStamps, 10));
        }
      }
    } catch {}
  }, []);

  if (!isOpen) return null;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    try {
      localStorage.setItem('cafe_loyalty_phone', phoneNumber);
      localStorage.setItem(`cafe_loyalty_${phoneNumber}`, stamps.toString());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch {}
  };

  const handleAddStampDemo = () => {
    const next = stamps >= 8 ? 1 : stamps + 1;
    setStamps(next);
    if (phoneNumber) {
      localStorage.setItem(`cafe_loyalty_${phoneNumber}`, next.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 z-10 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">Coffee Club</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Digital Loyalty Card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Digital Stamp Card Container */}
        <div className="relative bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-white rounded-2xl p-4 shadow-xl border border-amber-600/30 overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                {config.name}
              </div>
              <h4 className="text-sm font-extrabold text-stone-100 flex items-center gap-1.5 mt-0.5">
                <span>Buy 7, 8th is On Us!</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h4>
            </div>
            <div className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {stamps}/8 Collected
            </div>
          </div>

          {/* 8-Stamp Grid */}
          <div className="grid grid-cols-4 gap-2.5 my-3">
            {Array.from({ length: 8 }).map((_, idx) => {
              const isStamped = idx < stamps;
              const isReward = idx === 7;

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 border transition-all duration-300 ${
                    isStamped
                      ? 'bg-amber-500 border-amber-400 text-stone-950 shadow-md scale-102'
                      : isReward
                      ? 'bg-amber-950/40 border-dashed border-amber-500/60 text-amber-400 animate-pulse'
                      : 'bg-stone-800/80 border-stone-700 text-stone-500'
                  }`}
                >
                  {isReward ? (
                    <Gift className={`w-5 h-5 ${isStamped ? 'text-stone-950' : 'text-amber-400'}`} />
                  ) : (
                    <Coffee className={`w-5 h-5 ${isStamped ? 'text-stone-950 fill-stone-950' : 'text-stone-500'}`} />
                  )}
                  <span className="text-[9px] font-bold mt-0.5">
                    {isReward ? 'FREE' : `#${idx + 1}`}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-stone-300 text-center mt-2 font-light">
            Show this card to the barista at counter when paying to collect stamps.
          </p>
        </div>

        {/* Phone number binding */}
        <form onSubmit={handleSavePhone} className="space-y-2 text-xs">
          <label className="block text-stone-600 dark:text-stone-400 font-medium text-[11px]">
            Link to your WhatsApp / Phone number:
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold rounded-xl text-xs hover:bg-stone-800 transition-colors"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-500" /> : 'Save'}
            </button>
          </div>
        </form>

        {/* Demo Button to simulate counter barista scan */}
        <div className="pt-1">
          <button
            onClick={handleAddStampDemo}
            className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Simulate Barista Stamp (+1)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
