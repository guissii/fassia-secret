'use client';

import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

type BrandFlowProduct = {
  id: number;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  badgeColor?: string;
};

type BrandFlowProps = {
  brandName?: string;
  visualImage?: string;
  products?: BrandFlowProduct[];
  seeMoreHref?: string;
  layout?: 'standard' | 'oversized'; // New layout property
  overlapHero?: boolean;
};

export function BrandFlow({
  brandName = 'CENTELLA',
  visualImage = 'ca  quon va utiiser.png',
  products,
  seeMoreHref,
  layout = 'standard',
  overlapHero = false,
}: BrandFlowProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.product-card, .brand-flow-visual-tile');
    const cardWidth = firstCard?.offsetWidth ?? 0;
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const delta = (cardWidth + gap) * 2 * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const formatPrice = (value: number) => `${value.toFixed(2)} MAD`;

  const promoLabelFor = (p: BrandFlowProduct) => {
    if (typeof p.oldPrice === 'number' && p.oldPrice > p.price) {
      const pct = Math.round((1 - p.price / p.oldPrice) * 100);
      if (pct > 0) return `-${pct}%`;
    }
    return p.badge ?? '';
  };

  const items = useMemo<BrandFlowProduct[]>(() => {
    return (
      products ?? [
        {
          id: 1,
          name: 'Madagascar Centella Ampoule Foam',
          description: 'Mousse nettoyante apaisante au Centella Asiatica.',
          price: 129,
          image: visualImage,
          badge: 'Nouveau',
          badgeColor: 'var(--color-primary)',
        },
        {
          id: 2,
          name: 'Madagascar Centella Toning Toner',
          description: 'Tonique hydratant pour peaux sensibles et irritées.',
          price: 159,
          oldPrice: 189,
          image: visualImage,
          badgeColor: 'var(--color-primary)',
        },
        {
          id: 3,
          name: 'Madagascar Centella Ampoule',
          description: 'Sérum concentré réparateur à base de Madecassoside.',
          price: 199,
          image: visualImage,
        },
        {
          id: 4,
          name: 'Madagascar Centella Soothing Cream',
          description: 'Crème apaisante pour restaurer la barrière cutanée.',
          price: 179,
          image: visualImage,
        },
      ]
    );
  }, [products, visualImage]);

  const firstItem = items[0];
  const remainingItems = items.slice(1);

  return (
    <section
      className={`brand-flow-section ${layout === 'oversized' ? 'brand-flow-oversized' : ''} ${overlapHero ? 'brand-flow-overlap-hero' : ''}`}
    >
      <div className="container">
        <div className="product-carousel-wrap brand-flow-wrap">
          <button
            type="button"
            className="product-carousel-nav prev"
            onClick={() => scrollByCards(-1)}
            aria-label="Précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="product-carousel-nav next"
            onClick={() => scrollByCards(1)}
            aria-label="Suivant"
          >
            <ChevronRight size={18} />
          </button>

          <div
            className="product-carousel brand-flow-row"
            aria-label={`Produits ${brandName}`}
            ref={carouselRef}
          >
          {overlapHero && firstItem ? (
            <div className="brand-flow-slide brand-flow-hero-pair" aria-label={`Visuel ${brandName}`}>
              <div className="brand-flow-visual-tile">
                <img
                  src={publicAssetUrl(visualImage)}
                  alt={`${brandName} visuel`}
                  className="brand-flow-visual-img"
                  loading="lazy"
                />
                <div className="brand-flow-visual-overlay">
                  <span className="brand-flow-visual-name">{brandName}</span>
                </div>
              </div>

              <article key={firstItem.id} className="product-card brand-flow-slide brand-flow-hero-card" aria-label={firstItem.name}>
                <div className="product-image-area">
                  <div className="product-image-frame">
                    <img
                      src={publicAssetUrl(firstItem.image)}
                      alt={firstItem.name}
                      className="product-image"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {promoLabelFor(firstItem) && (
                    <span
                      className="product-badge"
                      style={{ backgroundColor: firstItem.badgeColor || 'var(--color-primary)' }}
                    >
                      {promoLabelFor(firstItem)}
                    </span>
                  )}

                  <div className="product-heart-btn" aria-label="Ajouter aux favoris">
                    <Heart size={18} strokeWidth={2} />
                  </div>
                </div>

                <div className="product-content">
                  <span className="product-category-label">{brandName}</span>
                  <h3 className="product-name">{firstItem.name}</h3>
                  {firstItem.description && <p className="product-description">{firstItem.description}</p>}

                  <div className="product-footer-row">
                    <div className="product-price-row" aria-label="Prix">
                      <span className="price-current">{formatPrice(firstItem.price)}</span>
                      {typeof firstItem.oldPrice === 'number' && firstItem.oldPrice > firstItem.price && (
                        <span className="price-old">{formatPrice(firstItem.oldPrice)}</span>
                      )}
                    </div>
                    <button className="product-cta-circle" type="button" aria-label={`Ajouter ${firstItem.name} au panier`}>
                      <ShoppingBag size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <div className="brand-flow-slide brand-flow-visual-tile" aria-label={`Visuel ${brandName}`}>
              <img
                src={publicAssetUrl(visualImage)}
                alt={`${brandName} visuel`}
                className="brand-flow-visual-img"
                loading="lazy"
              />
              <div className="brand-flow-visual-overlay">
                <span className="brand-flow-visual-name">{brandName}</span>
              </div>
            </div>
          )}

          {(overlapHero ? remainingItems : items).map((p) => (
            <article key={p.id} className="product-card brand-flow-slide" aria-label={p.name}>
              <div className="product-image-area">
                <div className="product-image-frame">
                  <img
                    src={publicAssetUrl(p.image)}
                    alt={p.name}
                    className="product-image"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {promoLabelFor(p) && (
                  <span
                    className="product-badge"
                    style={{ backgroundColor: p.badgeColor || 'var(--color-primary)' }}
                  >
                    {promoLabelFor(p)}
                  </span>
                )}

                <div className="product-heart-btn" aria-label="Ajouter aux favoris">
                  <Heart size={18} strokeWidth={2} />
                </div>
              </div>

              <div className="product-content">
                <span className="product-category-label">{brandName}</span>
                <h3 className="product-name">{p.name}</h3>
                {p.description && <p className="product-description">{p.description}</p>}

                <div className="product-footer-row">
                  <div className="product-price-row" aria-label="Prix">
                    <span className="price-current">{formatPrice(p.price)}</span>
                    {typeof p.oldPrice === 'number' && p.oldPrice > p.price && (
                      <span className="price-old">{formatPrice(p.oldPrice)}</span>
                    )}
                  </div>
                  <button className="product-cta-circle" type="button" aria-label={`Ajouter ${p.name} au panier`}>
                    <ShoppingBag size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

            </article>
          ))}

          {/* See More Card for Brand */}
          <Link href={seeMoreHref || `/marques/${brandName.toLowerCase()}`} className="product-card brand-flow-slide see-more-card">
            <div className="see-more-content">
              <div className="see-more-icon-wrap">
                <ArrowUpRight size={32} strokeWidth={1.5} />
              </div>
              <span className="see-more-text">Voir Plus</span>
              <p className="see-more-subtext">Découvrir {brandName}</p>
            </div>
          </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
