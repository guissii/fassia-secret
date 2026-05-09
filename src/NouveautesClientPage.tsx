"use client";

import { useState } from 'react';
import { Header } from './components/Header';
import { ProductSection } from './components/ProductSection';
import { Footer } from './components/Footer';
import { Cart, type CartItem } from './components/Cart';

const DEMO_CART_ITEMS: CartItem[] = [
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
    image: 'd6f902fd-0b09-48d0-8055-d03094820431.png',
    category: 'Visage',
    quantity: 2,
  },
];

export default function NouveautesClientPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(DEMO_CART_ITEMS);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function handleUpdateQuantity(id: number, quantity: number) {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  function handleRemoveItem(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="app-container">
      <Header onCartOpen={() => setIsCartOpen(true)} cartCount={totalCartCount} />
      <main>
        <ProductSection title="Nouveautés" showFooter />
      </main>
      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}
