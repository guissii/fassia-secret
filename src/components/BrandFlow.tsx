import { useMemo, useRef } from 'react';
import { ArrowLeftRight, Heart, Leaf, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';

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
};

export function BrandFlow({
  brandName = 'CENTELLA',
  visualImage = 'ca  quon va utiiser.png',
  products,
}: BrandFlowProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollPage = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const pageWidth = el.clientWidth;
    if (pageWidth <= 0) return;
    const currentPage = Math.round(el.scrollLeft / pageWidth);
    const target = (currentPage + direction) * pageWidth;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  const items = useMemo<BrandFlowProduct[]>(() => {
    return (
      products ?? [
        {
          id: 1,
          name: 'Madagascar Centella Ampoule Foam',
          description: 'Nettoyant doux pour une peau propre et apaisée.',
          price: 129,
          image: visualImage,
          badge: 'Nouveau',
          badgeColor: 'var(--color-primary)',
        },
        {
          id: 2,
          name: 'Madagascar Centella Toning Toner',
          description: 'Tonique hydratant pour une routine équilibrée.',
          price: 159,
          oldPrice: 189,
          image: visualImage,
          badge: 'Promo !',
          badgeColor: 'var(--color-primary)',
        },
        {
          id: 3,
          name: 'Madagascar Centella Ampoule',
          description: 'Ampoule apaisante pour renforcer la barrière cutanée.',
          price: 199,
          image: visualImage,
        },
        {
          id: 4,
          name: 'Madagascar Centella Soothing Cream',
          description: 'Crème légère pour calmer et hydrater au quotidien.',
          price: 179,
          image: visualImage,
        },
      ]
    );
  }, [products, visualImage]);

  return (
    <section className="brand-flow-section py-3xl">
      <div className="container">
        <div className="product-carousel-wrap brand-flow-wrap">
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

          <div
            className="product-carousel brand-flow-row"
            aria-label={`Produits ${brandName}`}
            ref={carouselRef}
          >
          <div className="brand-flow-slide brand-flow-visual-tile" aria-label={`Visuel ${brandName}`}>
            <img
              src={publicAssetUrl(visualImage)}
              alt={`${brandName} visuel`}
              className="brand-flow-visual-img"
              loading="lazy"
            />
          </div>

          {items.map((p) => (
            <div key={p.id} className="product-card brand-flow-slide">
              <div className="product-image-container">
                <img
                  src={publicAssetUrl(p.image)}
                  alt={p.name}
                  className="product-image"
                  loading="lazy"
                />

                {p.badge && (
                  <span
                    className="product-badge"
                    style={{ backgroundColor: p.badgeColor || 'var(--color-primary)' }}
                  >
                    <Leaf size={12} className="badge-icon" />
                    {p.badge}
                  </span>
                )}
              </div>

              <div className="product-info">
                <h3 className="product-name">{p.name}</h3>
                {p.description && <p className="product-description">{p.description}</p>}
                <div className="product-divider"></div>

                <div className="product-prices">
                  <span className="price-current">{p.price.toFixed(2)} MAD</span>
                  {p.oldPrice && <span className="price-old">{p.oldPrice.toFixed(2)} MAD</span>}
                </div>
              </div>

              <div className="product-actions-circular">
                <button className="action-circle outline-btn" type="button">
                  <Heart size={16} />
                </button>
                <button className="action-circle primary-btn" type="button">
                  <ShoppingCart size={16} />
                </button>
                <button className="action-circle outline-btn" type="button">
                  <ArrowLeftRight size={16} />
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
