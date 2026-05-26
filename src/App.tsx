"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Hero } from './components/Hero';
import { EssentialsSection } from './components/EssentialsSection';
import { MakeupParfumsSection } from './components/MakeupParfumsSection';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Lazy load components that are below the fold to improve initial page load performance
const IngredientsSection = dynamic(() => import('./components/IngredientsSection').then(mod => mod.IngredientsSection));
const SupplementsSection = dynamic(() => import('./components/SupplementsSection').then(mod => mod.SupplementsSection));
const CollectionCarousel = dynamic(() => import('./components/CollectionCarousel').then(mod => mod.CollectionCarousel));
const Categories = dynamic(() => import('./components/Categories').then(mod => mod.Categories));
const Brands = dynamic(() => import('./components/Brands').then(mod => mod.Brands));
const KoreanRoutineSection = dynamic(() => import('./components/KoreanRoutineSection').then(mod => mod.KoreanRoutineSection));

function App() {
  const [bestSellers, setBestSellers] = React.useState<any[]>([]);
  const [bestSellersBanner, setBestSellersBanner] = React.useState<string>("");

  React.useEffect(() => {
    fetch('/api/products?limit=6')
      .then(res => res.json())
      .then(data => {
        if (data.products) setBestSellers(data.products);
      })
      .catch(console.error);

    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const banner = data.find(b => b.section === 'best_sellers');
          if (banner && banner.imageUrl) {
            setBestSellersBanner(banner.imageUrl);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Hero />

      <EssentialsSection />
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
