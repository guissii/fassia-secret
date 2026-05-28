import { getPageCollections } from '../../../src/lib/collections';
import AccessoiresClientPage from '../../../src/AccessoiresClientPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessoires & Matériel',
  description: 'Accessoires de beauté, pinceaux, éponges, et matériel parapharmacie.',
  openGraph: {
    title: 'Accessoires de Beauté — Fassia Secret',
    description: 'Pinceaux de maquillage et accessoires beauté au Maroc.',
  },
};

export const dynamic = 'force-dynamic';

export default async function AccessoiresPage() {
  const collections = await getPageCollections('accessoires');

  return <AccessoiresClientPage collections={collections} />;
}
