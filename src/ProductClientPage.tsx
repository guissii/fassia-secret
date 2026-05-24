"use client";

import Image from 'next/image';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useCart } from './components/CartContext';
import { ProductCard } from './components/ProductCard';
import { publicAssetUrl } from './lib/publicUrl';
import type { CatalogProduct } from './data/products';
import { ALL_PRODUCTS } from './data/products';
import { productHref } from './lib/productSlug';
import './ProductClientPage.css';

type Product = CatalogProduct;

const formatPrice = (price: number) => price.toFixed(2) + ' MAD';

function fakeRating(id: number) {
  const rating = Math.round((4.3 + (id % 6) * 0.1) * 10) / 10;
  const count = 40 + ((id * 17) % 180);
  return { rating, count };
}

export default function ProductClientPage({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const isPromo = typeof product.oldPrice === 'number' && product.oldPrice > product.price;
  const discount = useMemo(() => {
    if (!isPromo || typeof product.oldPrice !== 'number') return 0;
    const pct = Math.round((1 - product.price / product.oldPrice) * 100);
    return Number.isFinite(pct) && pct > 0 ? pct : 0;
  }, [isPromo, product.oldPrice, product.price]);

  const saving = useMemo(() => {
    if (!isPromo || typeof product.oldPrice !== 'number') return 0;
    const diff = product.oldPrice - product.price;
    return Number.isFinite(diff) && diff > 0 ? diff : 0;
  }, [isPromo, product.oldPrice, product.price]);

  const related = useMemo(() => {
    const picked: Product[] = [];
    const seen = new Set<number>();

    const push = (p: Product) => {
      if (p.id === product.id) return;
      if (seen.has(p.id)) return;
      seen.add(p.id);
      picked.push(p);
    };

    ALL_PRODUCTS.filter((p) => p.category === product.category).forEach(push);
    ALL_PRODUCTS.filter((p) => p.brand === product.brand && p.category !== product.category).forEach(push);
    ALL_PRODUCTS.forEach(push);

    return picked.slice(0, 6);
  }, [product.brand, product.category, product.id]);

  const addProductToCart = (p: Product, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
        addToCart(p);
    }
  };

  const imageSrc = product.image.startsWith('http') ? product.image : publicAssetUrl(product.image);

  return (
    <>
      <main className="product-page">
        <div className="container">
          <nav className="product-breadcrumbs" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <ChevronRight size={14} />
            <Link href="/boutique">Boutique</Link>
            <ChevronRight size={14} />
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="product-layout">
            <section className="product-media" aria-label="Visuel produit">
              <div className="product-media-frame" style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                {isPromo ? <div className="product-media-badge">−{discount}%</div> : null}
                <Image src={imageSrc} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
              </div>
            </section>

            <section className="product-info" aria-label="Informations produit">
              <div className="product-brand">{product.brand}</div>
              <h1 className="product-title">{product.name}</h1>

              <div className="product-meta-row">
                <span className="product-category">{product.category}</span>
                {product.badge ? <span className="product-chip">{product.badge}</span> : null}
              </div>

              <div className="product-price-block" aria-label="Prix">
                <div className="product-price-row">
                  <span className="product-price">{formatPrice(product.price)}</span>
                  {isPromo && typeof product.oldPrice === 'number' ? (
                    <span className="product-old-price">{formatPrice(product.oldPrice)}</span>
                  ) : null}
                </div>
                {isPromo && saving ? <div className="product-saving">Économisez {formatPrice(saving)}</div> : null}
              </div>

              <p className="product-desc">{product.description}</p>

              <div className="product-actions">
                <div className="product-qty" aria-label="Quantité">
                  <button
                    type="button"
                    className="product-qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Diminuer la quantité"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="product-qty-value" aria-label="Quantité sélectionnée">
                    {qty}
                  </div>
                  <button
                    type="button"
                    className="product-qty-btn"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    aria-label="Augmenter la quantité"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className="product-add"
                  onClick={() => addProductToCart(product, qty)}
                  aria-label="Ajouter au panier"
                >
                  <ShoppingBag size={18} strokeWidth={2} />
                  Ajouter au panier
                </button>
              </div>

              <div className="product-trust">
                <div className="product-trust-item">Paiement sécurisé</div>
                <div className="product-trust-item">Livraison au Maroc</div>
                <div className="product-trust-item">Produits authentiques</div>
              </div>
            </section>
          </div>

          <section className="product-details" aria-label="Détails">
            <h2 className="product-details-title">Détails</h2>
            <div className="product-details-grid">
              <div className="product-detail">
                <div className="product-detail-title">Description</div>
                <div className="product-detail-text">{product.description}</div>
              </div>
              <div className="product-detail">
                <div className="product-detail-title">Conseils</div>
                <div className="product-detail-text">
                  Pour de meilleurs résultats, suivez les recommandations du fabricant. En cas de doute, demandez conseil à un
                  professionnel de santé.
                </div>
              </div>
            </div>
          </section>

          {related.length ? (
            <section className="related-section" aria-label="Produits similaires">
              <div className="related-header">
                <div className="related-heading">
                  <h2 className="related-title">
                    Vous aimerez aussi <Heart size={18} className="related-heart" />
                  </h2>
                  <p className="related-subtitle">Découvrez nos produits les plus appréciés</p>
                </div>
                <Link href="/boutique" className="related-more" aria-label="Voir plus de produits">
                  Voir plus →
                </Link>
              </div>
              <div className="related-grid">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    label={p.brand}
                    onNavigate={() => router.push(productHref(p))}
                    onAddToCart={() => addToCart(p)}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
