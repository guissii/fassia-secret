import { Suspense } from 'react';
import type { Metadata } from 'next';
import ComplementsClientPage from '@/ComplementsClientPage';

export const metadata: Metadata = {
  title: 'Compléments Alimentaires',
  description: 'Compléments alimentaires premium : magnésium, ashwagandha, collagène, probiotiques, oméga-3 et plus. Qualité et efficacité garanties.',
  openGraph: {
    title: 'Compléments Alimentaires — Fassia Secret',
    description: 'Magnésium, ashwagandha, collagène, probiotiques et plus.',
  },
};


export default function ComplementsAlimentairesPage() {
  return (
    <Suspense>
      <ComplementsClientPage />
    </Suspense>
  );
}
