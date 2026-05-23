import { useEffect, useRef } from 'react';
import { Leaf, ArrowRight, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productHref } from '../lib/productSlug';
import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  name: string;
  brand: string;
  description?: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  badge?: string;
  badgeColor?: string;
}

interface ProductSectionProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  showFooter?: boolean;
  seeMoreHref?: string;
  headerHref?: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Derma Hydrating Serum",
    brand: "Derma",
    description: "Sérum hydratant à l’acide hyaluronique + vitamine B5.",
    price: 180.00,
    image: "19bd7403-d2ac-49a4-a584-be5895add421.png",
    category: "Visage",
    badge: "Nouveau",
    badgeColor: "var(--color-primary)",
  },
  {
    id: 2,
    name: "Hydra Boost Gel Cream",
    brand: "Hydra",
    description: "Gel-crème hydratant avec acide hyaluronique & thé vert.",
    price: 199.00,
    oldPrice: 249.00,
    image: "d6f902fd-0b09-48d0-8055-d03094820431.png",
    category: "Visage",
    badgeColor: "var(--color-primary)",
  },
  {
    id: 3,
    name: "Detox & Drainage",
    brand: "Detox",
    description: "Complément détox à base d’actifs botaniques.",
    price: 129.00,
    oldPrice: 159.00,
    image: "5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png",
    category: "Compléments",
    badgeColor: "var(--color-primary)",
  },
  {
    id: 4,
    name: "Vitamin D3 2000 IU",
    brand: "Vitamin",
    description: "Soutien immunitaire & santé osseuse au quotidien.",
    price: 149.00,
    image: "950aa654-e0a2-4875-8451-ca8805a6d44a.png",
    category: "Santé",
  },
  {
    id: 5,
    name: "Routine Huiles & Plantes",
    brand: "Routine",
    description: "Sélection d’actifs botaniques pour une peau éclatante.",
    price: 169.00,
    image: "image%202%202.png",
    category: "Bien-etre",
    badge: "Nouveau",
    badgeColor: "var(--color-primary)",
  }
];

export function ProductSection({ 
  title = "NOUVEAUTÉS", 
  subtitle,
  products = mockProducts,
  showFooter = false,
  seeMoreHref = "/boutique",
  headerHref
}: ProductSectionProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    el.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="product-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header-premium">
          {headerHref ? (
            <Link className="product-section-title-link" href={headerHref}>
              <h2 className="section-title-premium">{title}</h2>
            </Link>
          ) : (
            <h2 className="section-title-premium">{title}</h2>
          )}
          {subtitle && <p className="section-subtitle-premium">{subtitle}</p>}
        </div>

        {/* Product Grid (Simplified) */}
        <div className="product-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                oldPrice: product.oldPrice,
              }}
              label={product.brand}
              onNavigate={() => router.push(productHref(product))}
            />
          ))}
        </div>

        {/* Footer actions */}
        {showFooter && (
          <div className="section-footer text-center mt-2xl">
            <Link href={seeMoreHref} className="see-more-products-cta mt-lg mx-auto">
              <span>VOIR PLUS DE PRODUITS</span> <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
