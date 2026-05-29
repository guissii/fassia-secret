export const dynamic = 'force-dynamic';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCarousel } from '../../../src/components/ProductCarousel';
import './page.css';

// Côté serveur: localhost direct, côté client: URL publique
const API_URL = typeof window === 'undefined'
  ? 'http://localhost:5000'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://fassiasecret.com');

async function getProducts(category: string, limit = 10) {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=${limit}&category=${category}&isVisible=true`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
};

const STEPS = [
  {
    id: 1,
    sectionKey: 'mp-teint',
    title: 'Teint',
    visualImage: '/images/banners/teint.webp',
    filterQuery: 'category=Maquillage&q=teint',
    keywords: ['teint', 'fond', 'bb', 'correcteur', 'poudre', 'anticerne'],
  },
  {
    id: 2,
    sectionKey: 'mp-yeux',
    title: 'Yeux',
    visualImage: '/images/banners/yeux.webp',
    filterQuery: 'category=Maquillage&q=yeux',
    keywords: ['yeux', 'mascara', 'eyeliner', 'fard', 'palette', 'crayon'],
  },
  {
    id: 3,
    sectionKey: 'mp-levres',
    title: 'Lèvres',
    visualImage: '/images/banners/levres.webp',
    filterQuery: 'category=Maquillage&q=lèvres',
    keywords: ['lèvres', 'rouge', 'gloss', 'baume', 'crayon'],
  },
  {
    id: 4,
    sectionKey: 'mp-demaquillage',
    title: 'Démaquillage',
    visualImage: '/images/banners/demaquilage.webp',
    filterQuery: 'category=K-Beauty&q=démaquillant',
    keywords: ['démaquillant', 'micellaire', 'nettoyant', 'demaquillage'],
  },
  {
    id: 5,
    sectionKey: 'mp-parfums-femme',
    title: 'Parfums Femme',
    visualImage: '/images/banners/PARFUM FEMME.webp',
    filterQuery: 'category=Parfums&q=femme',
    keywords: ['parfum', 'eau de toilette', 'eau de parfum'],
    excludeKeywords: ['homme'],
  },
  {
    id: 6,
    sectionKey: 'mp-parfums-homme',
    title: 'Parfums Homme',
    visualImage: '/images/banners/PARFUMME HOME.webp',
    filterQuery: 'category=Parfums&q=homme',
    keywords: ['parfum', 'eau de toilette', 'eau de parfum', 'homme'],
  },
];

interface DBProduct {
  id: number;
  name: string;
  nameAr?: string | null;
  price: number;
  image: string;
  description?: string | null;
  descriptionAr?: string | null;
  tags?: string[];
}

function matchKeywords(product: DBProduct, keywords: string[], excludeKeywords?: string[]): boolean {
  const text = (product.name + ' ' + (product.description || '') + ' ' + (product.tags?.join(' ') || '')).toLowerCase();
  const hasKeyword = keywords.some(k => text.includes(k.toLowerCase()));
  const hasExcluded = excludeKeywords?.some(k => text.includes(k.toLowerCase())) || false;
  return hasKeyword && !hasExcluded;
}

export default async function MaquillageParfumsPage() {
  const banners: Record<string, string> = {};

  // Récupérer les vrais produits de la catégorie "Maquillage et Parfums"
  const dbProducts = await getProducts('maquillage-et-parfums', 100);
  const allDbProducts: DBProduct[] = dbProducts;

  // Distribuer les produits DB dans les sections selon les mots-clés
  const stepsWithProducts = STEPS.map((step) => {
    const matched = allDbProducts
      .filter((p) => matchKeywords(p, step.keywords, step.excludeKeywords))
      .slice(0, 5)
      .map((p: DBProduct) => ({
        id: p.id,
        name: p.nameAr || p.name,
        price: p.price,
        image: p.image,
        description: p.descriptionAr || p.description || '',
      }));
    return {
      ...step,
      products: matched,
    };
  });

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

        {stepsWithProducts.map((step) => {
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
