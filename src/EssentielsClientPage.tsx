"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from './components/CartContext';
import { publicAssetUrl } from './lib/publicUrl';
import { ALL_PRODUCTS } from './data/products';
import { productHref } from './lib/productSlug';
import { ProductCard } from './components/ProductCard';
import './styles/CollectionLayout.css';

export default function EssentielsClientPage() {
  const router = useRouter();
  const { addToCart } = useCart();

  const essentials = ALL_PRODUCTS.filter((p) => p.category === 'K-Beauty');

  return (
    <>
      <main className="collection-page">
        <section className="essentials-section py-3xl">
          <div className="container">
            <div className="section-header-premium mb-2xl">
              <h1 className="section-title-premium">Nos Essentiels</h1>
              <div className="section-ornament-premium" aria-hidden="true" />
            </div>

            <div className="essentials-carousel">
              <div className="essentials-hero-pair">
                <div className="essentials-visual-tile">
                  <img
                    src={publicAssetUrl('ca  quon va utiiser.png')}
                    alt="Centella Visuel"
                    className="essentials-visual-img"
                    loading="lazy"
                  />
                  <div className="kb-visual-overlay">
                    <span className="kb-overlay-step">ESSENTIELS</span>
                    <h3 className="kb-overlay-title">K-Beauty</h3>
                  </div>
                </div>

                {essentials.slice(0, 1).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    label={p.brand}
                    onNavigate={() => router.push(productHref(p))}
                    onAddToCart={() => addToCart(p)}
                  />
                ))}
              </div>

              {essentials.slice(1).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  label={p.brand}
                  onNavigate={() => router.push(productHref(p))}
                  onAddToCart={() => addToCart(p)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
