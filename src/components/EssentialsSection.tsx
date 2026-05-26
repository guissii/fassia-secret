import { useEffect, useState } from 'react';

import { CollectionCarousel } from './CollectionCarousel';

export function EssentialsSection() {
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [essentials, setEssentials] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products?category=K-Beauty&limit=6')
      .then(res => res.json())
      .then(data => {
        if (data.products) setEssentials(data.products);
      })
      .catch(console.error);

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
