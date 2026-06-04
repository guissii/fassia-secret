"use client";

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import Image from 'next/image';
import { useCart } from './CartContext';

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
  const { addToCart } = useCart();
  const MAX_PRODUCTS = 20;
  const displayProducts = products.slice(0, MAX_PRODUCTS);
  const firstProduct = displayProducts[0];
  const rest = displayProducts.slice(1);

  return (
    <div className="essentials-carousel">
        <div className="essentials-visual-tile">
          {visualImageComponent ? (
            visualImageComponent
          ) : (
            <Image src={visualImage || '/logo.png'} alt={title} className="essentials-visual-img" fill sizes="(max-width: 768px) 50vw, 25vw" priority />
          )}
          <div className="kb-visual-overlay">
            {stepId && <span className="kb-overlay-step">{stepId}</span>}
            <h3 className="kb-overlay-title">{title}</h3>
          </div>
        </div>

        {firstProduct && <ProductCard product={firstProduct} label={productLabel} onAddToCart={() => addToCart(firstProduct)} priority />}

      {rest.map((p) => (
        <ProductCard key={p.id} product={p} label={productLabel} onAddToCart={() => addToCart(p)} />
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
