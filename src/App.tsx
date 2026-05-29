'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EssentialsSection } from './components/EssentialsSection';
import { MakeupParfumsSection } from './components/MakeupParfumsSection';
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
const KoreanRoutineSection = dynamic(() => import('./components/KoreanRoutineSection').then(mod => mod.KoreanRoutineSection));

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function App({ bestSellers }: { bestSellers: any[] }) {
  const bestSellersBanner = LOCAL_BANNERS.bestSellers;
  const [essentials, setEssentials] = useState<any[]>([]);
  const [loadingEssentials, setLoadingEssentials] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products?isEssential=true&random=true&limit=10`)
      .then(r => r.json())
      .then(data => {
        setEssentials(data.products || []);
        setLoadingEssentials(false);
      })
      .catch(() => setLoadingEssentials(false));
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
      <MakeupParfumsSection />

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

      <KoreanRoutineSection />

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
