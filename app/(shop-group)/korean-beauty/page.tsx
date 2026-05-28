
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import './page.css';
import { ProductCarousel } from '../../../src/components/ProductCarousel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fassiasecret.com';

async function getKBeautyProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=100&category=K-Beauty`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

// Check if image is data URI (base64) - higher priority
function isDataUri(image: string): boolean {
  return image?.startsWith('data:') || false;
}

// Sort products: data URI images first, then by price
type DBProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  nameAr?: string;
  descriptionAr?: string;
};

function sortByImagePriority(products: DBProduct[]): DBProduct[] {
  return [...products].sort((a, b) => {
    const aData = isDataUri(a.image) ? 1 : 0;
    const bData = isDataUri(b.image) ? 1 : 0;
    return bData - aData; // data URI first
  });
}

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

const kbImageUrl = (prompt: string, imageSize: string = 'portrait_4_3') => {
  return '/logo.png';
};

const visualImg = (prompt: string) => kbImageUrl(prompt, 'portrait_4_3');
const productImg = (prompt: string) => kbImageUrl(prompt, 'square');

const STEPS: Step[] = [
  {
    id: 1,
    sectionKey: 'kb-oil-cleanser',
    title: 'Huile Démaquillante',
    visualImage: '/images/banners/HUILE DEMAQILLANT.webp',
    products: [
      { id: 101, name: 'Centella Light Cleansing Oil', description: 'Huile démaquillante légère à la Centella', price: 32.00, image: productImg('Packshot produit K-beauty, huile nettoyante à la Centella, fond blanc rose premium, style e-commerce, lumière studio douce, haute définition') },
      { id: 102, name: 'Ginseng Cleansing Oil', description: 'Huile riche en Ginseng anti-âge', price: 38.00, image: productImg('Packshot produit K-beauty, huile nettoyante au ginseng, fond clair beige rosé, style e-commerce luxe, lumière studio, haute définition') },
      { id: 103, name: 'Heartleaf Pore Cleansing Oil', description: 'Pour purifier les pores en profondeur', price: 29.00, image: productImg('Packshot produit K-beauty, huile nettoyante heartleaf pour pores, fond clair premium, style e-commerce, lumière studio, haute définition') },
    ],
    filterQuery: 'category=K-Beauty'
  },
  {
    id: 2,
    sectionKey: 'kb-foam-cleanser',
    title: 'Nettoyant Moussant',
    visualImage: '/images/banners/NETTOANT MOUSSANT.webp',
    products: [
      { id: 201, name: 'Low pH Good Morning Gel', description: 'Nettoyant doux au pH neutre', price: 22.00, image: productImg('Packshot produit K-beauty, gel nettoyant low pH, fond blanc premium, style e-commerce, haute définition') },
      { id: 202, name: 'Heartleaf Quercetinol Foam', description: 'Mousse apaisante contre l\'acné', price: 24.00, image: productImg('Packshot produit K-beauty, mousse nettoyante heartleaf, fond rose pâle premium, style e-commerce, haute définition') },
      { id: 203, name: 'Salicylic Acid Daily Cleanser', description: 'Idéal pour les peaux grasses', price: 20.00, image: productImg('Packshot produit K-beauty, nettoyant acide salicylique, fond beige rosé, style e-commerce luxe, haute définition') },
    ],
    filterQuery: 'category=K-Beauty&q=foam'
  },
  {
    id: 3,
    sectionKey: 'kb-exfoliator',
    title: 'Exfoliant',
    visualImage: '/images/banners/Exfoliant.webp',
    products: [
      { id: 301, name: 'BHA Blackhead Power Liquid', description: 'Exfoliant chimique contre les points noirs', price: 28.00, image: productImg('Packshot produit K-beauty, exfoliant BHA anti-points noirs, fond blanc rose, style e-commerce, haute définition') },
      { id: 302, name: 'AHA 7 Whitehead Power', description: 'Affine le grain de peau en douceur', price: 26.00, image: productImg('Packshot produit K-beauty, exfoliant AHA doux, fond beige clair, style e-commerce luxe, haute définition') },
      { id: 303, name: 'Apricot Peeling Gel', description: 'Gommage pelucheux doux', price: 24.00, image: productImg('Packshot produit K-beauty, peeling gel abricot, fond rose pâle, style e-commerce premium, haute définition') },
    ],
    filterQuery: 'category=K-Beauty'
  },
  {
    id: 4,
    sectionKey: 'kb-toner',
    title: 'Lotion Tonique',
    visualImage: '/images/banners/Lotion Tonique.webp',
    products: [
      { id: 401, name: 'Heartleaf 77% Soothing Toner', description: 'Lotion apaisante très concentrée', price: 25.00, image: productImg('Packshot produit K-beauty, toner apaisant heartleaf 77%, fond blanc premium, style e-commerce, haute définition') },
      { id: 402, name: 'Centella Toning Water', description: 'Prépare la peau tout en douceur', price: 23.00, image: productImg('Packshot produit K-beauty, toner à la centella, fond beige rosé, style e-commerce, haute définition') },
      { id: 403, name: 'Ginseng Essence Water', description: 'Eau de ginseng anti-âge tonifiante', price: 28.00, image: productImg('Packshot produit K-beauty, essence water au ginseng, fond clair premium, style e-commerce luxe, haute définition') },
    ],
    filterQuery: 'category=K-Beauty&q=toner'
  },
  {
    id: 5,
    sectionKey: 'kb-essence',
    title: 'Essence',
    visualImage: '/images/banners/essence.webp',
    products: [
      { id: 501, name: 'Snail 96 Mucin Power Essence', description: 'Bave d\'escargot hydratante iconique', price: 32.00, image: productImg('Packshot produit K-beauty, essence mucin snail 96, fond blanc rose, style e-commerce premium, haute définition') },
      { id: 502, name: 'Galactomyces 95 Tone Balancing', description: 'Éclat et unifie le teint', price: 34.00, image: productImg('Packshot produit K-beauty, essence galactomyces 95, fond beige clair, style e-commerce, haute définition') },
      { id: 503, name: 'Kombucha Tea Essence', description: 'Soin fermenté éclatant au kombucha', price: 38.00, image: productImg('Packshot produit K-beauty, essence kombucha tea fermentée, fond rose pâle, style e-commerce luxe, haute définition') },
    ],
    filterQuery: 'category=K-Beauty'
  },
  {
    id: 6,
    sectionKey: 'kb-serum',
    title: 'Sérum & Ampoule',
    visualImage: '/images/banners/serum et ampule.webp',
    products: [
      { id: 601, name: 'Glow Serum Propolis + Niacinamide', description: 'Sérum coup d\'éclat au miel', price: 29.00, image: productImg('Packshot produit K-beauty, sérum propolis niacinamide, fond clair premium, style e-commerce, haute définition') },
      { id: 602, name: 'Dark Spot Correcting Serum', description: 'Corrige les taches brunes', price: 31.00, image: productImg('Packshot produit K-beauty, sérum anti-taches, fond beige rosé, style e-commerce luxe, haute définition') },
      { id: 603, name: 'Centella Asiatica Ampoule', description: 'Concentré 100% réparateur', price: 27.00, image: productImg('Packshot produit K-beauty, ampoule centella asiatica, fond blanc premium, style e-commerce, haute définition') },
    ],
    filterQuery: 'category=K-Beauty&q=ampoule'
  },
  {
    id: 7,
    sectionKey: 'kb-sheet-mask',
    title: 'Masque Tissu',
    visualImage: '/images/banners/masque tissu.webp',
    products: [
      { id: 701, name: 'Collagen Impact Essential Mask', description: 'Masque tissu anti-âge au collagène', price: 18.00, image: productImg('Packshot produit K-beauty, sheet mask collagène anti-âge, fond clair premium, style e-commerce, haute définition') },
      { id: 702, name: 'Teatree Care Solution Mask', description: 'Masque à l\'arbre à thé anti-imperfections', price: 15.00, image: productImg('Packshot produit K-beauty, sheet mask tea tree anti-imperfections, fond blanc rose, style e-commerce premium, haute définition') },
      { id: 703, name: 'Watermide Hydrating Mask', description: 'Boost d\'hydratation instantané', price: 16.00, image: productImg('Packshot produit K-beauty, sheet mask hydratation watermide, fond beige rosé, style e-commerce, haute définition') },
    ],
    filterQuery: 'category=K-Beauty'
  },
  {
    id: 8,
    sectionKey: 'kb-eye-cream',
    title: 'Contour des Yeux',
    visualImage: '/images/banners/contour des yeux.webp',
    products: [
      { id: 801, name: 'Revitalize Ginseng Eye Cream', description: 'Contour des yeux anti-rides', price: 48.00, image: productImg('Packshot produit K-beauty, eye cream au ginseng, fond blanc premium, style e-commerce luxe, haute définition') },
      { id: 802, name: 'Snail Peptide Eye Cream', description: 'Combat les cernes et lisse la peau', price: 42.00, image: productImg('Packshot produit K-beauty, eye cream peptide snail, fond beige rosé, style e-commerce, haute définition') },
      { id: 803, name: 'Retinol Intense Eye Cream', description: 'Contour des yeux puissant au rétinol', price: 39.00, image: productImg('Packshot produit K-beauty, eye cream rétinol intense, fond clair premium, style e-commerce, haute définition') },
    ],
    filterQuery: 'category=K-Beauty'
  },
  {
    id: 9,
    sectionKey: 'kb-moisturizer',
    title: 'Crème Hydratante',
    visualImage: '/images/banners/Crème Hydratante.webp',
    products: [
      { id: 901, name: 'Dynasty Cream', description: 'Crème riche iconique au ginseng', price: 45.00, image: productImg('Packshot produit K-beauty, crème hydratante au ginseng, fond clair premium, style e-commerce luxe, haute définition') },
      { id: 902, name: 'Centella Soothing Cream', description: 'Crème légère réparatrice barrière cutanée', price: 38.00, image: productImg('Packshot produit K-beauty, crème apaisante centella, fond beige rosé, style e-commerce premium, haute définition') },
      { id: 903, name: 'Advanced Snail 92 All in One', description: 'Gel-crème réparateur à la bave d\'escargot', price: 35.00, image: productImg('Packshot produit K-beauty, gel-crème snail 92, fond blanc rose, style e-commerce, haute définition') },
    ],
    filterQuery: 'category=K-Beauty'
  },
  {
    id: 10,
    sectionKey: 'kb-sunscreen',
    title: 'Crème Solaire',
    visualImage: '/images/banners/creme solaire.webp',
    products: [
      { id: 1001, name: 'Relief Sun : Rice + Probiotics', description: 'Écran solaire léger riz et probiotiques', price: 28.00, image: productImg('Packshot produit K-beauty, sunscreen rice probiotics, fond clair premium, style e-commerce luxe, haute définition') },
      { id: 1002, name: 'Hyaluronic Acid Watery Sun Gel', description: 'Gel solaire hydratant fini invisible', price: 32.00, image: productImg('Packshot produit K-beauty, sun gel acide hyaluronique watery, fond beige rosé, style e-commerce premium, haute définition') },
      { id: 1003, name: 'Aloe Soothing Sun Cream', description: 'Crème solaire apaisante à l\'aloé vera', price: 25.00, image: productImg('Packshot produit K-beauty, sunscreen aloe vera apaisant, fond blanc rose, style e-commerce, haute définition') },
    ],
    filterQuery: 'category=K-Beauty'
  },
];


// Map a scraped product to a step (1-10) based on its name/description keywords
function assignStep(product: DBProduct): number {
  const text = (product.name + ' ' + product.description).toLowerCase();

  if (text.includes('oil') || text.includes('huile') || text.includes('cleansing oil') || text.includes('démaquillant')) return 1;
  if (text.includes('foam') || text.includes('mousse') || text.includes('cleanser') || text.includes('nettoyant') || text.includes('gel')) return 2;
  if (text.includes('exfoliant') || text.includes('peeling') || text.includes('scrub') || text.includes('aha') || text.includes('bha')) return 3;
  if (text.includes('toner') || text.includes('lotion') || text.includes('tonique')) return 4;
  if (text.includes('essence') && !text.includes('sun')) return 5;
  if (text.includes('serum') || text.includes('sérum') || text.includes('ampoule')) return 6;
  if (text.includes('mask') || text.includes('masque')) return 7;
  if (text.includes('eye') || text.includes('yeux') || text.includes('contour')) return 8;
  if (text.includes('cream') || text.includes('crème') || text.includes('moisturizer') || text.includes('hydratant') || text.includes('lotion')) return 9;
  if (text.includes('sun') || text.includes('solaire') || text.includes('spf') || text.includes('sunscreen')) return 10;

  // Default: moisturizer (step 9) as catch-all
  return 9;
}

export default async function KoreanBeautyPage() {
  const banners: Record<string, string> = {};

  // Fetch real products from DB
  const dbProducts = await getKBeautyProducts();
  const sortedDbProducts = sortByImagePriority(dbProducts);

  // Map DB products to steps
  const stepProducts: Record<number, DBProduct[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] };
  for (const product of sortedDbProducts) {
    const stepId = assignStep(product);
    stepProducts[stepId].push(product);
  }

  // Merge with hardcoded steps: data URI products first, then hardcoded, then rest
  const mergedSteps = STEPS.map((step) => {
    const hardcoded = step.products.map((p) => ({ ...p, description: p.description || '' }));
    const scraped = stepProducts[step.id] || [];

    // Combine: data URI first, then hardcoded, then scraped with regular images
    const dataUriProducts = scraped.filter((p) => isDataUri(p.image));
    const regularScraped = scraped.filter((p) => !isDataUri(p.image));

    const combined = [
      ...dataUriProducts.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image, description: p.descriptionAr || p.description || '' })),
      ...hardcoded,
      ...regularScraped.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image, description: p.descriptionAr || p.description || '' })),
    ];

    return { ...step, products: combined.slice(0, 6) }; // Max 6 products per step
  });

  return (
    <>
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

      {/* 10 Steps — merged with DB products, data URI prioritized */}
      {mergedSteps.map((step) => {
        const visualImageUrl = banners[step.sectionKey] || step.visualImage;
        return (
          <section className="essentials-section" key={step.id}>
            <div className="container">
              {/* Step Header */}
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
                productLabel="K-BEAUTY"
                seeMoreHref={`/boutique?${step.filterQuery}`}
              />
            </div>
          </section>
        );
      })}

      {/* Global CTA */}
      <section className="kb-global-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <Link href="/boutique?category=K-Beauty" className="kb-global-cta-link">
            <span className="kb-global-cta-text">
              <span className="kb-global-cta-title">Catalogue K-Beauty</span>
            </span>
            <span className="kb-global-cta-icon" aria-hidden="true">
              <ArrowRight size={24} />
            </span>
          </Link>
        </div>
      </section>

      <Link href="/" className="kb-nav-bubble" aria-label="Retour à l'accueil">
          N°
        </Link>
      </main>
    </>
  );
}
