import { CollectionCarousel } from './CollectionCarousel';

export function EssentialsSection({ products }: { products: any[] }) {
  return (
    <CollectionCarousel 
      title="PROMOTIONS"
      imageSrc=""
      products={products}
      linkHref="/boutique"
      linkTitle="Découvrir tous nos essentiels"
    />
  );
}
