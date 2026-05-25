import { getPageCollections } from '@/lib/collections';
import HommeClientPage from '@/HommeClientPage';

export const dynamic = 'force-dynamic';

export default async function HommePage() {
  const collections = await getPageCollections('homme');

  return <HommeClientPage collections={collections} />;
}
