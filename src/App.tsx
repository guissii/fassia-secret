"use client";

import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductSection } from './components/ProductSection';
import { Categories } from './components/Categories';
import { Brands } from './components/Brands';
import { Footer } from './components/Footer';
import { Cart, type CartItem } from './components/Cart';
import { EssentialsSection } from './components/EssentialsSection';
import { IngredientsSection } from './components/IngredientsSection';
import { MakeupParfumsSection } from './components/MakeupParfumsSection';
import { KoreanRoutineSection } from './components/KoreanRoutineSection';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Demo cart items matching the product style
const DEMO_CART_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Derma Hydrating Serum",
    price: 180.00,
    image: "19bd7403-d2ac-49a4-a584-be5895add421.png",
    category: "Visage",
    quantity: 1,
  },
  {
    id: 2,
    name: "Hydra Boost Gel Cream",
    price: 199.00,
    oldPrice: 249.00,
    image: "d6f902fd-0b09-48d0-8055-d03094820431.png",
    category: "Visage",
    quantity: 2,
  },
];

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(DEMO_CART_ITEMS);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function handleUpdateQuantity(id: number, quantity: number) {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  }

  function handleRemoveItem(id: number) {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="app-container">
      <Header onCartOpen={() => setIsCartOpen(true)} cartCount={totalCartCount} />
      <main>
        <Hero />

        <EssentialsSection />
        <MakeupParfumsSection />

        <IngredientsSection />

        <ProductSection title="Meilleures Ventes" showFooter seeMoreHref="/boutique" />

        <Categories />

        <KoreanRoutineSection />

        <Brands />

        <div className="section-footer text-center mt-2xl">
          <Link href="/boutique" className="see-more-products-cta mt-lg mx-auto" style={{ display: 'inline-flex' }}>
            <span>VOIR PLUS DE PRODUITS</span> <ArrowRight size={16} />
          </Link>
        </div>
      </main>
      <Footer />

      {/* Cart Drawer */}
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

export default App;
