"use client";

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useCart } from './components/CartContext';
import { productHref } from './lib/productSlug';
import { ALL_PRODUCTS, type CatalogProduct } from './data/products';
import { ProductCard } from './components/ProductCard';
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

const matchesQuery = (p: CatalogProduct, q: string) => {
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
  const supplements = useMemo(() => ALL_PRODUCTS.filter((p) => p.category === 'Compléments'), []);
  const { addToCart } = useCart();
  
  const [heroImage, setHeroImage] = useState<string>(HERO_IMAGE);

  useEffect(() => {
    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const compBanner = data.find(b => b.section === 'complements-hero');
          if (compBanner && compBanner.imageUrl) {
            setHeroImage(compBanner.imageUrl);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <main className="supp-page">
        <section className="supp-page-hero" aria-label="Compléments Alimentaires">
          <div className="supp-page-hero-bg" style={{ backgroundImage: `url('${heroImage}')` }} aria-hidden="true" />
          <div className="supp-page-hero-noise" aria-hidden="true" />
          <div className="container">
            <div className="supp-page-hero-inner">
              <p className="supp-page-hero-kicker">COMPLÉMENTS ALIMENTAIRES</p>
              <h1 className="supp-page-hero-title">Routines par objectif</h1>
              <p className="supp-page-hero-subtitle">
                Sommeil, stress, digestion, immunité, beauté… Une sélection chic, lisible, et directement shoppable.
              </p>
              <div className="supp-page-hero-actions">
                <Link href="/boutique?category=Compléments" className="supp-page-hero-cta">
                  Voir le catalogue <ArrowRight size={16} />
                </Link>
                <Link href="/boutique?category=Compléments&new=1" className="supp-page-hero-cta ghost">
                  Nouveautés <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="supp-page-focus py-3xl" aria-label="Objectifs">
          <div className="container">
            <div className="supp-focus-chips" aria-label="Aller à un besoin">
              {FOCUSES.map((f) => (
                <Link key={f.key} href={`/complements-alimentaires#${encodeURIComponent(f.key)}`} className="supp-focus-chip-link">
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {FOCUSES.map((f) => {
          const products = supplements.filter((p) => matchesQuery(p, f.q));
          const href = `/boutique?category=Compléments&q=${encodeURIComponent(f.q)}`;

          return (
            <section key={f.key} id={f.key} className="supp-need-section pb-3xl" aria-label={f.title}>
              <div className="container">
                <div className="supp-need-header">
                  <div className="supp-need-left">
                    <div className="supp-need-meta">
                      <span className="supp-need-pill">{f.label}</span>
                      <span className="supp-need-timing">{f.timing}</span>
                    </div>
                    <h2 className="supp-need-title">{f.title}</h2>
                    <p className="supp-need-subtitle">{f.description}</p>
                  </div>
                </div>

                <div className="essentials-carousel supp-need-carousel unified-product-cards">
                  {products.slice(0, 8).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      label={p.brand}
                      onNavigate={() => router.push(productHref(p))}
                      onAddToCart={() => addToCart(p)}
                    />
                  ))}

                  <Link href={href} className="product-card kb-see-more-card" aria-label={`Voir plus ${f.title}`}>
                    <div className="kb-see-more-inner">
                      <div className="kb-see-more-label">Explorer</div>
                      <div className="kb-see-more-title">Tous les produits pour {f.label}</div>
                      <div className="kb-see-more-icon-circle">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        <section className="supp-page-all pb-3xl" aria-label="Tous les compléments">
          <div className="container">
            <Link href="/boutique?category=Compléments" className="supp-page-all-cta" aria-label="Voir tous les produits compléments">
              Voir tous les produits <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
