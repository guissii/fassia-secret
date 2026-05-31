'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EssentialsSection } from './components/EssentialsSection';
import { AffichesSection } from './components/AffichesSection';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LOCAL_BANNERS } from './lib/bannersConfig';

// Lazy load components that are below the fold to improve initial page load performance
const IngredientsSection = dynamic(() => import('./components/IngredientsSection').then(mod => mod.IngredientsSection));
const SupplementsSection = dynamic(() => import('./components/SupplementsSection').then(mod => mod.SupplementsSection));
const CollectionCarousel = dynamic(() => import('./components/CollectionCarousel').then(mod => mod.CollectionCarousel));
const Categories = dynamic(() => import('./components/Categories').then(mod => mod.Categories));
const Brands = dynamic(() => import('./components/Brands').then(mod => mod.Brands));
const KoreanStepsSection = dynamic(() => import('./components/KoreanStepsSection').then(mod => mod.KoreanStepsSection));

function App({ bestSellers }: { bestSellers: any[] }) {
  const bestSellersBanner = LOCAL_BANNERS.bestSellers;
  const [essentials, setEssentials] = useState<any[]>([]);
  const [loadingEssentials, setLoadingEssentials] = useState(true);
  const [makeupParfums, setMakeupParfums] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products?isEssential=true&random=true&limit=10')
      .then(r => r.json())
      .then(data => {
        setEssentials(data.products || []);
        setLoadingEssentials(false);
      })
      .catch(() => setLoadingEssentials(false));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?category=Maquillage&isVisible=true&limit=5').then(r => r.json()),
      fetch('/api/products?category=Parfums&isVisible=true&limit=5').then(r => r.json()),
    ])
      .then(([maquillageData, parfumsData]) => {
        const maquillage = maquillageData.products || [];
        const parfums = parfumsData.products || [];
        const combined = [...maquillage, ...parfums];

        // Fallback: si aucun produit trouve, essayer la categorie combinee
        if (combined.length === 0) {
          fetch('/api/products?category=maquillage-et-parfums&isVisible=true&limit=10')
            .then(r => r.json())
            .then(data => setMakeupParfums(data.products || []));
        } else {
          setMakeupParfums(combined.slice(0, 10));
        }
      })
      .catch(() => setMakeupParfums([]));
  }, []);

  return (
    <>
      <AffichesSection />

      {loadingEssentials ? (
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>Chargement des essentiels...</span>
        </div>
      ) : (
        <EssentialsSection products={essentials} />
      )}

      {makeupParfums.length > 0 && (
        <CollectionCarousel
          title="MAQUILLAGE & PARFUMS"
          imageSrc=""
          products={makeupParfums}
          linkHref="/boutique?category=Maquillage"
          linkTitle="Découvrir le maquillage et les parfums"
        />
      )}

      <IngredientsSection />

      <SupplementsSection />

      <CollectionCarousel 
        title="MEILLEURES VENTES"
        imageSrc={bestSellersBanner}
        products={bestSellers}
        linkHref="/boutique"
        linkTitle="Découvrir les meilleures ventes"
      />

      <Categories />

      <KoreanStepsSection />

      <Brands />

      <div className="section-footer text-center mt-2xl">
        <Link href="/boutique" className="see-more-products-cta mt-lg mx-auto" style={{ display: 'inline-flex' }}>
          <span>VOIR PLUS DE PRODUITS</span> <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}

export default App;
