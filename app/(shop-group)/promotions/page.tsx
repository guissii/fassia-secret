import { Suspense } from 'react';
import type { Metadata } from 'next';
import PromotionsClientPage from '@/PromotionsClientPage';

export const metadata: Metadata = {
  title: 'Promotions & Bons Plans',
  description: 'Profitez des meilleures offres parapharmacie au Maroc. Réductions exclusives sur soins, maquillage et compléments alimentaires.',
  openGraph: {
    title: 'Promotions — Fassia Secret',
    description: 'Offres exclusives et bons plans parapharmacie au Maroc.',
  },
};


export default function PromotionsPage() {
  return (
    <Suspense>
      <PromotionsClientPage />
    </Suspense>
  );
}

