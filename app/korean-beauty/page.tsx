"use client";

import { Sparkles, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import './page.css';

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

type Step = {
  id: number;
  title: string;
  visualImage: string;
  products: Product[];
  filterQuery: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Oil Cleanser',
    visualImage: 'https://images.unsplash.com/photo-1608248593875-facfb62002f1?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 101, name: 'Centella Light Cleansing Oil', description: 'Huile démaquillante légère à la Centella', price: 32.00, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400' },
      { id: 102, name: 'Ginseng Cleansing Oil', description: 'Huile riche en Ginseng anti-âge', price: 38.00, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=400' },
      { id: 103, name: 'Heartleaf Pore Cleansing Oil', description: 'Pour purifier les pores en profondeur', price: 29.00, image: 'https://images.unsplash.com/photo-1611077544760-4b2a3044a1b0?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=oil+cleanser'
  },
  {
    id: 2,
    title: 'Foam Cleanser',
    visualImage: 'https://images.unsplash.com/photo-1584949514125-9df03da9fb58?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 201, name: 'Low pH Good Morning Gel', description: 'Nettoyant doux au pH neutre', price: 22.00, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400' },
      { id: 202, name: 'Heartleaf Quercetinol Foam', description: 'Mousse apaisante contre l\'acné', price: 24.00, image: 'https://images.unsplash.com/photo-1611077544760-4b2a3044a1b0?auto=format&fit=crop&q=80&w=400' },
      { id: 203, name: 'Salicylic Acid Daily Cleanser', description: 'Idéal pour les peaux grasses', price: 20.00, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=foam+cleanser'
  },
  {
    id: 3,
    title: 'Exfoliator',
    visualImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 301, name: 'BHA Blackhead Power Liquid', description: 'Exfoliant chimique contre les points noirs', price: 28.00, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=400' },
      { id: 302, name: 'AHA 7 Whitehead Power', description: 'Affine le grain de peau en douceur', price: 26.00, image: 'https://images.unsplash.com/photo-1615397323214-7299a9a38f3c?auto=format&fit=crop&q=80&w=400' },
      { id: 303, name: 'Apricot Peeling Gel', description: 'Gommage pelucheux doux', price: 24.00, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=exfoliant'
  },
  {
    id: 4,
    title: 'Toner',
    visualImage: 'https://images.unsplash.com/photo-1525684724213-adba3505cdd0?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 401, name: 'Heartleaf 77% Soothing Toner', description: 'Lotion apaisante très concentrée', price: 25.00, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400' },
      { id: 402, name: 'Centella Toning Water', description: 'Prépare la peau tout en douceur', price: 23.00, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' },
      { id: 403, name: 'Ginseng Essence Water', description: 'Eau de ginseng anti-âge tonifiante', price: 28.00, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=toner'
  },
  {
    id: 5,
    title: 'Essence',
    visualImage: 'https://images.unsplash.com/photo-1616851214044-6330ebde65c6?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 501, name: 'Snail 96 Mucin Power Essence', description: 'Bave d\'escargot hydratante iconique', price: 32.00, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=400' },
      { id: 502, name: 'Galactomyces 95 Tone Balancing', description: 'Éclat et unifie le teint', price: 34.00, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400' },
      { id: 503, name: 'Kombucha Tea Essence', description: 'Soin fermenté éclatant au kombucha', price: 38.00, image: 'https://images.unsplash.com/photo-1611077544760-4b2a3044a1b0?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=essence'
  },
  {
    id: 6,
    title: 'Serum & Ampoule',
    visualImage: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 601, name: 'Glow Serum Propolis + Niacinamide', description: 'Sérum coup d\'éclat au miel', price: 29.00, image: 'https://images.unsplash.com/photo-1615397323214-7299a9a38f3c?auto=format&fit=crop&q=80&w=400' },
      { id: 602, name: 'Dark Spot Correcting Serum', description: 'Corrige les taches brunes', price: 31.00, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400' },
      { id: 603, name: 'Centella Asiatica Ampoule', description: 'Concentré 100% réparateur', price: 27.00, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=serum'
  },
  {
    id: 7,
    title: 'Sheet Mask',
    visualImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 701, name: 'Collagen Impact Essential Mask', description: 'Masque tissu anti-âge au collagène', price: 18.00, image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=400' },
      { id: 702, name: 'Teatree Care Solution Mask', description: 'Masque à l\'arbre à thé anti-imperfections', price: 15.00, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400' },
      { id: 703, name: 'Watermide Hydrating Mask', description: 'Boost d\'hydratation instantané', price: 16.00, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=masque'
  },
  {
    id: 8,
    title: 'Eye Cream',
    visualImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 801, name: 'Revitalize Ginseng Eye Cream', description: 'Contour des yeux anti-rides', price: 48.00, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400' },
      { id: 802, name: 'Snail Peptide Eye Cream', description: 'Combat les cernes et lisse la peau', price: 42.00, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=400' },
      { id: 803, name: 'Retinol Intense Eye Cream', description: 'Contour des yeux puissant au rétinol', price: 39.00, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=contour+yeux'
  },
  {
    id: 9,
    title: 'Moisturizer',
    visualImage: 'https://images.unsplash.com/photo-1615397323214-7299a9a38f3c?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 901, name: 'Dynasty Cream', description: 'Crème riche iconique au ginseng', price: 45.00, image: 'https://images.unsplash.com/photo-1611077544760-4b2a3044a1b0?auto=format&fit=crop&q=80&w=400' },
      { id: 902, name: 'Centella Soothing Cream', description: 'Crème légère réparatrice barrière cutanée', price: 38.00, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' },
      { id: 903, name: 'Advanced Snail 92 All in One', description: 'Gel-crème réparateur à la bave d\'escargot', price: 35.00, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=creme+hydratante'
  },
  {
    id: 10,
    title: 'Sunscreen',
    visualImage: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600&h=900', 
    products: [
      { id: 1001, name: 'Relief Sun : Rice + Probiotics', description: 'Écran solaire léger riz et probiotiques', price: 28.00, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=400' },
      { id: 1002, name: 'Hyaluronic Acid Watery Sun Gel', description: 'Gel solaire hydratant fini invisible', price: 32.00, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=400' },
      { id: 1003, name: 'Aloe Soothing Sun Cream', description: 'Crème solaire apaisante à l\'aloé vera', price: 25.00, image: 'https://images.unsplash.com/photo-1615397323214-7299a9a38f3c?auto=format&fit=crop&q=80&w=400' },
    ],
    filterQuery: 'category=K-Beauty&q=solaire'
  },
];

export default function KoreanBeautyPage() {
  const formatPrice = (price: number) => {
    return price.toFixed(2) + ' MAD';
  };

  return (
    <main className="kb-page">
      {/* Hero */}
      <section className="kb-hero">
        <div className="container">
          <h1 className="kb-hero-title">10-Step <span>Glow</span> Routine</h1>
          <p className="kb-hero-desc">
            Parcourez chaque étape. Shoppez les meilleurs produits coréens.
          </p>
        </div>
      </section>

      {/* 10 Steps — each is an exact copy of the Centella EssentialsSection layout */}
      {STEPS.map((step) => {
        const firstProduct = step.products[0];
        const rest = step.products.slice(1);

        return (
          <section className="essentials-section" key={step.id}>
            <div className="container">
              {/* Step Header — like Centella's "NOS ESSENTIELS" title */}
              <div className="essentials-header-row">
                <div className="essentials-title-group">
                  <h2 className="essentials-title">
                    <span className="highlight">{step.id.toString().padStart(2, '0')}.</span> {step.title}
                  </h2>
                </div>
              </div>

              {/* Carousel — identical structure to EssentialsSection */}
              <div className="essentials-carousel">
                {/* Hero Pair: Visual Tile + 1st Product Card */}
                <div className="essentials-hero-pair">
                  <div className="essentials-visual-tile">
                    <img 
                      src={step.visualImage} 
                      alt={step.title} 
                      className="essentials-visual-img"
                      loading="lazy"
                    />
                    <div className="kb-visual-overlay">
                      <span className="kb-overlay-step">{step.id.toString().padStart(2, '0')}</span>
                      <h3 className="kb-overlay-title">{step.title}</h3>
                    </div>
                  </div>
                  
                  {firstProduct && (
                    <article className="essential-card">
                      <div className="essential-image-area">
                        <div className="essential-badge-right" aria-label="Ajouter aux favoris">
                          <Heart size={18} strokeWidth={2} />
                        </div>
                        <img src={firstProduct.image} alt={firstProduct.name} className="essential-image" loading="lazy" />
                      </div>
                      <div className="essential-content">
                        <span className="essential-brand">K-BEAUTY</span>
                        <h3 className="essential-title">{firstProduct.name}</h3>
                        <p className="essential-desc">{firstProduct.description}</p>
                        <div className="essential-footer">
                          <div className="essential-price-group">
                            <span className="essential-price">{formatPrice(firstProduct.price)}</span>
                          </div>
                          <button className="essential-cta" aria-label="Ajouter au panier">
                            <ShoppingBag size={18} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </article>
                  )}
                </div>

                {/* Remaining product cards */}
                {rest.map((p) => (
                  <article key={p.id} className="essential-card">
                    <div className="essential-image-area">
                      <div className="essential-badge-right" aria-label="Ajouter aux favoris">
                        <Heart size={18} strokeWidth={2} />
                      </div>
                      <img src={p.image} alt={p.name} className="essential-image" loading="lazy" />
                    </div>
                    <div className="essential-content">
                      <span className="essential-brand">K-BEAUTY</span>
                      <h3 className="essential-title">{p.name}</h3>
                      <p className="essential-desc">{p.description}</p>
                      <div className="essential-footer">
                        <div className="essential-price-group">
                          <span className="essential-price">{formatPrice(p.price)}</span>
                        </div>
                        <button className="essential-cta" aria-label="Ajouter au panier">
                          <ShoppingBag size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

                <Link
                  href={`/boutique?${step.filterQuery}`}
                  className="essential-card kb-see-more-card"
                  aria-label={`Voir plus ${step.title}`}
                >
                  <div className="kb-see-more-inner">
                    <span className="kb-see-more-label">Voir plus</span>
                    <span className="kb-see-more-title">{step.title}</span>
                    <ArrowRight size={18} />
                  </div>
                </Link>

              </div>

            </div>
          </section>
        );
      })}

      {/* Global CTA */}
      <section className="kb-global-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <Link href="/boutique?category=K-Beauty" className="kb-global-cta-link">
            <span className="kb-global-cta-text">
              <span className="kb-global-cta-kicker">Explorer tout le</span>
              <span className="kb-global-cta-title">Catalogue K-Beauty</span>
            </span>
            <span className="kb-global-cta-icon" aria-hidden="true">
              <ArrowRight size={28} />
            </span>
          </Link>
        </div>
      </section>

      <Link href="/" className="kb-nav-bubble" aria-label="Retour à l'accueil">
        N°
      </Link>
    </main>
  );
}
