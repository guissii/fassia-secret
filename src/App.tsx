"use client";


import { Hero } from './components/Hero';
import { CollectionCarousel } from './components/CollectionCarousel';
import { Categories } from './components/Categories';
import { Brands } from './components/Brands';
import { EssentialsSection } from './components/EssentialsSection';
import { IngredientsSection } from './components/IngredientsSection';
import { MakeupParfumsSection } from './components/MakeupParfumsSection';
import { KoreanRoutineSection } from './components/KoreanRoutineSection';
import { SupplementsSection } from './components/SupplementsSection';
import { ALL_PRODUCTS } from './data/products';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function App() {
  const bestSellers = ALL_PRODUCTS.slice(0, 5);

  return (
    <>
      <Hero />

      <EssentialsSection />
      <MakeupParfumsSection />

      <IngredientsSection />

      <SupplementsSection />

      <CollectionCarousel 
        title="MEILLEURES VENTES"
        imageSrc="19bd7403-d2ac-49a4-a584-be5895add421.png"
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
