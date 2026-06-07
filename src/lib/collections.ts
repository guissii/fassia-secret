const API_URL = typeof window === 'undefined'
  ? 'http://localhost:5000'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://fassiasecret.com');

export async function getPageCollections(page: string, takeProducts: number = 4) {
  try {
    const res = await fetch(`${API_URL}/api/collections?page=${page}&includeProducts=true&productLimit=${takeProducts}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.collections || [];
  } catch {
    return [];
  }
}
