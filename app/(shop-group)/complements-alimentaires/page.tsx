import { Suspense } from 'react';
import type { Metadata } from 'next';
import ComplementsClientPage from '../../../src/ComplementsClientPage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fassiasecret.com';

async function getComplements() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=50&category=Complements`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Compléments Alimentaires',
  description: 'Compléments alimentaires premium : magnésium, ashwagandha, collagène, probiotiques, oméga-3 et plus. Qualité et efficacité garanties.',
  openGraph: {
    title: 'Compléments Alimentaires — Fassia Secret',
    description: 'Magnésium, ashwagandha, collagène, probiotiques et plus.',
  },
};

export default async function ComplementsAlimentairesPage() {
  const products = await getComplements();

  return (
    <Suspense>
      <ComplementsClientPage products={products} />
    </Suspense>
  );
}
