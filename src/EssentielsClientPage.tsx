"use client";

import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Cart, type CartItem } from './components/Cart';
import { ESSENTIALS_PRODUCTS } from './components/EssentialsSection';
import { publicAssetUrl } from './lib/publicUrl';

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

export default function EssentielsClientPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(DEMO_CART_ITEMS);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function handleUpdateQuantity(id: number, quantity: number) {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  function handleRemoveItem(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  const formatPrice = (price: number) => {
    return price.toFixed(2) + ' MAD';
  };

  return (
    <div className="app-container">
      <Header onCartOpen={() => setIsCartOpen(true)} cartCount={totalCartCount} />
      <main>
        <section className="essentials-page py-3xl">
          <div className="container">
            <div className="section-header-premium mb-2xl">
              <h1 className="section-title-premium">Nos Essentiels</h1>
              <div className="section-ornament-premium" aria-hidden="true" />
            </div>

            <div className="essentials-grid">
              {ESSENTIALS_PRODUCTS.map((p) => (
                <article key={p.id} className="essential-card">
                  <div className="essential-image-area">
                    {p.badge && <span className="essential-badge-left">{p.badge}</span>}
                    <div className="essential-badge-right" aria-label="Ajouter aux favoris">
                      <Heart size={18} strokeWidth={2} />
                    </div>
                    <img src={publicAssetUrl(p.image)} alt={p.name} className="essential-image" loading="lazy" />
                  </div>
                  <div className="essential-content">
                    <span className="essential-brand">{p.brand}</span>
                    <h3 className="essential-title">{p.name}</h3>
                    <p className="essential-desc">{p.description}</p>
                    <div className="essential-footer">
                      <div className="essential-price-group">
                        <span className="essential-price">{formatPrice(p.price)}</span>
                        {p.oldPrice && <span className="essential-price-old">{formatPrice(p.oldPrice)}</span>}
                      </div>
                      <button className="essential-cta" aria-label="Ajouter au panier">
                        <ShoppingBag size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
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

