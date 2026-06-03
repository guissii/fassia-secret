import { CollectionCarousel } from './CollectionCarousel';

export function EssentialsSection({ products }: { products: any[] }) {
  return (
    <CollectionCarousel 
      title="PROMOTIONS"
      imageSrc=""
      products={products}
      linkHref="/boutique?isPromo=true"
      linkTitle="Découvrir toutes les promotions"
    />
  );
}
