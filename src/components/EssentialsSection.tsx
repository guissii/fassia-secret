import { CollectionCarousel } from './CollectionCarousel';

import { LOCAL_BANNERS } from '../lib/bannersConfig';

export function EssentialsSection({ products }: { products: any[] }) {
  const bannerUrl = LOCAL_BANNERS.essentials;

  return (
    <CollectionCarousel 
      title="ESSENTIELS"
      imageSrc={bannerUrl}
      products={products}
      linkHref="/essentiels"
      linkTitle="Découvrir tous nos essentiels"
    />
  );
}
