'use client';

import React, { useState } from 'react';
import { useCafe } from '@/context/CafeContext';
import { useCart } from '@/context/CartContext';
import { Settings2, X, RefreshCw, QrCode, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';

export const AdminDrawer: React.FC = () => {
  const { config, items, toggleItemAvailability, updateItemPrice, resetToDefaults } = useCafe();
  const { tableNumber, setTableNumber } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [showQRPreview, setShowQRPreview] = useState(false);

  const handleStartEditPrice = (itemId: string, currentPrice: number) => {
    setEditingPriceItemId(itemId);
    setTempPrice(currentPrice.toString());
  };

  const handleSavePrice = (itemId: string) => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num) && num > 0) {
      updateItemPrice(itemId, num);
    }
    setEditingPriceItemId(null);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-stone-900/90 hover:bg-stone-950 text-amber-400 p-3 rounded-full shadow-2xl border border-amber-500/40 backdrop-blur-md flex items-center gap-2 group transition-all duration-300 hover:scale-105 active:scale-95"
        title="Owner Quick Admin Panel"
      >
        <Settings2 className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        <span className="text-xs font-bold text-white pr-1 hidden sm:inline">Owner Mode</span>
      </button>

      {/* Admin Panel Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-stone-900 shadow-2xl flex flex-col z-10 border-l border-stone-200 dark:border-stone-800">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Owner Control Panel</h2>
                  <p className="text-xs text-stone-400">Live Real-Time Menu & Price Switcher</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-500/20 px-4 sm:px-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-700 dark:text-stone-300 font-medium">Test Table:</span>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-2 py-1 font-bold text-amber-600 dark:text-amber-400"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((t) => (
                    <option key={t} value={t.toString()}>
                      Table #{t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQRPreview(!showQRPreview)}
                  className="px-2.5 py-1 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-lg font-semibold flex items-center gap-1 hover:opacity-90"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>

                <button
                  onClick={resetToDefaults}
                  className="p-1.5 text-stone-500 hover:text-rose-500 transition-colors"
                  title="Reset Demo Data"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* QR Code Stand Preview Modal / Banner */}
            {showQRPreview && (
              <div className="p-4 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 text-center space-y-2">
                <div className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Table #{tableNumber} QR Card Preview
                </div>
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-md border flex items-center justify-center">
                  {/* Real Dynamic QR Image using public QR API */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      typeof window !== 'undefined' ? `${window.location.origin}/?table=${tableNumber}` : ''
                    )}`}
                    alt={`QR Code Table ${tableNumber}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-stone-500">
                  Scan opens: <span className="font-mono text-amber-600">/?table={tableNumber}</span>
                </div>
              </div>
            )}

            {/* Live Items Manager */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Manage Item Availability & Prices</span>
                <span className="text-[10px] text-emerald-600 font-semibold">● Updates in real-time</span>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 ${
                    item.isAvailable
                      ? 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                      : 'bg-stone-100 dark:bg-stone-950 border-rose-300 dark:border-rose-900/50 opacity-75'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-900 dark:text-white truncate">
                      {item.name}
                    </div>
                    
                    {/* Price edit */}
                    <div className="flex items-center gap-2 mt-1">
                      {editingPriceItemId === item.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-stone-400">{config.currencySymbol}</span>
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-16 px-1.5 py-0.5 rounded border border-amber-500 bg-white dark:bg-stone-900 font-bold text-xs"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(item.id)}
                            className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditPrice(item.id, item.price)}
                          className="font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                          title="Click to change price"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>{config.currencySymbol}{item.price}</span>
                          <span className="text-[10px] text-stone-400 font-normal ml-1">(edit)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1-Tap Sold Out Switch */}
                  <button
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      item.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-500" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-rose-500" />
                        <span>Sold Out</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-center text-[11px] text-stone-500">
              Changes reflect immediately on customer menus and active orders.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
