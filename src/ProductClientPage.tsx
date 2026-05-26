"use client";

import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useCart } from './components/CartContext';
import { ProductCard } from './components/ProductCard';
import { publicAssetUrl } from './lib/publicUrl';

import { productHref } from './lib/productSlug';
import './ProductClientPage.css';

type Product = any;

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

  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/products?category=${encodeURIComponent(product.category)}&limit=10`)
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setRelated(data.products.filter((p: any) => p.id !== product.id).slice(0, 6));
        }
      })
      .catch(console.error);
  }, [product.category, product.id]);

  const addProductToCart = (p: Product, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
        addToCart(p);
    }
  };

  const hasImage = product.image && product.image.trim().length > 0 && product.image !== '/';
  const imageSrc = hasImage ? (product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('blob:') ? product.image : publicAssetUrl(product.image)) : '';

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
                {hasImage ? (
                  <Image src={imageSrc} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Pas d'image</span>
                  </div>
                )}
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

              <div className="product-desc"><ExpandableText text={product.description} maxLength={100} /></div>

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
                <div className="product-detail-text"><ExpandableText text={product.description} maxLength={150} /></div>
              </div>
              <div className="product-detail">
                <div className="product-detail-title">Conseils</div>
                <div className="product-detail-text">
                  <ExpandableText text="Pour de meilleurs résultats, suivez les recommandations du fabricant. En cas de doute, demandez conseil à un professionnel de santé." maxLength={80} />
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

          <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '60px' }}>
            <Link href="/boutique" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 40px', background: '#000', color: '#fff', textDecoration: 'none', fontWeight: 600, borderRadius: '8px', letterSpacing: '1px', fontSize: '0.95rem', transition: 'transform 0.2s' }}>
              VOIR TOUS LES PRODUITS <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function ExpandableText({ text, maxLength = 120 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= maxLength) return <span>{text}</span>;
  
  return (
    <span>
      {expanded ? text : `${text.slice(0, maxLength).trim()}...`}
      <button 
        type="button" 
        onClick={() => setExpanded(!expanded)} 
        style={{ background: 'none', border: 'none', color: '#000', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px', padding: 0 }}
      >
        {expanded ? 'Voir moins' : 'Lire la suite'}
      </button>
    </span>
  );
}
