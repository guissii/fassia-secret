import { getPageCollections } from '@/lib/collections';
import HommeClientPage from '@/HommeClientPage';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function HommePage() {
  const collections = await getPageCollections('homme');

  return <HommeClientPage collections={collections} />;
}
