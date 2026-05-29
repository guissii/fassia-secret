import App from '../../src/App';

async function fetchProducts(category?: string) {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
    url.searchParams.append('limit', '6');
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString(), { next: { revalidate: 60 } }); // Cache 60s
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
    fetchProducts('korean-beauty'),
    fetchProducts('complements-alimentaires')
  ]);

  // Mélanger les produits Korean Beauty + Compléments pour les essentiels
  const essentials = [...koreanBeauty.slice(0, 3), ...complements.slice(0, 3)];

  return <App bestSellers={bestSellers} essentials={essentials} />;
}
