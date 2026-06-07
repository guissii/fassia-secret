"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useCart } from './components/CartContext';
import { productHref } from './lib/productSlug';
import { FOCUSES } from './lib/supplementFocuses';

import { ProductCard } from './components/ProductCard';
import './styles/CollectionLayout.css';
import './ComplementsClientPage.css';

interface ComplementsClientPageProps {
  products?: any[];
  productsByFocus?: Record<string, any[]>;
}

export default function ComplementsClientPage({ products: initialProducts = [], productsByFocus }: ComplementsClientPageProps) {
  const router = useRouter();
  const [supplements, setSupplements] = useState<any[]>(initialProducts);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productsByFocus && initialProducts.length === 0) {
      fetch('/api/products?category=complements-alimentaires&limit=100')
        .then((res) => res.json())
        .then((data) => {
          if (data.products) setSupplements(data.products);
        })
        .catch(console.error);
    }
  }, [initialProducts, productsByFocus]);

  return (
    <>
      <main className="supp-page">
        <section className="supp-page-focus py-lg" aria-label="Objectifs">
          <div className="container">
            <div className="supp-focus-chips" aria-label="Aller à un besoin">
              {FOCUSES.map((f) => (
                <Link key={f.key} href={`/complements-alimentaires#${encodeURIComponent(f.key)}`} className="supp-focus-chip-link">
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {FOCUSES.map((f) => {
          const products = productsByFocus?.[f.key] ?? supplements.filter((p) => p.supplementFocus === f.key);
          const href = `/boutique?category=complements-alimentaires&q=${encodeURIComponent(f.q)}`;

          return (
            <section key={f.key} id={f.key} className="supp-need-section pb-lg" aria-label={f.title}>
              <div className="container">
                <div className="supp-need-header">
                  <div className="supp-need-left">
                    <div className="supp-need-meta">
                      <span className="supp-need-pill">{f.label}</span>
                      <span className="supp-need-timing">{f.timing}</span>
                    </div>
                    <h2 className="supp-need-title">{f.title}</h2>
                    <p className="supp-need-subtitle">{f.description}</p>
                  </div>
                </div>

                <div className="essentials-carousel supp-need-carousel unified-product-cards">
                  {products.slice(0, 8).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      label={p.brand}
                      onNavigate={() => router.push(productHref(p))}
                      onAddToCart={() => addToCart(p)}
                    />
                  ))}

                  <Link href={href} className="product-card kb-see-more-card" aria-label={`Voir plus ${f.title}`}>
                    <div className="kb-see-more-inner">
                      <div className="kb-see-more-label">Explorer</div>
                      <div className="kb-see-more-title">Tous les produits pour {f.label}</div>
                      <div className="kb-see-more-icon-circle">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        <section className="supp-page-all pb-lg" aria-label="Tous les compléments">
          <div className="container">
            <Link href="/boutique?category=complements-alimentaires" className="supp-page-all-cta" aria-label="Voir tous les produits compléments">
              Voir tous les produits <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
