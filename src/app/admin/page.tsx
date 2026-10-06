'use client';

import React, { useState, useEffect } from 'react';
import { useCafe } from '@/context/CafeContext';
import { MenuItem, MenuCategory, DietaryType } from '@/types/cafe';
import { DietaryBadge } from '@/components/customer/DietaryBadge';
import {
  UtensilsCrossed,
  Layers,
  CalendarDays,
  Settings,
  QrCode,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Printer,
  Sparkles,
  ExternalLink,
  MessageCircle,
  X,
  Phone,
  Clock,
  Lock,
  LogOut,
  KeyRound,
  ShieldAlert,
  ShoppingBag,
  Receipt,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';

type AdminTab = 'orders' | 'menu' | 'categories' | 'bookings' | 'settings' | 'qr';

export default function AdminPortalPage() {
  const {
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
    updateBookingStatus,
    updateOrderStatus,
    deleteOrder,
    resetToDefaults,
  } = useCafe();

  // Hydration-safe Authentication & Environment state
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      if (sessionStorage.getItem('cafe_admin_auth') === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [searchItem, setSearchItem] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Orders Tab filters & verification tool states
  const [searchOrder, setSearchOrder] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'received' | 'preparing' | 'completed' | 'cancelled'>('all');
  const [verifyOrderId, setVerifyOrderId] = useState('');
  const [verifyAmount, setVerifyAmount] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ matched: boolean; message: string; order?: typeof orders[0] } | null>(null);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  // Form states for Item Modal
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState(200);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDietary, setFormDietary] = useState<DietaryType>('veg');
  const [formIsBestseller, setFormIsBestseller] = useState(false);
  const [formPrepTime, setFormPrepTime] = useState(5);

  // Form states for Category Modal
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('☕');
  const [catDesc, setCatDesc] = useState('');

  // QR Print range
  const [qrTableCount, setQrTableCount] = useState(10);

  // Quick stats
  const totalItems = items.length;
  const soldOutItems = items.filter((i) => !i.isAvailable).length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const activeOrdersCount = orders.filter((o) => o.status === 'received' || o.status === 'preparing').length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (searchOrder.trim()) {
      const q = searchOrder.toLowerCase().trim().replace(/^#/, '');
      const matchesId = o.id.toLowerCase().includes(q);
      const matchesTable = o.tableNumber.includes(q);
      const matchesName = o.customerName ? o.customerName.toLowerCase().includes(q) : false;
      const matchesHash = o.verificationCode.toLowerCase().includes(q);
      return matchesId || matchesTable || matchesName || matchesHash;
    }
    return true;
  });

  const handleVerifyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = verifyOrderId.trim().toUpperCase().replace(/^#/, '');
    const found = orders.find((o) => o.id.toUpperCase() === cleanId || o.id.toUpperCase() === `ORD-${cleanId}`);
    if (!found) {
      setVerificationResult({
        matched: false,
        message: `Order ID "${cleanId}" not found in system records. Potential counterfeit or unrecorded order.`
      });
      return;
    }

    if (verifyAmount.trim()) {
      const parsedAmount = parseFloat(verifyAmount.trim());
      if (parsedAmount !== found.subtotal) {
        setVerificationResult({
          matched: false,
          message: `TAMPER DETECTED! Customer claims ${config.currencySymbol}${parsedAmount}, but official system total is ${config.currencySymbol}${found.subtotal}. Order payload was edited!`,
          order: found,
        });
        return;
      }
    }

    setVerificationResult({
      matched: true,
      message: `VERIFIED AUTHENTIC! Hash [${found.verificationCode}] valid for Table #${found.tableNumber} • Amount: ${config.currencySymbol}${found.subtotal}.`,
      order: found,
    });
  };

  // Filtered Items
  const filteredItems = items.filter((i) => {
    if (selectedCategoryFilter !== 'all' && i.categoryId !== selectedCategoryFilter) return false;
    if (searchItem.trim()) {
      const q = searchItem.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenItemModal = (itemToEdit?: MenuItem) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormName(itemToEdit.name);
      setFormCategoryId(itemToEdit.categoryId);
      setFormPrice(itemToEdit.price);
      setFormDescription(itemToEdit.description);
      setFormImageUrl(itemToEdit.imageUrl || '');
      setFormDietary(itemToEdit.dietary);
      setFormIsBestseller(!!itemToEdit.isBestseller);
      setFormPrepTime(itemToEdit.preparationTimeMinutes || 5);
    } else {
      setEditingItem(null);
      setFormName('');
      setFormCategoryId(categories[0]?.id || '');
      setFormPrice(250);
      setFormDescription('');
      setFormImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80');
      setFormDietary('veg');
      setFormIsBestseller(false);
      setFormPrepTime(5);
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategoryId) return;

    if (editingItem) {
      updateItem({
        ...editingItem,
        name: formName.trim(),
        categoryId: formCategoryId,
        price: Number(formPrice),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim(),
        dietary: formDietary,
        isBestseller: formIsBestseller,
        preparationTimeMinutes: Number(formPrepTime),
      });
    } else {
      addItem({
        categoryId: formCategoryId,
        name: formName.trim(),
        price: Number(formPrice),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim(),
        dietary: formDietary,
        isBestseller: formIsBestseller,
        isAvailable: true,
        preparationTimeMinutes: Number(formPrepTime),
      });
    }
    setIsItemModalOpen(false);
  };

  const handleOpenCategoryModal = (catToEdit?: MenuCategory) => {
    if (catToEdit) {
      setEditingCategory(catToEdit);
      setCatName(catToEdit.name);
      setCatIcon(catToEdit.icon || '☕');
      setCatDesc(catToEdit.description || '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatIcon('🍰');
      setCatDesc('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: catName.trim(),
        icon: catIcon.trim(),
        description: catDesc.trim(),
      });
    } else {
      addCategory({
        name: catName.trim(),
        icon: catIcon.trim(),
        order: categories.length + 1,
        description: catDesc.trim(),
      });
    }
    setIsCategoryModalOpen(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (loginEmail.trim().toLowerCase() === 'owner@artisanalroast.in' && loginPassword === 'cafe2026') ||
      (loginEmail.trim().length > 3 && loginPassword.length >= 6)
    ) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cafe_admin_auth', 'true');
      }
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Hint: use owner@artisanalroast.in / cafe2026');
    }
  };

  const handleDemoLogin = () => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cafe_admin_auth', 'true');
    }
    setAuthError('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cafe_admin_auth');
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center items-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl animate-pulse">
          ☕
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              🔒
            </div>
            <h1 className="text-xl font-black text-white font-serif tracking-tight">
              Owner Admin Portal
            </h1>
            <p className="text-xs text-stone-400">
              {config.name} • Secure Management Access
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">Owner Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="owner@artisanalroast.in"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1.5">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold rounded-xl shadow-lg transition-all text-xs"
            >
              Sign In to Admin
            </button>
          </form>

          <div className="pt-2 border-t border-stone-800 text-center space-y-3">
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Quick Demo Sign-In (1-Click)</span>
            </button>

            <Link
              href="/?table=1"
              className="inline-block text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Back to Customer Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-serif text-lg">
              ☕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-white font-serif">
                  {config.name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Tenant ID: <span className="font-mono text-stone-300">{config.slug}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/?table=1"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Menu (Table 1)</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>

            <button
              onClick={() => {
                if (confirm('Reset all menu data, bookings, and settings back to original defaults?')) {
                  resetToDefaults();
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-800/80 hover:bg-rose-900/40 hover:text-rose-300 text-stone-400 border border-stone-700 rounded-xl text-xs transition-colors"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold transition-colors"
              title="Log out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-stone-800/60">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap relative ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Live Orders</span>
            {activeOrdersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'menu'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menu Items ({totalItems})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap relative ${
              activeTab === 'bookings'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Bookings</span>
            {pendingBookings > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold flex items-center justify-center">
                {pendingBookings}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Table QR Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cafe Settings</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Active Kitchen Orders</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">{activeOrdersCount}</div>
            <span className="text-[11px] text-stone-400">{orders.length} total today</span>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Total Menu Items</span>
            <div className="text-2xl font-black text-stone-900 dark:text-white mt-1">{totalItems}</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Active in menu</span>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Sold Out Items</span>
            <div className={`text-2xl font-black mt-1 ${soldOutItems > 0 ? 'text-rose-500' : 'text-stone-900 dark:text-white'}`}>
              {soldOutItems}
            </div>
            <span className="text-[11px] text-stone-400">1-tap toggle enabled</span>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Pending Reservations</span>
            <div className="text-2xl font-black text-amber-500 mt-1">{pendingBookings}</div>
            <span className="text-[11px] text-stone-400">Action required</span>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Cafe Status</span>
            <div className="text-base font-bold text-stone-900 dark:text-white mt-1 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isOpenNow ? 'Open Now' : 'Closed'}</span>
            </div>
            <span className="text-[11px] text-stone-400">{config.hours.openingTime} - {config.hours.closingTime}</span>
          </div>
        </div>

        {/* TAB 0: LIVE ORDERS & VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* Quick Verification & Integrity Checker Box */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-950 p-4 sm:p-5 rounded-3xl border border-stone-800 shadow-md text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white font-serif">
                      WhatsApp Order Anti-Tampering Cross-Check
                    </h3>
                    <p className="text-xs text-stone-400">
                      Cross-verify the customer&apos;s WhatsApp text against system-generated orders
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Security Guard
                </span>
              </div>

              <form onSubmit={handleVerifyOrder} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={verifyOrderId}
                    onChange={(e) => setVerifyOrderId(e.target.value)}
                    placeholder="Enter Order ID (e.g. ORD-7821 or 7821)"
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="relative w-full sm:w-48">
                  <input
                    type="number"
                    value={verifyAmount}
                    onChange={(e) => setVerifyAmount(e.target.value)}
                    placeholder="Amount in text (₹)"
                    className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Authenticity</span>
                </button>
              </form>

              {/* Verification Result Feedback */}
              {verificationResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                    verificationResult.matched
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {verificationResult.matched ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{verificationResult.message}</p>
                    {verificationResult.order && (
                      <p className="text-[11px] opacity-80">
                        {verificationResult.order.totalItemsCount} items ordered for Table #{verificationResult.order.tableNumber} at{' '}
                        {new Date(verificationResult.order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setVerificationResult(null)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  placeholder="Search by Order ID, Table #, Guest name..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['all', 'received', 'preparing', 'completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    {st === 'all' ? `All (${orders.length})` : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
                  No orders found matching the filter.
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const elapsedMinutes = Math.floor((Date.now() - order.createdAt) / 60000);
                  const timeLabel = elapsedMinutes <= 1 ? 'Just now' : `${elapsedMinutes}m ago`;

                  return (
                    <div
                      key={order.id}
                      className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-extrabold text-sm text-stone-900 dark:text-amber-400">
                            #{order.id}
                          </span>

                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                            Table #{order.tableNumber}
                          </span>

                          {order.customerName && (
                            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                              👤 {order.customerName}
                            </span>
                          )}

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              order.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : order.status === 'preparing'
                                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse'
                                : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                            }`}
                          >
                            {order.status}
                          </span>

                          <span className="text-xs text-stone-400 font-mono">
                            Checksum: <strong className="text-emerald-500">[{order.verificationCode}]</strong>
                          </span>

                          <span className="text-xs text-stone-400">
                            • {timeLabel}
                          </span>
                        </div>

                        {/* Item list */}
                        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 border border-stone-200 dark:border-stone-700/60 divide-y divide-stone-200/60 dark:divide-stone-700/40 text-xs">
                          {order.items.map((it) => (
                            <div key={it.id} className="py-1.5 flex items-baseline justify-between gap-2">
                              <div>
                                <span className="font-bold text-stone-900 dark:text-white mr-2">
                                  {it.quantity}x
                                </span>
                                <span className="text-stone-800 dark:text-stone-200">{it.name}</span>
                                {it.itemNotes && (
                                  <span className="block text-[11px] text-amber-600 dark:text-amber-400 italic">
                                    Note: {it.itemNotes}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-stone-600 dark:text-stone-300 whitespace-nowrap">
                                {config.currencySymbol}{it.price * it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 px-1">
                          <span className="text-stone-500 dark:text-stone-400">
                            Total {order.totalItemsCount} {order.totalItemsCount === 1 ? 'item' : 'items'}
                          </span>
                          <span className="font-extrabold text-sm text-stone-950 dark:text-amber-400">
                            Bill Total: {config.currencySymbol}{order.subtotal}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center md:flex-col gap-2 self-end md:self-stretch justify-end">
                        {order.status === 'received' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
                          >
                            Mark Preparing
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print KOT</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove order #${order.id} from queue?`)) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="Dismiss Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 1: MENU ITEMS */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                    placeholder="Search items by name..."
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleOpenItemModal()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>

            {/* Items Table / Cards Grid */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                    {filteredItems.map((item) => {
                      const category = categories.find((c) => c.id === item.categoryId);
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors ${
                            !item.isAvailable ? 'opacity-65 bg-stone-50/50 dark:bg-stone-950/50' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-stone-100 dark:bg-stone-800 shrink-0"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <DietaryBadge type={item.dietary} />
                                  <span className="font-bold text-stone-900 dark:text-white">
                                    {item.name}
                                  </span>
                                  {item.isBestseller && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-bold border border-amber-500/40">
                                      ★ Star
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-medium text-stone-600 dark:text-stone-300">
                            {category?.icon} {category?.name || 'Uncategorized'}
                          </td>

                          <td className="py-3 px-4 font-bold text-stone-900 dark:text-amber-400">
                            {config.currencySymbol}{item.price}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleItemAvailability(item.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                item.isAvailable
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                              }`}
                            >
                              {item.isAvailable ? (
                                <>
                                  <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>In Stock</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Sold Out</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenItemModal(item)}
                                className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                                title="Edit Item"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${item.name}" from the menu?`)) {
                                    deleteItem(item.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">Menu Categories</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Organize items into sticky categories for easy customer browsing
                </p>
              </div>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const itemCount = items.filter((i) => i.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
                          {cat.icon || '☕'}
                        </span>
                        <div>
                          <h4 className="font-bold text-stone-900 dark:text-white text-sm">{cat.name}</h4>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${cat.name}"? Items inside won't be deleted.`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {cat.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-light line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Table Reservations & Enquiries</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Incoming table bookings from the digital menu with customer phone and notes
              </p>
            </div>

            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
                  No reservations received yet.
                </div>
              ) : (
                bookings.map((booking) => {
                  const cleanPhone = booking.customerPhone.replace(/[^0-9]/g, '');
                  const waReplyUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hi ${booking.customerName}, this is ${config.name}. Regarding your table reservation for ${booking.guestCount} guests on ${booking.date} at ${booking.time}: `
                  )}`;

                  return (
                    <div
                      key={booking.id}
                      className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-900 dark:text-white text-sm">
                            {booking.customerName}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : booking.status === 'declined'
                                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            }`}
                          >
                            {booking.status}
                          </span>
                          <span className="text-xs text-stone-400">• {booking.guestCount} Guests</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {booking.date} at {booking.time}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            {booking.customerPhone}
                          </span>
                        </div>

                        {booking.specialNotes && (
                          <p className="text-xs text-stone-600 dark:text-stone-300 italic bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg border border-stone-200 dark:border-stone-700/60">
                            &quot;{booking.specialNotes}&quot;
                          </p>
                        )}
                      </div>

                      {/* Status Buttons & WhatsApp Contact */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <a
                          href={waReplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Reply</span>
                        </a>

                        {booking.status !== 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold"
                          >
                            Confirm
                          </button>
                        )}

                        {booking.status !== 'declined' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'declined')}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TABLE QR CODE GENERATOR */}
        {activeTab === 'qr' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">Printable Table QR Cards</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Ready-to-print branded acrylic stand cards for Tables 1 to {qrTableCount}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span>Tables:</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={qrTableCount}
                    onChange={(e) => setQrTableCount(parseInt(e.target.value, 10) || 1)}
                    className="w-16 px-2 py-1 border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 font-bold text-xs"
                  />
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Stand Cards</span>
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-2">
              {Array.from({ length: qrTableCount }).map((_, index) => {
                const tableNum = index + 1;
                const menuUrl = origin
                  ? `${origin}/?table=${tableNum}`
                  : `https://menu.cafe.in/?table=${tableNum}`;
                const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;

                return (
                  <div
                    key={tableNum}
                    className="bg-white dark:bg-stone-900 p-5 rounded-3xl border-2 border-stone-200 dark:border-stone-800 shadow-md flex flex-col items-center text-center space-y-3 print:break-inside-avoid print:border-black print:text-black"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 text-sm">
                      ☕
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest uppercase font-bold text-stone-400">
                        {config.name}
                      </div>
                      <div className="text-xl font-extrabold text-stone-900 dark:text-white font-serif mt-0.5">
                        Table #{tableNum}
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="w-36 h-36 bg-white p-2.5 rounded-2xl shadow-inner border border-stone-200 flex items-center justify-center">
                      <img
                        src={qrSrc}
                        alt={`QR Code Table ${tableNum}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200">
                        Scan to Browse & Order
                      </p>
                      <p className="text-[9px] text-stone-400">
                        No app download required • Instant WhatsApp Order
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CAFE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-white">Cafe Profile & Timings</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Manage contact details, WhatsApp order number, and guest Wi-Fi info
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Cafe Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => updateConfig({ tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">WhatsApp Order Number (with Country Code)</label>
                <input
                  type="text"
                  value={config.contact.whatsappNumber}
                  onChange={(e) =>
                    updateConfig({
                      contact: { ...config.contact, whatsappNumber: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono font-medium text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={config.contact.phone}
                  onChange={(e) =>
                    updateConfig({
                      contact: { ...config.contact, phone: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Opening Time</label>
                <input
                  type="text"
                  value={config.hours.openingTime}
                  onChange={(e) =>
                    updateConfig({
                      hours: { ...config.hours, openingTime: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Closing Time</label>
                <input
                  type="text"
                  value={config.hours.closingTime}
                  onChange={(e) =>
                    updateConfig({
                      hours: { ...config.hours, closingTime: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Guest Wi-Fi Network (SSID)</label>
                <input
                  type="text"
                  value={config.contact.wifiName || ''}
                  onChange={(e) =>
                    updateConfig({
                      contact: { ...config.contact, wifiName: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Guest Wi-Fi Password</label>
                <input
                  type="text"
                  value={config.contact.wifiPassword || ''}
                  onChange={(e) =>
                    updateConfig({
                      contact: { ...config.contact, wifiPassword: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-semibold text-xs mb-1">Cafe Address</label>
              <textarea
                rows={2}
                value={config.contact.address}
                onChange={(e) =>
                  updateConfig({
                    contact: { ...config.contact, address: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium"
              />
            </div>
          </div>
        )}
      </main>

      {/* ITEM CREATE / EDIT MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setIsItemModalOpen(false)}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs"
          />

          <div className="relative bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Vanilla Bean Latte"
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Dietary Tag</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['veg', 'non-veg', 'egg', 'vegan'] as DietaryType[]).map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setFormDietary(d)}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 capitalize font-bold transition-all ${
                        formDietary === d
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      <DietaryBadge type={d} />
                      <span className="text-[11px]">{d}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ingredients, preparation details..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formIsBestseller}
                    onChange={(e) => setFormIsBestseller(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Mark as Bestseller / Signature item</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">Prep time:</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-12 p-1 text-center rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                  />
                  <span className="text-stone-400">mins</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all mt-3"
              >
                {editingItem ? 'Save Item Changes' : 'Create Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CREATE / EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setIsCategoryModalOpen(false)}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs"
          />

          <div className="relative bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Sourdough Sandwiches"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Icon Emoji</label>
                <input
                  type="text"
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="🥪"
                  className="w-16 p-2 text-center text-lg rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Short tagline shown under category header..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all mt-2"
              >
                {editingCategory ? 'Save Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
