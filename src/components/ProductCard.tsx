"use client";

import Image from 'next/image';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import './ProductCard.css';

export type ProductCardProduct = {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  description?: string;
  badge?: string;
  badgeColor?: string;
};

type Props = {
  product: ProductCardProduct;
  label: string;
  onNavigate?: () => void;
  onAddToCart?: () => void;
  ctaState?: 'idle' | 'loading' | 'added';
};

export function ProductCard({ product, label, onNavigate, onAddToCart, ctaState = 'idle' }: Props) {
  const formatPriceValue = (value: number) => value.toFixed(2);
  const hasPromo = typeof product.oldPrice === 'number' && product.oldPrice > product.price;
  const promoLabel = product.badge ?? (hasPromo ? 'Promo' : '');
  const hasImage = product.image && product.image.trim().length > 0 && product.image !== '/';
  const imageSrc = hasImage ? (product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('blob:') ? product.image : publicAssetUrl(product.image)) : '';
  const ctaIcon = ctaState === 'added' ? <Check size={16} /> : ctaState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />;

  return (
    <article
      className="product-card"
      aria-label={product.name}
      role={onNavigate ? 'link' : undefined}
      tabIndex={onNavigate ? 0 : undefined}
      onClick={() => onNavigate?.()}
      onKeyDown={(e) => {
        if (!onNavigate) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate();
        }
      }}
    >
      <div className="product-image-area">
        <div className="product-image-frame" style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
          {hasImage ? (
            product.image.startsWith('data:') ? (
              <img src={imageSrc} alt={product.name} className="product-image" loading="lazy" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            ) : (
              <Image src={imageSrc} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="product-image" loading="lazy" style={{ objectFit: 'cover' }} />
            )
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Pas d'image</span>
            </div>
          )}
        </div>
        <button
          className="product-cta-circle"
          type="button"
          aria-label={`Ajouter ${product.name} au panier`}
          disabled={ctaState === 'loading'}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
        >
          {ctaIcon}
        </button>
        {promoLabel ? (
          <span className="product-badge" style={{ backgroundColor: product.badgeColor || 'var(--color-primary)' }}>
            {promoLabel}
          </span>
        ) : null}
      </div>

      <div className="product-content">
        <div className="product-name-desc-group">
          <span className="product-category-label">{label}</span>
          <h3 className="product-name">{product.name}</h3>
          {product.description ? <p className="product-description">{product.description}</p> : null}
        </div>
        <div className="product-footer-row">
          <div className="product-price-row" aria-label="Prix">
            <span className="price-current">
              <span className="price-value">{formatPriceValue(product.price)}</span>
              <span className="price-currency">MAD</span>
            </span>
            {hasPromo ? (
              <span className="price-old">
                <span className="price-value">{formatPriceValue(product.oldPrice!)}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
