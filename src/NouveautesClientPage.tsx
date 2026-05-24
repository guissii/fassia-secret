"use client";

import { ALL_PRODUCTS } from './data/products';
import { CollectionCarousel } from './components/CollectionCarousel';

export default function NouveautesClientPage() {
  const nouveautes = ALL_PRODUCTS.filter((p) => p.badge === 'Nouveau').slice(0, 4);

  return (
    <CollectionCarousel 
      title="NOUVEAUTÉS"
      imageSrc="19bd7403-d2ac-49a4-a584-be5895add421.png"
      products={nouveautes}
      linkHref="/nouveautes"
      linkTitle="Découvrir toutes les nouveautés"
    />
  );
}
