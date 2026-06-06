"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import { productHref } from '../lib/productSlug';

export function EssentialsSection({ products }: { products: any[] }) {
  const router = useRouter();
  const { addToCart } = useCart();

  if (products.length === 0) return null;

  return (
    <section className="essentials-section">
      <div className="container">
        <div className="essentials-header-row">
          <div className="essentials-title-group">
            <h2 className="essentials-title">HMIZAT</h2>
          </div>
        </div>
        <div className="promo-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              label={p.brand}
              onNavigate={() => router.push(productHref(p))}
              onAddToCart={() => addToCart(p)}
            />
          ))}
        </div>
        <div className="section-footer" style={{ marginTop: '20px' }}>
          <Link href="/boutique?hasOldPrice=true" className="section-link" aria-label="Voir plus">
            Voir toutes les promotions <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
