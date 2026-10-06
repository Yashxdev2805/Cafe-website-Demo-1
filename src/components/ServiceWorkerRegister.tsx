'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const ServiceWorkerRegister: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for offline PWA caching
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.error('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Track online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <aside
          aria-label="Offline status"
          className="fixed top-0 left-0 right-0 z-50 bg-stone-900/95 border-b border-amber-500/50 text-amber-300 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md animate-in slide-in-from-top duration-300"
        >
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Offline Mode: You are viewing the cached menu. Connect to internet to send WhatsApp orders.</span>
        </aside>
      )}

      {/* Back Online Toast */}
      {showReconnected && (
        <aside
          aria-label="Online status"
          className="fixed top-0 left-0 right-0 z-50 bg-emerald-900/95 border-b border-emerald-500 text-emerald-200 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md animate-in slide-in-from-top duration-300"
        >
          <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Back online. Live menu sync re-established.</span>
        </aside>
      )}
    </>
  );
};
