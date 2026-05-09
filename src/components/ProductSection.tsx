import { useEffect, useRef } from 'react';
import { Heart, ShoppingCart, ArrowLeftRight, Leaf, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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
    badgeColor: "var(--color-primary)"
  },
  {
    id: 2,
    name: "Hydra Boost Gel Cream",
    description: "Gel-crème hydratant avec acide hyaluronique & thé vert.",
    price: 199.00,
    oldPrice: 249.00,
    image: "d6f902fd-0b09-48d0-8055-d03094820431.png",
    category: "Visage",
    badge: "Promo !",
    badgeColor: "var(--color-primary)"
  },
  {
    id: 3,
    name: "Detox & Drainage",
    description: "Complement alimentaire detox a base d’artichaut & pissenlit.",
    price: 129.00,
    oldPrice: 159.00,
    image: "5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png",
    category: "Compléments",
    badge: "Promo !",
    badgeColor: "var(--color-primary)"
  },
  {
    id: 4,
    name: "Vitamin D3 2000 IU",
    description: "Soutien immunitaire & santé osseuse au quotidien.",
    price: 149.00,
    image: "950aa654-e0a2-4875-8451-ca8805a6d44a.png",
    category: "Santé"
  },
  {
    id: 5,
    name: "Routine Huiles & Plantes",
    description: "Sélection d’actifs botaniques pour une peau éclatante.",
    price: 169.00,
    image: "image%202%202.png",
    category: "Bien-etre",
    badge: "Nouveau",
    badgeColor: "var(--color-primary)"
  }
];

export function ProductSection({ 
  title = "NOUVEAUTÉS", 
  subtitle,
  products = mockProducts,
  showFooter = false
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

  const scrollPage = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth;
    if (pageWidth <= 0) return;
    const currentPage = Math.round(el.scrollLeft / pageWidth);
    const target = (currentPage + direction) * pageWidth;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="product-section py-3xl">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header text-center mb-2xl">
          <h2 className="product-section-title">
            {title}
          </h2>
          <div className="section-ornament">
            <span className="ornament-line"></span>
            <Leaf size={20} className="ornament-icon" strokeWidth={1.5} />
            <span className="ornament-line"></span>
          </div>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        {/* Carousel Container */}
        <div className="product-carousel-wrap">
          <button
            type="button"
            className="product-carousel-nav prev"
            onClick={() => scrollPage(-1)}
            aria-label="Précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="product-carousel-nav next"
            onClick={() => scrollPage(1)}
            aria-label="Suivant"
          >
            <ChevronRight size={18} />
          </button>

          <div className="product-carousel" ref={carouselRef}>
            {products.map((product) => (
              <div key={product.id} className="product-card">
              
              {/* Image & Badges */}
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                
                {product.badge && (
                  <span className="product-badge" style={{ backgroundColor: product.badgeColor || 'var(--color-primary)' }}>
                    <Leaf size={12} className="badge-icon" />
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                
                <div className="product-divider"></div>

                <div className="product-prices">
                  <span className="price-current">{product.price.toFixed(2)} MAD</span>
                  {product.oldPrice && (
                    <span className="price-old">{product.oldPrice.toFixed(2)} MAD</span>
                  )}
                </div>
              </div>

              {/* Actions (3 Circular Buttons) */}
              <div className="product-actions-circular">
                <button className="action-circle outline-btn">
                  <Heart size={16} />
                </button>
                <button className="action-circle primary-btn">
                  <ShoppingCart size={16} />
                </button>
                <button className="action-circle outline-btn">
                  <ArrowLeftRight size={16} />
                </button>
              </div>

              </div>
            ))}
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
            <button className="btn-primary-rounded mt-lg mx-auto" style={{ display: 'inline-flex' }}>
              VOIR TOUTES LES NOUVEAUTÉS <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
