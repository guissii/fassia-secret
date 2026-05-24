import { getPageCollections } from '@/lib/collections';
import AccessoiresClientPage from '@/AccessoiresClientPage';

export const revalidate = 3600; // ISR: revalidate every hour

export default async function AccessoiresPage() {
  const collections = await getPageCollections('accessoires');

  return <AccessoiresClientPage collections={collections} />;
}
