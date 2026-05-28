
'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCarousel } from '../../../src/components/ProductCarousel';
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
  sectionKey: string;
  title: string;
  visualImage: string;
  products: Product[];
  filterQuery: string;
};

const imageUrl = (prompt: string, imageSize: string = 'portrait_4_3') => {
  return '/logo.png';
};

const visualImg = (prompt: string) => imageUrl(prompt, 'portrait_4_3');
const productImg = (prompt: string) => imageUrl(prompt, 'square');

const STEPS: Step[] = [
  {
    id: 1,
    sectionKey: 'mp-teint',
    title: 'Teint',
    visualImage: '/images/banners/teint.webp',
    products: [
      {
        id: 101,
        name: 'Fond de Teint Lumineux',
        description: 'Fini glow naturel, couvrance modulable',
        price: 245,
        image: productImg(
          "Packshot maquillage premium, flacon fond de teint verre dépoli, fond blanc rose, style e-commerce, lumière studio douce, haute définition"
        ),
      },
      {
        id: 102,
        name: 'BB Crème Hydratante',
        description: 'Hydrate et unifie le teint',
        price: 185,
        image: productImg(
          "Packshot maquillage premium, tube BB crème, fond beige rosé clair, style e-commerce, haute définition"
        ),
      },
      {
        id: 103,
        name: 'Anti-cernes Éclat',
        description: 'Corrige et illumine le regard',
        price: 145,
        image: productImg(
          "Packshot maquillage premium, anti-cernes applicateur, fond blanc premium, style e-commerce, haute définition"
        ),
      },
    ],
    filterQuery: 'category=Maquillage&q=teint',
  },
  {
    id: 2,
    sectionKey: 'mp-yeux',
    title: 'Yeux',
    visualImage: '/images/banners/yeux.webp',
    products: [
      {
        id: 201,
        name: 'Mascara Volume Noir',
        description: 'Volume intense, tenue longue durée',
        price: 195,
        image: productImg(
          "Packshot maquillage premium, mascara tube noir mat, fond rose pâle premium, style e-commerce, haute définition"
        ),
      },
      {
        id: 202,
        name: 'Eyeliner Précision',
        description: 'Trait net, pointe ultra fine',
        price: 125,
        image: productImg(
          "Packshot maquillage premium, eyeliner feutre, fond beige clair, style e-commerce, haute définition"
        ),
      },
      {
        id: 203,
        name: 'Palette Nude',
        description: 'Neutres chauds & reflets satinés',
        price: 345,
        image: productImg(
          "Packshot maquillage premium, palette fards nude ouverte, fond blanc rosé, style e-commerce luxe, haute définition"
        ),
      },
    ],
    filterQuery: 'category=Maquillage&q=yeux',
  },
  {
    id: 3,
    sectionKey: 'mp-levres',
    title: 'Lèvres',
    visualImage: '/images/banners/levres.webp',
    products: [
      {
        id: 301,
        name: 'Rouge à Lèvres Velours',
        description: 'Couleur intense, confort toute la journée',
        price: 175,
        image: productImg(
          "Packshot maquillage premium, rouge à lèvres raisin, étui doré, fond blanc premium, style e-commerce, haute définition"
        ),
      },
      {
        id: 302,
        name: 'Gloss Repulpant',
        description: 'Brillance miroir, effet repulpant',
        price: 145,
        image: productImg(
          "Packshot maquillage premium, gloss transparent, fond rose pâle premium, style e-commerce, haute définition"
        ),
      },
      {
        id: 303,
        name: 'Baume Teinté',
        description: 'Hydratation + voile de couleur',
        price: 95,
        image: productImg(
          "Packshot maquillage premium, baume à lèvres teinté, fond beige rosé, style e-commerce, haute définition"
        ),
      },
    ],
    filterQuery: 'category=Maquillage&q=lèvres',
  },
  {
    id: 4,
    sectionKey: 'mp-demaquillage',
    title: 'Démaquillage',
    visualImage: '/images/banners/demaquilage.webp',
    products: [
      {
        id: 401,
        name: 'Huile Démaquillante',
        description: 'Dissout waterproof, fini soyeux',
        price: 215,
        image: productImg(
          "Packshot skincare premium, huile démaquillante en flacon pompe, fond blanc rosé, style e-commerce, haute définition"
        ),
      },
      {
        id: 402,
        name: 'Eau Micellaire Apaisante',
        description: 'Nettoie sans agresser',
        price: 125,
        image: productImg(
          "Packshot skincare premium, eau micellaire flacon transparent, fond beige clair premium, style e-commerce, haute définition"
        ),
      },
      {
        id: 403,
        name: 'Lait Nettoyant Doux',
        description: 'Confort peaux sensibles',
        price: 145,
        image: productImg(
          "Packshot skincare premium, lait nettoyant tube blanc, fond rose pâle premium, style e-commerce, haute définition"
        ),
      },
    ],
    filterQuery: 'category=K-Beauty&q=démaquillant',
  },
  {
    id: 5,
    sectionKey: 'mp-parfums-femme',
    title: 'Parfums Femme',
    visualImage: '/images/banners/PARFUM FEMME.webp',
    products: [
      {
        id: 501,
        name: 'Éclat de Rose',
        description: 'Rose fraîche, musc délicat',
        price: 850,
        image: productImg(
          "Packshot parfum premium femme, flacon élégant rose clair, fond blanc premium, style e-commerce luxe, haute définition"
        ),
      },
      {
        id: 502,
        name: 'Nuit Ambrée',
        description: 'Ambre & vanille, sillage intense',
        price: 920,
        image: productImg(
          "Packshot parfum premium femme, flacon ambré, fond beige rosé, style e-commerce luxe, haute définition"
        ),
      },
      {
        id: 503,
        name: 'Fleur de Vanille',
        description: 'Gourmand, floral, doux',
        price: 780,
        image: productImg(
          "Packshot parfum premium femme, flacon vanille crème, fond rose pâle, style e-commerce, haute définition"
        ),
      },
    ],
    filterQuery: 'category=Parfums&q=femme',
  },
  {
    id: 6,
    sectionKey: 'mp-parfums-homme',
    title: 'Parfums Homme',
    visualImage: '/images/banners/PARFUMME HOME.webp',
    products: [
      {
        id: 601,
        name: 'Bois de Cèdre',
        description: 'Boisé sec, élégant',
        price: 890,
        image: productImg(
          "Packshot parfum premium homme, flacon verre fumé, fond beige clair, style e-commerce luxe, haute définition"
        ),
      },
      {
        id: 602,
        name: 'Océan Frais',
        description: 'Agrumes & notes marines',
        price: 750,
        image: productImg(
          "Packshot parfum premium homme, flacon bleu transparent, fond blanc premium, style e-commerce, haute définition"
        ),
      },
      {
        id: 603,
        name: "Épices d'Orient",
        description: 'Épices chaudes, ambré',
        price: 980,
        image: productImg(
          "Packshot parfum premium homme, flacon sombre, reflets dorés, fond rosé beige, style e-commerce luxe, haute définition"
        ),
      },
    ],
    filterQuery: 'category=Parfums&q=homme',
  },
];


export default function MaquillageParfumsPage() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const banners: Record<string, string> = {};

  const currentStep = selectedStep ? STEPS.find((s) => s.id === selectedStep) : null;

  return (
    <>
      <main className="kb-page">
        <section className="kb-hero">
          <div className="container">
            <h1 className="kb-hero-title">
              Maquillage & <span>Parfums</span>
            </h1>
            <p className="kb-hero-desc">
              {selectedStep
                ? `Section ${selectedStep.toString().padStart(2, '0')} — ${currentStep?.title}`
                : 'Sélectionnez une section pour découvrir nos produits'}
            </p>
          </div>
        </section>

        {selectedStep && currentStep ? (
          <section className="essentials-section">
            <div className="container">
              <button
                onClick={() => setSelectedStep(null)}
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
                Retour aux sections
              </button>

              <div className="essentials-header-row">
                <div className="essentials-title-group">
                  <h2 className="essentials-title">
                    <span className="highlight">{currentStep.id.toString().padStart(2, '0')}.</span> {currentStep.title}
                  </h2>
                </div>
              </div>

              <ProductCarousel
                stepId={currentStep.id.toString().padStart(2, '0')}
                title={currentStep.title}
                visualImage={banners[currentStep.sectionKey] || currentStep.visualImage}
                products={currentStep.products}
                productLabel="BEAUTY"
                seeMoreHref={`/boutique?${currentStep.filterQuery}`}
              />
            </div>
          </section>
        ) : (
          <section style={{ padding: '3rem 0' }}>
            <div className="container">
              <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#fff' }}>
                Choisissez une section
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStep(step.id)}
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
                      {step.id.toString().padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{step.title}</h3>
                      <p style={{ margin: '0.25rem 0 0', color: '#aaa', fontSize: '0.85rem' }}>
                        {step.products.length} produit{step.products.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight size={24} color="#FF4FA3" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="kb-global-cta">
          <div className="container" style={{ textAlign: 'center' }}>
            <Link href="/boutique?category=Maquillage" className="kb-global-cta-link">
              <span className="kb-global-cta-text">
                <span className="kb-global-cta-title">Catalogue Maquillage</span>
              </span>
              <span className="kb-global-cta-icon" aria-hidden="true">
                <ArrowRight size={24} />
              </span>
            </Link>
          </div>
        </section>

        <section className="kb-global-cta">
          <div className="container" style={{ textAlign: 'center' }}>
            <Link href="/boutique?category=Parfums" className="kb-global-cta-link">
              <span className="kb-global-cta-text">
                <span className="kb-global-cta-title">Catalogue Parfums</span>
              </span>
              <span className="kb-global-cta-icon" aria-hidden="true">
                <ArrowRight size={24} />
              </span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
