import { getPageCollections } from '@/lib/collections';
import AccessoiresClientPage from '@/AccessoiresClientPage';

export const dynamic = 'force-dynamic';

export default async function AccessoiresPage() {
  const collections = await getPageCollections('accessoires');

  return <AccessoiresClientPage collections={collections} />;
}
