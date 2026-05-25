"use client";

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCarousel } from '@/components/ProductCarousel';
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
    visualImage: visualImg(
      "Photographie e-commerce maquillage premium, fond de teint et poudre sur vanity marbre, ambiance rose nude minimal luxe, lumière studio douce, haute définition"
    ),
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
    visualImage: visualImg(
      "Photographie e-commerce maquillage yeux, mascara et palette fards à paupières sur fond rose nude, ambiance luxe minimal, lumière studio douce, haute définition"
    ),
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
    visualImage: visualImg(
      "Photographie e-commerce maquillage lèvres, rouges à lèvres et gloss sur fond rose nude, texture velours, ambiance luxe minimal, haute définition"
    ),
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
    visualImage: visualImg(
      "Photographie e-commerce démaquillage, huile et eau micellaire sur fond marbre clair, ambiance rose beige minimal luxe, lumière studio douce, haute définition"
    ),
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
    visualImage: visualImg(
      "Photographie e-commerce parfum femme, flacons verre raffinés, reflets dorés, ambiance rose nude minimal luxe, haute définition"
    ),
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
    visualImage: visualImg(
      "Photographie e-commerce parfum homme, flacons verre fumé, ambiance boisée, fond neutre premium, lumière studio douce, haute définition"
    ),
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

import { useEffect, useState } from 'react';

export default function MaquillageParfumsPage() {
  const [banners, setBanners] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = data.reduce((acc: any, b: any) => {
            if (b.imageUrl) {
              acc[b.section] = b.imageUrl;
            }
            return acc;
          }, {});
          setBanners(map);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <main className="kb-page">
        <section className="kb-hero">
          <div className="container">
            <h1 className="kb-hero-title">
              Maquillage & <span>Parfums</span>
            </h1>
            <p className="kb-hero-desc">
              Parcourez nos univers. Chaque “Voir plus” ouvre la boutique avec le filtre correspondant.
            </p>
          </div>
        </section>

        {STEPS.map((step) => {
          const visualImageUrl = banners[step.sectionKey] || step.visualImage;
          return (
            <section className="essentials-section" key={step.id}>
              <div className="container">
                <div className="essentials-header-row">
                  <div className="essentials-title-group">
                    <h2 className="essentials-title">
                      <span className="highlight">{step.id.toString().padStart(2, '0')}.</span> {step.title}
                    </h2>
                  </div>
                </div>

                <ProductCarousel
                  stepId={step.id.toString().padStart(2, '0')}
                  title={step.title}
                  visualImage={visualImageUrl}
                  products={step.products}
                  productLabel="BEAUTY"
                  seeMoreHref={`/boutique?${step.filterQuery}`}
                />
              </div>
            </section>
          );
        })}

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
