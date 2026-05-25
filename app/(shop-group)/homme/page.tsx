import { getPageCollections } from '@/lib/collections';
import HommeClientPage from '@/HommeClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soins Homme',
  description: 'Découvrez notre gamme de soins pour homme : rasage, hydratation, anti-âge et parfums.',
  openGraph: {
    title: 'Soins Homme — Fassia Secret',
    description: 'La parapharmacie au masculin. Soins et parfums pour homme.',
  },
};

export const dynamic = 'force-dynamic';

export default async function HommePage() {
  const collections = await getPageCollections('homme');

  return <HommeClientPage collections={collections} />;
}
