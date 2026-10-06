'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCafe } from '@/context/CafeContext';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { PlacedOrder } from '@/types/cafe';

export const CartDrawer: React.FC = () => {
  const { config, items: liveItems } = useCafe();
  const {
    cart,
    tableNumber,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    updateItemNotes,
    clearCart,
    subtotal,
    totalItemsCount,
    sendWhatsAppOrder,
    copyOrderSummary,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<PlacedOrder | null>(null);

  if (cart.length === 0 && !placedOrderInfo) return null;

  const handleSendOrder = () => {
    const order = sendWhatsAppOrder(customerName);
    if (order) {
      setPlacedOrderInfo(order);
    }
  };

  const handleCopySummary = async () => {
    const success = await copyOrderSummary(customerName);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDismissReceipt = () => {
    setPlacedOrderInfo(null);
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Floating Bottom Sticky Bar when Cart has items */}
      {!isCartOpen && cart.length > 0 && !placedOrderInfo && (
        <aside aria-label="Order summary bar" className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative bg-amber-500 text-stone-950 p-2.5 rounded-xl font-bold flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900">
                  {totalItemsCount}
                </span>
              </div>
              <div>
                <div className="text-xs text-stone-400 font-medium">Table #{tableNumber}</div>
                <div className="text-base font-extrabold text-amber-400">
                  {config.currencySymbol}{subtotal}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>View Order</span>
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Slide-over Backdrop & Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-stone-900 shadow-2xl flex flex-col z-10 border-l border-stone-200 dark:border-stone-800">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                    {placedOrderInfo ? 'Order Receipt' : 'Your Order'}
                  </h2>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Table #{tableNumber} • {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Placed Order Verification Screen (if order just placed) */}
            {placedOrderInfo ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between space-y-6">
                <div className="text-center space-y-4 pt-4">
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-stone-900 dark:text-white font-serif">
                      Order Sent to Kitchen!
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                      Your order has been logged into the cafe&apos;s kitchen system.
                    </p>
                  </div>

                  {/* Verification Badge */}
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-left space-y-3 shadow-inner">
                    <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                      <span className="text-xs text-stone-500 font-medium">Order ID</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-amber-400 text-sm">
                        #{placedOrderInfo.id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                      <span className="text-xs text-stone-500 font-medium">Security Checksum</span>
                      <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {placedOrderInfo.verificationCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-medium">Table & Total</span>
                      <span className="font-bold text-stone-900 dark:text-white text-xs">
                        Table #{placedOrderInfo.tableNumber} • {config.currencySymbol}{placedOrderInfo.subtotal}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2 text-left">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>
                      Counter staff will cross-verify this Order ID and Checksum against your WhatsApp message.
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <button
                    onClick={handleCopySummary}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Order Summary Copied!' : 'Copy Order Text (Fallback)'}</span>
                  </button>

                  <button
                    onClick={handleDismissReceipt}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Back to Menu / Place Another Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Optional Customer Name */}
                <div className="px-4 sm:px-5 py-2.5 bg-stone-100/70 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-800 text-xs">
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    Your Name (Optional):
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul / Maya"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                  {cart.map((ci) => {
                    const freshItem = liveItems.find((i) => i.id === ci.item.id) || ci.item;
                    const isPriceChanged = freshItem.price !== ci.item.price;

                    return (
                      <div
                        key={ci.item.id}
                        className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/60 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                              {freshItem.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-semibold text-stone-600 dark:text-amber-400">
                                {config.currencySymbol}{freshItem.price} each
                              </span>
                              {isPriceChanged && (
                                <span className="text-[10px] text-amber-500 font-medium flex items-center gap-0.5">
                                  <AlertCircle className="w-3 h-3" /> Updated
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stepper & Trash */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white dark:bg-stone-900 rounded-lg border border-stone-300 dark:border-stone-700 px-1.5 py-0.5 shadow-xs">
                              <button
                                onClick={() => updateQuantity(ci.item.id, -1)}
                                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-stone-900 dark:text-white px-2">
                                {ci.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(ci.item.id, 1)}
                                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(ci.item.id)}
                              className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Cooking / Preparation Note */}
                        <div>
                          {activeNoteItemId === ci.item.id ? (
                            <div className="mt-1">
                              <input
                                type="text"
                                value={ci.itemNotes || ''}
                                onChange={(e) => updateItemNotes(ci.item.id, e.target.value)}
                                placeholder="e.g. Oat milk, no sugar, extra spicy..."
                                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveNoteItemId(ci.item.id)}
                              className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>
                                {ci.itemNotes ? `Note: "${ci.itemNotes}" (edit)` : '+ Add cooking note'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Drawer Footer with Verified WhatsApp Action */}
                <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-3">
                  <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900 dark:text-white">
                        {config.currencySymbol}{subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Service</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Included at counter
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-stone-950 dark:text-white pt-1 border-t border-stone-200 dark:border-stone-800">
                      <span>Total Amount</span>
                      <span className="text-amber-600 dark:text-amber-400">
                        {config.currencySymbol}{subtotal}
                      </span>
                    </div>
                  </div>

                  {/* Tamper-Evident Security Info */}
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 bg-stone-200/50 dark:bg-stone-800/40 p-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Includes cryptographic Order ID & Hash to prevent bill tampering.</span>
                  </div>

                  {/* Primary WhatsApp Order CTA */}
                  <button
                    onClick={handleSendOrder}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.073.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-10.416c-5.518 0-10 4.482-10 10 0 1.91.536 3.701 1.47 5.234l-1.56 5.702 5.86-1.537c1.474.864 3.186 1.365 5.016 1.365 5.518 0 10-4.482 10-10 0-5.518-4.482-10-10-10z" />
                    </svg>
                    <span>Send Order on WhatsApp</span>
                  </button>

                  {/* Fallback Copy Button */}
                  <button
                    onClick={handleCopySummary}
                    className="w-full py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Summary Copied to Clipboard!' : 'Copy Summary (If WhatsApp deep link fails)'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
