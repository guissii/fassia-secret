import React from 'react';
import '../styles/CollectionLayout.css';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productHref } from '../lib/productSlug';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface CollectionCarouselProps {
  title: string;
  imageSrc: string;
  products: any[];
  linkHref: string;
  linkTitle: string;
}

export function CollectionCarousel({ title, imageSrc, products, linkHref, linkTitle }: CollectionCarouselProps) {
  const router = useRouter();

  return (
    <section className="essentials-section">
      <div className="container">
        <div className="essentials-header-row">
          <div className="essentials-title-group">
            <h2 className="essentials-title">
              NOS <span className="highlight">{title}</span>
            </h2>
          </div>
        </div>

        <div className="essentials-carousel">
          <div className="essentials-hero-pair">
            <div className="essentials-visual-tile">
              <img
                src={publicAssetUrl(imageSrc)}
                alt={`${title} Visuel`}
                className="essentials-visual-img"
                loading="lazy"
              />
            </div>
            {products.slice(0, 1).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                label={p.brand}
                onNavigate={() => router.push(productHref(p))}
              />
            ))}
          </div>

          {products.slice(1).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              label={p.brand}
              onNavigate={() => router.push(productHref(p))}
            />
          ))}
          <Link href={linkHref} className="product-card kb-see-more-card" aria-label="Voir plus">
            <div className="kb-see-more-inner">
              <span className="kb-see-more-label">Voir plus</span>
              <span className="kb-see-more-title">{linkTitle}</span>
              <div className="kb-see-more-icon-circle">
                <ArrowRight size={20} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
