import { notFound } from 'next/navigation';

import ProductClientPage from '@/ProductClientPage';
import type { Metadata } from 'next';
import { parseProductIdFromSlug } from '@/lib/productSlug';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) return { title: 'Produit non trouvé' };
  let product: any = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?limit=500`, { next: { revalidate: 60 } });
    const data = await res.json();
    if (data && data.products) {
      product = data.products.find((p: any) => p.id === id);
    }
  } catch (e) {
    console.error(e);
  }

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

  let product: any = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products?limit=500`, { cache: 'no-store' });
    const data = await res.json();
    if (data && data.products) {
      product = data.products.find((p: any) => p.id === id);
    }
  } catch (e) {
    console.error(e);
  }

  if (!product) return notFound();

  return <ProductClientPage product={product} />;
}
