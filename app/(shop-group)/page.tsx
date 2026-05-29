import App from '../../src/App';

async function fetchEssentials(limit: number) {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('isEssential', 'true');
    url.searchParams.append('random', 'true');

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
  const [bestSellers, allEssentials] = await Promise.all([
    fetchProducts(),
    fetchEssentials(20)
  ]);

  // Séparer Korean Beauty (koreanBeautyStep) et Compléments (supplementFocus)
  const koreanBeauty = allEssentials.filter((p: any) => p.koreanBeautyStep != null);
  const complements = allEssentials.filter((p: any) => p.supplementFocus != null);

  // 5 de chaque, mélanger
  const essentials = [...koreanBeauty.slice(0, 5), ...complements.slice(0, 5)];

  return <App bestSellers={bestSellers} essentials={essentials} />;
}
