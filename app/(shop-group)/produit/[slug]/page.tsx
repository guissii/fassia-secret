import { notFound } from 'next/navigation';
import { ALL_PRODUCTS } from '@/data/products';
import ProductClientPage from '@/ProductClientPage';
import type { Metadata } from 'next';
import { parseProductIdFromSlug } from '@/lib/productSlug';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) return { title: 'Produit non trouvé' };
  const product = ALL_PRODUCTS.find((p) => p.id === id);
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

  const product = ALL_PRODUCTS.find((p) => p.id === id);
  if (!product) return notFound();

  return <ProductClientPage product={product} />;
}
