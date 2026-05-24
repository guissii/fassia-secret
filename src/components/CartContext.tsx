"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { CartItem } from './Cart';

type CartContextType = {
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  cartItems: CartItem[];
  addToCart: (item: any) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  totalCartCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Derma Hydrating Serum',
      price: 180.0,
      image: '19bd7403-d2ac-49a4-a584-be5895add421.png',
      category: 'Visage',
      quantity: 1,
    },
    {
      id: 2,
      name: 'Hydra Boost Gel Cream',
      price: 199.0,
      oldPrice: 249.0,
      image: '19bd7403-d2ac-49a4-a584-be5895add421.png',
      category: 'Visage',
      quantity: 2,
    },
  ]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (p: any) => {
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
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        setIsCartOpen,
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        totalCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
