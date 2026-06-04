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
const OfficialShopsSection = dynamic(() => import('./components/OfficialShopsSection').then(mod => mod.OfficialShopsSection));
const KoreanStepsSection = dynamic(() => import('./components/KoreanStepsSection').then(mod => mod.KoreanStepsSection));

function App({ bestSellers: initialBestSellers }: { bestSellers: any[] }) {
  const bestSellersBanner = LOCAL_BANNERS.bestSellers;
  const [promoProducts, setPromoProducts] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [makeupParfums, setMakeupParfums] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>(initialBestSellers);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);
  const [koreanProducts, setKoreanProducts] = useState<any[]>([]);
  const [loadingKorean, setLoadingKorean] = useState(true);

  useEffect(() => {
    // Track page view
    fetch('/api/track-view', { method: 'POST' }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/products?isPromo=true&random=true&limit=20')
      .then(r => r.json())
      .then(data => {
        setPromoProducts(data.products || []);
        setLoadingPromos(false);
      })
      .catch(() => setLoadingPromos(false));
  }, []);

  useEffect(() => {
    fetch('/api/products?isEssential=true&random=true&limit=20')
      .then(r => r.json())
      .then(data => {
        setBestSellers(data.products || []);
        setLoadingBestSellers(false);
      })
      .catch(() => setLoadingBestSellers(false));
  }, []);

  useEffect(() => {
    fetch('/api/products?category=K-Beauty&isVisible=true&random=true&limit=40')
      .then(r => r.json())
      .then(data => {
        setKoreanProducts(data.products || []);
        setLoadingKorean(false);
      })
      .catch(() => setLoadingKorean(false));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?category=Maquillage&isVisible=true&random=true&limit=20').then(r => r.json()),
      fetch('/api/products?category=Parfums&isVisible=true&random=true&limit=20').then(r => r.json()),
    ])
      .then(([maquillageData, parfumsData]) => {
        const maquillage = maquillageData.products || [];
        const parfums = parfumsData.products || [];
        const combined = [...maquillage, ...parfums];

        // Fallback: si aucun produit trouve, essayer la categorie combinee
        if (combined.length === 0) {
          fetch('/api/products?category=maquillage-et-parfums&isVisible=true&random=true&limit=20')
            .then(r => r.json())
            .then(data => setMakeupParfums(data.products || []));
        } else {
          setMakeupParfums(combined.slice(0, 20));
        }
      })
      .catch(() => setMakeupParfums([]));
  }, []);

  return (
    <>
      <AffichesSection />

      {loadingPromos ? (
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>Chargement des promotions...</span>
        </div>
      ) : (
        <EssentialsSection products={promoProducts} />
      )}

      {koreanProducts.length > 0 && (
        <CollectionCarousel
          title="K-BEAUTY"
          imageSrc=""
          products={koreanProducts}
          linkHref="/boutique?category=K-Beauty"
          linkTitle="Découvrir la K-Beauty"
        />
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

      <SupplementsSection />

      {loadingBestSellers ? (
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>Chargement des meilleures ventes...</span>
        </div>
      ) : (
        <CollectionCarousel 
          title="MEILLEURES VENTES"
          imageSrc={bestSellersBanner}
          products={bestSellers}
          linkHref="/boutique?isEssential=true"
          linkTitle="Découvrir les meilleures ventes"
        />
      )}

      <Categories />

      <KoreanStepsSection />

      <OfficialShopsSection />

      <IngredientsSection />

      <div className="section-footer text-center mt-2xl">
        <Link href="/boutique" className="see-more-products-cta mt-lg mx-auto" style={{ display: 'inline-flex' }}>
          <span>VOIR PLUS DE PRODUITS</span> <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );
}

export default App;
