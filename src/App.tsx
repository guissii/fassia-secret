'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EssentialsSection } from './components/EssentialsSection';
import { AffichesSection } from './components/AffichesSection';
import { NouveautesSection } from './components/NouveautesSection';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Lazy load components that are below the fold to improve initial page load performance
const IngredientsSection = dynamic(() => import('./components/IngredientsSection').then(mod => mod.IngredientsSection));
const SupplementsSection = dynamic(() => import('./components/SupplementsSection').then(mod => mod.SupplementsSection));
const CollectionCarousel = dynamic(() => import('./components/CollectionCarousel').then(mod => mod.CollectionCarousel));
const Categories = dynamic(() => import('./components/Categories').then(mod => mod.Categories));
const OfficialShopsSection = dynamic(() => import('./components/OfficialShopsSection').then(mod => mod.OfficialShopsSection));
const KoreanStepsSection = dynamic(() => import('./components/KoreanStepsSection').then(mod => mod.KoreanStepsSection));
const MakeupParfumsSection = dynamic(() => import('./components/MakeupParfumsSection').then(mod => mod.MakeupParfumsSection));

function App({ bestSellers: initialBestSellers }: { bestSellers: any[] }) {
  const [nouveautes, setNouveautes] = useState<any[]>([]);
  const [loadingNouveautes, setLoadingNouveautes] = useState(true);
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [bestSellers, setBestSellers] = useState<any[]>(initialBestSellers);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);
  const [koreanProducts, setKoreanProducts] = useState<any[]>([]);
  const [loadingKorean, setLoadingKorean] = useState(true);

  useEffect(() => {
    // Track page view
    fetch('/api/track-view', { method: 'POST' }).catch(() => {});
  }, []);

  // 1. NOUVEAUTÉS - sélection manuelle depuis admin
  useEffect(() => {
    fetch('/api/products?isNew=true&limit=40')
      .then(r => r.json())
      .then(data => {
        setNouveautes(data.products || []);
        setLoadingNouveautes(false);
      })
      .catch(() => setLoadingNouveautes(false));
  }, []);

  // 2. HMIZAT
  useEffect(() => {
    fetch('/api/products?isPromo=true&random=true&limit=40')
      .then(r => r.json())
      .then(data => {
        setPromoProducts(data.products || []);
        setLoadingPromos(false);
      })
      .catch(() => setLoadingPromos(false));
  }, []);

  // 3. MEILLEURES VENTES
  useEffect(() => {
    fetch('/api/products?isEssential=true&random=true&limit=40')
      .then(r => r.json())
      .then(data => {
        setBestSellers(data.products || []);
        setLoadingBestSellers(false);
      })
      .catch(() => setLoadingBestSellers(false));
  }, []);

  // 4. K-BEAUTY carrousel
  useEffect(() => {
    fetch('/api/products?category=K-Beauty&isVisible=true&random=true&limit=40')
      .then(r => r.json())
      .then(data => {
        setKoreanProducts(data.products || []);
        setLoadingKorean(false);
      })
      .catch(() => setLoadingKorean(false));
  }, []);

  return (
    <>
      <AffichesSection />

      {/* 1. NOUVEAUTÉS */}
      {loadingNouveautes ? (
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>Chargement des nouveautés...</span>
        </div>
      ) : (
        <NouveautesSection products={nouveautes} />
      )}

      {/* 2. HMIZAT (Promotions) */}
      {loadingPromos ? (
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>Chargement des promotions...</span>
        </div>
      ) : (
        <EssentialsSection products={promoProducts} />
      )}

      {/* 3. MEILLEURES VENTES */}
      {loadingBestSellers ? (
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>Chargement des meilleures ventes...</span>
        </div>
      ) : (
        <CollectionCarousel 
          title="MEILLEURES VENTES"
          imageSrc=""
          products={bestSellers}
          linkHref="/boutique?isEssential=true"
          linkTitle="Découvrir les meilleures ventes"
        />
      )}

      {/* 4. K-BEAUTY carrousel */}
      {koreanProducts.length > 0 && (
        <CollectionCarousel
          title="K-BEAUTY"
          imageSrc=""
          products={koreanProducts}
          linkHref="/boutique?category=K-Beauty"
          linkTitle="Découvrir la K-Beauty"
        />
      )}

      {/* 5. COMPLÉMENTS ALIMENTAIRES */}
      <SupplementsSection />

      {/* 6. Korean Steps (étapes) */}
      <KoreanStepsSection />

      {/* 7. Maquillage & Parfums (types/steps) */}
      <MakeupParfumsSection />

      {/* 8. CATÉGORIE POPULAIRE */}
      <Categories />

      {/* 9. INGRÉDIENTS ACTIFS */}
      <IngredientsSection />

      {/* 10. BOUTIQUES OFFICIELLES */}
      <OfficialShopsSection />

      <div className="section-footer text-center mt-2xl">
        <Link href="/boutique" className="see-more-products-cta mt-lg mx-auto" style={{ display: 'inline-flex' }}>
          <span>VOIR PLUS DE PRODUITS</span> <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}

export default App;
