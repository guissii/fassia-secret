import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BoutiqueClientPage from '../../../../src/BoutiqueClientPage';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let collectionName = slug;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/collections`, { next: { revalidate: 60 } });
    const data = await res.json();
    const collections = data.collections || [];
    const collection = collections.find((c: any) => c.slug === slug);
    if (collection) collectionName = collection.name;
  } catch {
    // ignore
  }
  return {
    title: `${collectionName} — Fassia Secret`,
    description: `Découvrez nos produits ${collectionName} chez Fassia Secret. Livraison au Maroc.`,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let collectionName = slug;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/collections`, { cache: 'no-store' });
    const data = await res.json();
    const collections = data.collections || [];
    const collection = collections.find((c: any) => c.slug === slug);
    if (collection) collectionName = collection.name;
  } catch {
    // ignore
  }

  return (
    <BoutiqueClientPage collectionSlug={slug} collectionName={collectionName} />
  );
}
