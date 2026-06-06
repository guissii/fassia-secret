"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { CartItem } from './Cart';

export interface ActivePromo {
  code: string;
  type: 'FIXED' | 'PERCENTAGE' | 'CLIENT' | 'WHOLESALE';
  value: number;
}

type CartContextType = {
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  cartItems: CartItem[];
  addToCart: (item: any) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalCartCount: number;
  activePromo: ActivePromo | null;
  setActivePromo: (promo: ActivePromo | null) => void;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'fassia_cart';
const PROMO_STORAGE_KEY = 'fassia_promo';

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activePromo, setActivePromo] = useState<ActivePromo | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Charger depuis localStorage au montage (client-side only)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) setCartItems(JSON.parse(savedCart));
      const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (savedPromo) setActivePromo(JSON.parse(savedPromo));
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (activePromo) {
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(activePromo));
    } else {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  }, [activePromo, hydrated]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = useCallback((p: any) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === p.id);
      if (existing) {
        return prev.map((it) => (it.id === p.id ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          price: p.price,
          oldPrice: typeof p.oldPrice === 'number' ? p.oldPrice : undefined,
          promoPrice: typeof p.promoPrice === 'number' ? p.promoPrice : undefined,
          wholesalePrice: typeof p.wholesalePrice === 'number' ? p.wholesalePrice : undefined,
          bulkWholesalePrice: typeof p.bulkWholesalePrice === 'number' ? p.bulkWholesalePrice : undefined,
          image: p.image,
          category: p.category,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }, []);

  const removeItem = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setActivePromo(null);
  }, []);

  const contextValue = useMemo(() => ({
    isCartOpen,
    setIsCartOpen,
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalCartCount,
    activePromo,
    setActivePromo,
  }), [isCartOpen, cartItems, addToCart, updateQuantity, removeItem, clearCart, totalCartCount, activePromo]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
