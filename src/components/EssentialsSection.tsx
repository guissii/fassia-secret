import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import './EssentialsSection.css';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

export type EssentialProduct = {
  id: number;
  brand: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
};

export const ESSENTIALS_PRODUCTS: EssentialProduct[] = [
  {
    id: 1,
    brand: 'MADAGASCAR',
    name: 'Centella Ampoule Foam',
    description: 'Nettoyant doux à la Centella Asiatica pour apaiser et hydrater la peau.',
    price: 129.0,
    image: 'ca  quon va utiiser.png',
    badge: 'NOUVEAU',
  },
  {
    id: 2,
    brand: 'MADAGASCAR',
    name: 'Centella Toning Toner',
    description: 'Tonique hydratant enrichi en Centella Asiatica pour une peau fraîche et éclatante.',
    price: 159.0,
    oldPrice: 189.0,
    image: 'ca  quon va utiiser.png',
    badge: '-16%',
  },
  {
    id: 3,
    brand: 'MADAGASCAR',
    name: 'Centella Ampoule',
    description: 'Sérum à la Centella Asiatica pour réparer et renforcer la barrière cutanée.',
    price: 199.0,
    image: 'ca  quon va utiiser.png',
  }
];

export function EssentialsSection() {
  const formatPrice = (price: number) => {
    return price.toFixed(2) + ' MAD';
  };

  return (
    <section className="essentials-section">
      <div className="container">
        
        <div className="essentials-header-row">
          <div className="essentials-title-group">
            <h2 className="essentials-title">
              NOS <span className="highlight">ESSENTIELS</span>
            </h2>
          </div>
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
            </div>
            
            {/* Render first product */}
            {ESSENTIALS_PRODUCTS.slice(0, 1).map((p) => (
              <article key={p.id} className="essential-card">
                <div className="essential-image-area">
                  {p.badge && <span className="essential-badge-left">{p.badge}</span>}
                  <div className="essential-badge-right" aria-label="Ajouter aux favoris">
                    <Heart size={18} strokeWidth={2} />
                  </div>
                  <img src={publicAssetUrl(p.image)} alt={p.name} className="essential-image" loading="lazy" />
                </div>
                <div className="essential-content">
                  <span className="essential-brand">{p.brand}</span>
                  <h3 className="essential-title">{p.name}</h3>
                  <p className="essential-desc">{p.description}</p>
                  <div className="essential-footer">
                    <div className="essential-price-group">
                      <span className="essential-price">{formatPrice(p.price)}</span>
                      {p.oldPrice && <span className="essential-price-old">{formatPrice(p.oldPrice)}</span>}
                    </div>
                    <button className="essential-cta" aria-label="Ajouter au panier">
                      <ShoppingBag size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Render remaining products */}
          {ESSENTIALS_PRODUCTS.slice(1).map((p) => (
            <article key={p.id} className="essential-card">
              <div className="essential-image-area">
                {p.badge && <span className="essential-badge-left">{p.badge}</span>}
                <div className="essential-badge-right" aria-label="Ajouter aux favoris">
                  <Heart size={18} strokeWidth={2} />
                </div>
                <img src={publicAssetUrl(p.image)} alt={p.name} className="essential-image" loading="lazy" />
              </div>
              <div className="essential-content">
                <span className="essential-brand">{p.brand}</span>
                <h3 className="essential-title">{p.name}</h3>
                <p className="essential-desc">{p.description}</p>
                <div className="essential-footer">
                  <div className="essential-price-group">
                    <span className="essential-price">{formatPrice(p.price)}</span>
                    {p.oldPrice && <span className="essential-price-old">{formatPrice(p.oldPrice)}</span>}
                  </div>
                  <button className="essential-cta" aria-label="Ajouter au panier">
                    <ShoppingBag size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          <Link href="/essentiels" className="essential-card essential-see-more" aria-label="Voir plus">
            <div className="essential-see-more-inner">
              <span className="essential-see-more-title">Voir plus</span>
              <span className="essential-see-more-subtitle">Découvrir tous nos essentiels</span>
            </div>
          </Link>
        </div>

        <div className="essentials-dots" aria-hidden="true">
          <div className="essential-dot active"></div>
          <div className="essential-dot"></div>
          <div className="essential-dot"></div>
          <div className="essential-dot"></div>
          <div className="essential-dot"></div>
        </div>

      </div>
    </section>
  );
}
