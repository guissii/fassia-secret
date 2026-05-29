import App from '../../src/App';

async function fetchEssentials(categorySlug: string, limit: number) {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('isEssential', 'true');
    url.searchParams.append('random', 'true');
    url.searchParams.append('category', categorySlug);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

async function fetchProducts(category?: string) {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
    url.searchParams.append('limit', '6');
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export default async function Page() {
  const [bestSellers, koreanBeauty, complements] = await Promise.all([
    fetchProducts(),
    fetchEssentials('korean-beauty', 5),
    fetchEssentials('complements-alimentaires', 5)
  ]);

  // Mélanger les produits Korean Beauty + Compléments pour les essentiels
  const essentials = [...koreanBeauty, ...complements];

  return <App bestSellers={bestSellers} essentials={essentials} />;
}
