'use client';

import React from 'react';
import { CafeProvider } from '@/context/CafeContext';
import { CartProvider } from '@/context/CartContext';
import { ServiceWorkerRegister } from './ServiceWorkerRegister';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CafeProvider>
      <CartProvider>
        <ServiceWorkerRegister />
        {children}
      </CartProvider>
    </CafeProvider>
  );
}
