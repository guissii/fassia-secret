import { notFound } from 'next/navigation';

import ProductClientPage from '../../../../src/ProductClientPage';
import type { Metadata } from 'next';
import { parseProductIdFromSlug } from '../../../../src/lib/productSlug';

const API_URL = typeof window === 'undefined'
  ? 'http://localhost:5000'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://fassiasecret.com');

async function getProductById(id: number) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) return { title: 'Produit non trouvé' };

  const product = await getProductById(id);
  if (!product) return { title: 'Produit non trouvé' };

  return {
    title: `${product.name} - ${product.brand}`,
    description: product.description,
    openGraph: {
      title: `${product.name} - ${product.brand}`,
      description: product.description,
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) return notFound();

  const product = await getProductById(id);
  if (!product) return notFound();

  return <ProductClientPage product={product} />;
}
