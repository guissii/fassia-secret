import { Suspense } from 'react';
import type { Metadata } from 'next';
import BoutiqueClientPage from '@/BoutiqueClientPage';

export const metadata: Metadata = {
  title: 'Boutique — Tous les Produits',
  description: 'Découvrez tous nos produits parapharmacie : soins visage, corps, cheveux, maquillage, K-Beauty et compléments alimentaires. Livraison au Maroc.',
  openGraph: {
    title: 'Boutique Fassia Secret — Tous les Produits',
    description: 'Soins, maquillage, compléments : +200 produits parapharmacie au Maroc.',
  },
};


export default function BoutiquePage() {
  return (
    <Suspense>
      <BoutiqueClientPage />
    </Suspense>
  );
}
