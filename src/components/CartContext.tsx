"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { CartItem } from './Cart';

type CartContextType = {
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  cartItems: CartItem[];
  addToCart: (item: any) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalCartCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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
  }), [isCartOpen, cartItems, addToCart, updateQuantity, removeItem, clearCart, totalCartCount]);

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
