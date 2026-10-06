'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CafeConfig, MenuCategory, MenuItem, BookingRecord, TableBookingRequest, PlacedOrder } from '@/types/cafe';
import { defaultCafeConfig, defaultCategories, defaultMenuItems } from '@/config/defaultCafe';

export const initialSampleOrders: PlacedOrder[] = [
  {
    id: 'ORD-7821',
    verificationCode: '8E2A',
    tableNumber: '4',
    customerName: 'Aarav Mehta',
    items: [
      { id: 'item-1', name: 'Melbourne Flat White', price: 240, quantity: 2, itemNotes: 'Oat milk for one' },
      { id: 'item-5', name: 'Almond Croissant', price: 210, quantity: 1 }
    ],
    totalItemsCount: 3,
    subtotal: 690,
    status: 'preparing',
    createdAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'ORD-7822',
    verificationCode: '4F19',
    tableNumber: '2',
    customerName: 'Sneha Rao',
    items: [
      { id: 'item-2', name: 'Spanish Iced Latte', price: 270, quantity: 1 },
      { id: 'item-6', name: 'Truffle Scrambled Toast', price: 340, quantity: 1, itemNotes: 'Less butter' }
    ],
    totalItemsCount: 2,
    subtotal: 610,
    status: 'received',
    createdAt: Date.now() - 1000 * 60 * 5,
  }
];

export const initialSampleBookings: BookingRecord[] = [
  {
    id: 'book-101',
    customerName: 'Aarav Mehta',
    customerPhone: '+91 98451 22334',
    date: '2026-10-04',
    time: '19:30',
    guestCount: 2,
    specialNotes: 'Window table preferred, celebrating anniversary',
    status: 'pending',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'book-102',
    customerName: 'Priya Sharma',
    customerPhone: '+91 97110 54321',
    date: '2026-10-04',
    time: '16:00',
    guestCount: 4,
    specialNotes: 'Quiet corner for client meeting',
    status: 'confirmed',
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'book-103',
    customerName: 'Vikram Joshi',
    customerPhone: '+91 98200 99881',
    date: '2026-10-03',
    time: '20:00',
    guestCount: 6,
    specialNotes: 'Birthday party with cake cutting',
    status: 'confirmed',
    createdAt: Date.now() - 3600000 * 24,
  },
];

interface CafeContextType {
  config: CafeConfig;
  categories: MenuCategory[];
  items: MenuItem[];
  bookings: BookingRecord[];
  orders: PlacedOrder[];
  isOpenNow: boolean;
  toggleItemAvailability: (itemId: string) => void;
  updateItemPrice: (itemId: string, newPrice: number) => void;
  addItem: (item: Omit<MenuItem, 'id'>) => void;
  updateItem: (item: MenuItem) => void;
  deleteItem: (itemId: string) => void;
  addCategory: (category: Omit<MenuCategory, 'id'>) => void;
  updateCategory: (category: MenuCategory) => void;
  deleteCategory: (categoryId: string) => void;
  updateConfig: (newConfig: Partial<CafeConfig>) => void;
  addBooking: (bookingReq: TableBookingRequest) => void;
  updateBookingStatus: (bookingId: string, status: 'pending' | 'confirmed' | 'declined') => void;
  addOrder: (order: PlacedOrder) => void;
  updateOrderStatus: (orderId: string, status: PlacedOrder['status']) => void;
  deleteOrder: (orderId: string) => void;
  resetToDefaults: () => void;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<CafeConfig>(defaultCafeConfig);
  const [categories, setCategories] = useState<MenuCategory[]>(defaultCategories);
  const [items, setItems] = useState<MenuItem[]>(defaultMenuItems);
  const [bookings, setBookings] = useState<BookingRecord[]>(initialSampleBookings);
  const [orders, setOrders] = useState<PlacedOrder[]>(initialSampleOrders);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(true);

  // Load any local overrides for realistic live testing
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('cafe_menu_items');
      if (savedItems) setItems(JSON.parse(savedItems));

      const savedCategories = localStorage.getItem('cafe_categories');
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedConfig = localStorage.getItem('cafe_config');
      if (savedConfig) setConfig(JSON.parse(savedConfig));

      const savedBookings = localStorage.getItem('cafe_bookings');
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      const savedOrders = localStorage.getItem('cafe_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {}
  }, []);

  // Compute live open/closed status based on timings
  useEffect(() => {
    if (config.hours.isOpenOverride !== null && config.hours.isOpenOverride !== undefined) {
      setIsOpenNow(config.hours.isOpenOverride);
      return;
    }
    setIsOpenNow(true);
  }, [config.hours]);

  const toggleItemAvailability = (itemId: string) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      );
      try {
        localStorage.setItem('cafe_menu_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, price: newPrice } : item
      );
      try {
        localStorage.setItem('cafe_menu_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setItems((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('cafe_menu_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateItem = (item: MenuItem) => {
    setItems((prev) => {
      const updated = prev.map((i) => (i.id === item.id ? item : i));
      try {
        localStorage.setItem('cafe_menu_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteItem = (itemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      try {
        localStorage.setItem('cafe_menu_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addCategory = (cat: Omit<MenuCategory, 'id'>) => {
    const newCat: MenuCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem('cafe_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateCategory = (cat: MenuCategory) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === cat.id ? cat : c));
      try {
        localStorage.setItem('cafe_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== categoryId);
      try {
        localStorage.setItem('cafe_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateConfig = (newConfig: Partial<CafeConfig>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        ...newConfig,
        contact: { ...prev.contact, ...(newConfig.contact || {}) },
        hours: { ...prev.hours, ...(newConfig.hours || {}) },
        theme: { ...prev.theme, ...(newConfig.theme || {}) },
        enabledModules: { ...prev.enabledModules, ...(newConfig.enabledModules || {}) },
      };
      try {
        localStorage.setItem('cafe_config', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addBooking = (bookingReq: TableBookingRequest) => {
    const newBooking: BookingRecord = {
      ...bookingReq,
      id: `book-${Date.now()}`,
      status: 'pending',
      createdAt: Date.now(),
    };
    setBookings((prev) => {
      const updated = [newBooking, ...prev];
      try {
        localStorage.setItem('cafe_bookings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateBookingStatus = (bookingId: string, status: 'pending' | 'confirmed' | 'declined') => {
    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === bookingId ? { ...b, status } : b));
      try {
        localStorage.setItem('cafe_bookings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addOrder = (order: PlacedOrder) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem('cafe_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateOrderStatus = (orderId: string, status: PlacedOrder['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem('cafe_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem('cafe_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetToDefaults = () => {
    setItems(defaultMenuItems);
    setConfig(defaultCafeConfig);
    setCategories(defaultCategories);
    setBookings(initialSampleBookings);
    setOrders(initialSampleOrders);
    try {
      localStorage.removeItem('cafe_menu_items');
      localStorage.removeItem('cafe_categories');
      localStorage.removeItem('cafe_config');
      localStorage.removeItem('cafe_bookings');
      localStorage.removeItem('cafe_orders');
    } catch {}
  };

  return (
    <CafeContext.Provider
      value={{
        config,
        categories,
        items,
        bookings,
        orders,
        isOpenNow,
        toggleItemAvailability,
        updateItemPrice,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        updateCategory,
        deleteCategory,
        updateConfig,
        addBooking,
        updateBookingStatus,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        resetToDefaults,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
}
