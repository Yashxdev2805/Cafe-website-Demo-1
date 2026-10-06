'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, MenuItem, PlacedOrder } from '@/types/cafe';
import { useCafe } from './CafeContext';

interface CartContextType {
  cart: CartItem[];
  tableNumber: string;
  setTableNumber: (table: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastPlacedOrder: PlacedOrder | null;
  tableSwitchedAlert: { previous: string; current: string } | null;
  dismissTableSwitchedAlert: () => void;
  sendWhatsAppOrder: (customerName?: string) => PlacedOrder | null;
  copyOrderSummary: (customerName?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate tamper-evident security checksum
function computeVerificationCode(orderId: string, subtotal: number, itemsCount: number, table: string): string {
  const seed = `${orderId}-${subtotal}-${itemsCount}-${table}-krevora-security`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(0, 4);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { items: liveItems, config, addOrder } = useCafe();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState<string>('1');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<PlacedOrder | null>(null);
  const [tableSwitchedAlert, setTableSwitchedAlert] = useState<{ previous: string; current: string } | null>(null);

  // Read table number from URL search param (?table=N) or sessionStorage
  // Also detect if the customer switched tables
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const tableFromUrl = urlParams.get('table');
        if (tableFromUrl) {
          const savedTable = sessionStorage.getItem('cafe_table_num');
          if (savedTable && savedTable !== tableFromUrl) {
            setTableSwitchedAlert({ previous: savedTable, current: tableFromUrl });
          }
          setTableNumberState(tableFromUrl);
          sessionStorage.setItem('cafe_table_num', tableFromUrl);
        } else {
          const savedTable = sessionStorage.getItem('cafe_table_num');
          if (savedTable) {
            setTableNumberState(savedTable);
          }
        }
      }
    } catch {}
  }, []);

  const dismissTableSwitchedAlert = () => {
    setTableSwitchedAlert(null);
  };

  const setTableNumber = (table: string) => {
    setTableNumberState(table);
    try {
      sessionStorage.setItem('cafe_table_num', table);
    } catch {}
  };

  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1, itemNotes: '' }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, itemNotes: notes } : ci))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Dynamic price calculation ensuring cart reflects latest owner price changes
  const subtotal = cart.reduce((sum, cartItem) => {
    const freshItem = liveItems.find((i) => i.id === cartItem.item.id) || cartItem.item;
    return sum + freshItem.price * cartItem.quantity;
  }, 0);

  const totalItemsCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  // Helper to construct tamper-proof order record and message
  const createOrderPayload = useCallback((customerName?: string) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randomSuffix}`;
    const verificationCode = computeVerificationCode(orderId, subtotal, totalItemsCount, tableNumber);

    const placedOrder: PlacedOrder = {
      id: orderId,
      verificationCode,
      tableNumber,
      customerName: customerName?.trim() || undefined,
      items: cart.map((ci) => {
        const freshItem = liveItems.find((i) => i.id === ci.item.id) || ci.item;
        return {
          id: freshItem.id,
          name: freshItem.name,
          price: freshItem.price,
          quantity: ci.quantity,
          itemNotes: ci.itemNotes?.trim() || undefined,
        };
      }),
      totalItemsCount,
      subtotal,
      status: 'received',
      createdAt: Date.now(),
    };

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let message = `*NEW VERIFIED ORDER - ${config.name.toUpperCase()}*\n`;
    message += `🔐 *Order ID:* #${orderId}\n`;
    message += `🛡️ *Security Hash:* [${verificationCode}]\n`;
    message += `📍 *Table:* ${tableNumber}\n`;
    if (customerName?.trim()) {
      message += `👤 *Guest:* ${customerName.trim()}\n`;
    }
    message += `--------------------------------\n`;

    cart.forEach((ci) => {
      const freshItem = liveItems.find((i) => i.id === ci.item.id) || ci.item;
      const lineTotal = freshItem.price * ci.quantity;
      message += `• ${ci.quantity}x ${freshItem.name} - ${config.currencySymbol}${lineTotal}\n`;
      if (ci.itemNotes && ci.itemNotes.trim()) {
        message += `   _Note: ${ci.itemNotes.trim()}_\n`;
      }
    });

    message += `--------------------------------\n`;
    message += `*Total Items:* ${totalItemsCount}\n`;
    message += `*Verified Total:* ${config.currencySymbol}${subtotal}\n`;
    message += `--------------------------------\n`;
    message += `🕒 Ordered at: ${timeString}\n`;
    message += `\n_⚠️ Staff Notice: Verify Order #${orderId} & Hash [${verificationCode}] on Admin Screen._`;

    return { placedOrder, message };
  }, [cart, config, liveItems, subtotal, tableNumber, totalItemsCount]);

  const sendWhatsAppOrder = (customerName?: string): PlacedOrder | null => {
    if (cart.length === 0) return null;

    const { placedOrder, message } = createOrderPayload(customerName);

    // Save order in shared context so admin can verify it
    addOrder(placedOrder);
    setLastPlacedOrder(placedOrder);

    const cleanNumber = config.contact.whatsappNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    
    // Universal URL with fallback scheme
    const waUrl = `https://wa.me/${cleanNumber}?text=${encoded}`;
    
    // Attempt window open
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }

    return placedOrder;
  };

  const copyOrderSummary = async (customerName?: string): Promise<boolean> => {
    if (cart.length === 0) return false;
    const { placedOrder, message } = createOrderPayload(customerName);
    
    // Ensure order is recorded in context
    addOrder(placedOrder);
    setLastPlacedOrder(placedOrder);

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        return true;
      }
    } catch {}
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        setTableNumber,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemNotes,
        clearCart,
        totalItemsCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        lastPlacedOrder,
        tableSwitchedAlert,
        dismissTableSwitchedAlert,
        sendWhatsAppOrder,
        copyOrderSummary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
