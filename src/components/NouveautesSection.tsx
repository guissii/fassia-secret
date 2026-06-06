import { CollectionCarousel } from './CollectionCarousel';

export function NouveautesSection({ products }: { products: any[] }) {
  return (
    <CollectionCarousel 
      title="NOUVEAUTÉS"
      imageSrc=""
      products={products}
      linkHref="/boutique?isNew=true"
      linkTitle="Découvrir toutes les nouveautés"
    />
  );
}
