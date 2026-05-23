import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  stepId?: string;
  title: string;
  visualImage?: string;
  visualImageComponent?: React.ReactNode;
  products: any[];
  productLabel: string;
  seeMoreHref: string;
}

export function ProductCarousel({
  stepId,
  title,
  visualImage,
  visualImageComponent,
  products,
  productLabel,
  seeMoreHref,
}: ProductCarouselProps) {
  const firstProduct = products[0];
  const rest = products.slice(1);

  return (
    <div className="essentials-carousel">
      <div className="essentials-hero-pair">
        <div className="essentials-visual-tile">
          {visualImageComponent ? (
            visualImageComponent
          ) : (
            <img src={visualImage} alt={title} className="essentials-visual-img" loading="lazy" />
          )}
          <div className="kb-visual-overlay">
            {stepId && <span className="kb-overlay-step">{stepId}</span>}
            <h3 className="kb-overlay-title">{title}</h3>
          </div>
        </div>

        {firstProduct && <ProductCard product={firstProduct} label={productLabel} />}
      </div>

      {rest.map((p) => (
        <ProductCard key={p.id} product={p} label={productLabel} />
      ))}

      <Link href={seeMoreHref} className="product-card kb-see-more-card" aria-label={`Voir plus ${title}`}>
        <div className="kb-see-more-inner">
          <span className="kb-see-more-label">Voir plus</span>
          <span className="kb-see-more-title">{title}</span>
          <ArrowRight size={18} />
        </div>
      </Link>
    </div>
  );
}
