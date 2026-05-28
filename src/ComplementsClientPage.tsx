"use client";

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { useCart } from './components/CartContext';
import { productHref } from './lib/productSlug';

import { ProductCard } from './components/ProductCard';
import { LOCAL_BANNERS } from './lib/bannersConfig';
import './styles/CollectionLayout.css';
import './ComplementsClientPage.css';

type Focus = {
  key: string;
  label: string;
  timing: string;
  title: string;
  description: string;
  q: string;
};

const imageUrl = (prompt: string, imageSize?: string) => {
  return '/logo.png';
};

const HERO_IMAGE = imageUrl(
  'Photographie premium e-commerce compléments alimentaires, flacons ambrés et gélules, ambiance rose nude et beige crème, lumière studio douce, style laboratoire chic, haute définition',
  'landscape_16_9'
);

const FOCUSES: Focus[] = [
  {
    key: 'sleep',
    label: 'Sommeil',
    timing: 'Soir',
    title: 'Sommeil & Relaxation',
    description: 'Mélatonine, magnésium glycinate, plantes apaisantes.',
    q: 'melatonine magnesium sommeil',
  },
  {
    key: 'stress',
    label: 'Équilibre',
    timing: 'Matin',
    title: 'Stress & Humeur',
    description: 'Adaptogènes & focus doux: ashwagandha, rhodiola, L-théanine.',
    q: 'ashwagandha theanine rhodiola',
  },
  {
    key: 'digest',
    label: 'Intestin',
    timing: 'Repas',
    title: 'Digestion & Probiotiques',
    description: 'Confort intestinal, enzymes & microbiote (probiotiques).',
    q: 'probiotiques enzymes digestion',
  },
  {
    key: 'metabolic',
    label: 'Silhouette',
    timing: 'Avant repas',
    title: 'Poids & Métabolisme',
    description: 'Berbérine, chrome, ALA: routine métabolique.',
    q: 'berberine chrome ala metabolisme',
  },
  {
    key: 'immunity',
    label: 'Immunité',
    timing: 'Matin',
    title: 'Immunité & Ruche',
    description: 'Propolis, vitamine C, zinc: protection quotidienne.',
    q: 'propolis zinc vitamine c',
  },
  {
    key: 'beauty',
    label: 'Beauty',
    timing: 'Matin',
    title: 'Beauté In & Out',
    description: 'Collagène, biotine & acide hyaluronique: glow, cheveux, ongles.',
    q: 'collagene biotine hyaluronique',
  },
];

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const matchesQuery = (p: any, q: string) => {
  const hay = normalize(`${p.brand} ${p.name} ${p.description}`);
  const tokens = q
    .split(/\s+/)
    .map((t) => normalize(t))
    .filter(Boolean);
  if (!tokens.length) return true;
  return tokens.some((t) => hay.includes(t));
};

export default function ComplementsClientPage() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<any[]>([]);
  const { addToCart } = useCart();
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  
  const [heroImage, setHeroImage] = useState<string>(HERO_IMAGE);

  useEffect(() => {
    fetch('/api/products?category=Compl%C3%A9ments&limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setSupplements(data.products);
      })
      .catch(console.error);

    setHeroImage(LOCAL_BANNERS.complements);
  }, []);

  const currentFocus = selectedFocus ? FOCUSES.find((f) => f.key === selectedFocus) : null;
  const currentProducts = currentFocus ? supplements.filter((p) => matchesQuery(p, currentFocus.q)) : [];

  return (
    <>
      <main className="supp-page">
        <section className="supp-page-hero" aria-label="Compléments Alimentaires">
          <div className="supp-page-hero-bg" style={{ backgroundImage: `url('${heroImage}')` }} aria-hidden="true" />
          <div className="supp-page-hero-noise" aria-hidden="true" />
          <div className="container">
            <div className="supp-page-hero-inner">
              <p className="supp-page-hero-kicker">COMPLÉMENTS ALIMENTAIRES</p>
              <h1 className="supp-page-hero-title">
                {selectedFocus && currentFocus ? currentFocus.title : 'Routines par objectif'}
              </h1>
              <p className="supp-page-hero-subtitle">
                {selectedFocus && currentFocus
                  ? currentFocus.description
                  : 'Sommeil, stress, digestion, immunité, beauté… Une sélection chic, lisible, et directement shoppable.'}
              </p>
              {!selectedFocus && (
                <div className="supp-page-hero-actions">
                  <Link href="/boutique?category=Compléments" className="supp-page-hero-cta">
                    Voir le catalogue <ArrowRight size={16} />
                  </Link>
                  <Link href="/boutique?category=Compléments&new=1" className="supp-page-hero-cta ghost">
                    Nouveautés <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {selectedFocus && currentFocus ? (
          <section className="supp-need-section pb-3xl" aria-label={currentFocus.title}>
            <div className="container">
              <button
                onClick={() => setSelectedFocus(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: '#FF4FA3',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginBottom: '1.5rem',
                  padding: 0,
                }}
              >
                <ArrowLeft size={20} />
                Retour aux objectifs
              </button>

              <div className="supp-need-header">
                <div className="supp-need-left">
                  <div className="supp-need-meta">
                    <span className="supp-need-pill">{currentFocus.label}</span>
                    <span className="supp-need-timing">{currentFocus.timing}</span>
                  </div>
                  <h2 className="supp-need-title">{currentFocus.title}</h2>
                  <p className="supp-need-subtitle">{currentFocus.description}</p>
                </div>
              </div>

              <div className="essentials-carousel supp-need-carousel unified-product-cards">
                {currentProducts.slice(0, 8).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    label={p.brand}
                    onNavigate={() => router.push(productHref(p))}
                    onAddToCart={() => addToCart(p)}
                  />
                ))}

                <Link href={`/boutique?category=Compléments&q=${encodeURIComponent(currentFocus.q)}`} className="product-card kb-see-more-card" aria-label={`Voir plus ${currentFocus.title}`}>
                  <div className="kb-see-more-inner">
                    <div className="kb-see-more-label">Explorer</div>
                    <div className="kb-see-more-title">Tous les produits pour {currentFocus.label}</div>
                    <div className="kb-see-more-icon-circle">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="supp-page-focus py-3xl" aria-label="Objectifs">
            <div className="container">
              <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#fff' }}>
                Choisissez votre objectif
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {FOCUSES.map((f, idx) => (
                  <button
                    key={f.key}
                    onClick={() => setSelectedFocus(f.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.5rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#fff',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,79,163,0.1)';
                      e.currentTarget.style.borderColor = '#FF4FA3';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#FF4FA3', minWidth: '3rem' }}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{f.title}</h3>
                      <p style={{ margin: '0.25rem 0 0', color: '#aaa', fontSize: '0.85rem' }}>{f.description}</p>
                    </div>
                    <ChevronRight size={24} color="#FF4FA3" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {!selectedFocus && (
          <section className="supp-page-all pb-3xl" aria-label="Tous les compléments">
            <div className="container">
              <Link href="/boutique?category=Compléments" className="supp-page-all-cta" aria-label="Voir tous les produits compléments">
                Voir tous les produits <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
