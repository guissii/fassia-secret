import { ALL_PRODUCTS } from '../data/products';
import { CollectionCarousel } from './CollectionCarousel';

export function EssentialsSection() {
  const essentials = ALL_PRODUCTS.filter((p) => p.category === 'K-Beauty').slice(0, 3);

  return (
    <CollectionCarousel 
      title="ESSENTIELS"
      imageSrc="ca  quon va utiiser.png"
      products={essentials}
      linkHref="/essentiels"
      linkTitle="Découvrir tous nos essentiels"
    />
  );
}
