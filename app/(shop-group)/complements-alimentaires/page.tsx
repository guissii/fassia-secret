export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import type { Metadata } from 'next';
import ComplementsClientPage from '../../../src/ComplementsClientPage';
import { FOCUSES } from '../../../src/lib/supplementFocuses';

// Côté serveur: localhost direct, côté client: URL publique
const API_URL = typeof window === 'undefined'
  ? 'http://localhost:5000'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://fassiasecret.com');

async function getProductsByFocus(focusKey: string) {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=20&supplementFocus=${focusKey}&isVisible=true`, {
      cache: 'no-store',
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
  // Charger les produits par focus depuis la DB
  const productsByFocus: Record<string, any[]> = {};
  await Promise.all(
    FOCUSES.map(async (f) => {
      productsByFocus[f.key] = await getProductsByFocus(f.key);
    })
  );

  return (
    <Suspense>
      <ComplementsClientPage productsByFocus={productsByFocus} />
    </Suspense>
  );
}
