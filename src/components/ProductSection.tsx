import { useEffect, useRef } from 'react';
import { Leaf, ArrowRight, ChevronLeft, ChevronRight, ArrowUpRight, Heart, ShoppingBag } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  badge?: string;
  badgeColor?: string;
}

interface ProductSectionProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  showFooter?: boolean;
  seeMoreHref?: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Derma Hydrating Serum",
    description: "Sérum hydratant à l’acide hyaluronique + vitamine B5.",
    price: 180.00,
    image: "19bd7403-d2ac-49a4-a584-be5895add421.png",
    category: "Visage",
    badge: "Nouveau",
    badgeColor: "var(--color-primary)",
  },
  {
    id: 2,
    name: "Hydra Boost Gel Cream",
    description: "Gel-crème hydratant avec acide hyaluronique & thé vert.",
    price: 199.00,
    oldPrice: 249.00,
    image: "d6f902fd-0b09-48d0-8055-d03094820431.png",
    category: "Visage",
    badgeColor: "var(--color-primary)",
  },
  {
    id: 3,
    name: "Detox & Drainage",
    description: "Complément détox à base d’actifs botaniques.",
    price: 129.00,
    oldPrice: 159.00,
    image: "5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png",
    category: "Compléments",
    badgeColor: "var(--color-primary)",
  },
  {
    id: 4,
    name: "Vitamin D3 2000 IU",
    description: "Soutien immunitaire & santé osseuse au quotidien.",
    price: 149.00,
    image: "950aa654-e0a2-4875-8451-ca8805a6d44a.png",
    category: "Santé",
  },
  {
    id: 5,
    name: "Routine Huiles & Plantes",
    description: "Sélection d’actifs botaniques pour une peau éclatante.",
    price: 169.00,
    image: "image%202%202.png",
    category: "Bien-etre",
    badge: "Nouveau",
    badgeColor: "var(--color-primary)",
  }
];

export function ProductSection({ 
  title = "NOUVEAUTÉS", 
  subtitle,
  products = mockProducts,
  showFooter = false,
  seeMoreHref = "/boutique"
}: ProductSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    el.classList.add('reveal-ready');

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      requestAnimationFrame(() => {
        el.classList.add('is-visible');
      });
      return;
    }

    const safetyTimer = window.setTimeout(() => {
      el.classList.add('is-visible');
    }, 1200);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => {
      window.clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  const scrollByCards = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.product-card');
    const cardWidth = firstCard?.offsetWidth ?? 0;
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const delta = (cardWidth + gap) * 2 * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const formatPrice = (value: number) => `${value.toFixed(2)} MAD`;

  const promoLabelFor = (p: Product) => {
    if (typeof p.oldPrice === 'number' && p.oldPrice > p.price) {
      const pct = Math.round((1 - p.price / p.oldPrice) * 100);
      if (pct > 0) return `-${pct}%`;
    }
    return p.badge ?? '';
  };

  return (
    <section ref={sectionRef} className="product-section py-xl">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header-premium mb-xl">
          <h2 className="section-title-premium">
            {title}
          </h2>
          <div className="section-ornament-premium" aria-hidden="true" />
          {subtitle && <p className="section-subtitle-premium">{subtitle}</p>}
        </div>

        {/* Carousel Container */}
        <div className="product-carousel-wrap">
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

          <div className="product-carousel" ref={carouselRef}>
            {products.map((product) => (
              <article key={product.id} className="product-card" aria-label={product.name}>
              
              {/* Image & Badges */}
              <div className="product-image-area">
                <div className="product-image-frame">
                  <img
                    src={publicAssetUrl(product.image)}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                
                {promoLabelFor(product) && (
                  <span
                    className="product-badge"
                    style={{ backgroundColor: product.badgeColor || 'var(--color-primary)' }}
                  >
                    {promoLabelFor(product)}
                  </span>
                )}

                <div className="product-heart-btn" aria-label="Ajouter aux favoris">
                  <Heart size={18} strokeWidth={2} />
                </div>
              </div>

              {/* Info */}
              <div className="product-content">
                <span className="product-category-label">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                {product.description && <p className="product-description">{product.description}</p>}

                <div className="product-footer-row">
                  <div className="product-price-row" aria-label="Prix">
                    <span className="price-current">{formatPrice(product.price)}</span>
                    {typeof product.oldPrice === 'number' && product.oldPrice > product.price && (
                      <span className="price-old">{formatPrice(product.oldPrice)}</span>
                    )}
                  </div>
                  <button className="product-cta-circle" type="button" aria-label={`Ajouter ${product.name} au panier`}>
                    <ShoppingBag size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              </article>
            ))}

            {/* See More Card at the end of Carousel */}
            <Link href={seeMoreHref} className="product-card see-more-card">
              <div className="see-more-content">
                <div className="see-more-icon-wrap">
                  <ArrowUpRight size={32} strokeWidth={1.5} />
                </div>
                <span className="see-more-text">Voir plus</span>
                <p className="see-more-subtext">De produits</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer actions */}
        {showFooter && (
          <div className="section-footer text-center mt-2xl">
            <div className="footer-ornament">
              <span className="ornament-line-long"></span>
              <Leaf size={28} className="ornament-icon-large text-primary" strokeWidth={1.5} style={{ fill: 'var(--color-primary)' }} />
              <span className="ornament-line-long"></span>
            </div>
            <Link href={seeMoreHref} className="see-more-products-cta mt-lg mx-auto" style={{ display: 'inline-flex' }}>
              <span>VOIR PLUS DE PRODUITS</span> <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
