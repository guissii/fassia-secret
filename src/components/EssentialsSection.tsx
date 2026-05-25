import { useEffect, useState } from 'react';
import { ALL_PRODUCTS } from '../data/products';
import { CollectionCarousel } from './CollectionCarousel';

export function EssentialsSection() {
  const [bannerUrl, setBannerUrl] = useState<string>("ca  quon va utiiser.png");
  const essentials = ALL_PRODUCTS.filter((p) => p.category === 'K-Beauty').slice(0, 3);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const essBanner = data.find(b => b.section === 'essentials');
          if (essBanner && essBanner.imageUrl) {
            setBannerUrl(essBanner.imageUrl);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <CollectionCarousel 
      title="ESSENTIELS"
      imageSrc={bannerUrl}
      products={essentials}
      linkHref="/essentiels"
      linkTitle="Découvrir tous nos essentiels"
    />
  );
}
