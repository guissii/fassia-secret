"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activePromo, setActivePromo] = useState<ActivePromo | null>(null);

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
