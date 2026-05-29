import { ArrowRight } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

export function Categories() {
  const categories = [
    {
      id: 1,
      title: 'Soins du Visage',
      image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop&q=80',
      className: 'category-large',
      href: '/boutique?category=Visage',
    },
    {
      id: 2,
      title: 'Soins des Cheveux',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13ffd7b1a1?w=800&auto=format&fit=crop&q=80',
      className: 'category-small',
      href: '/boutique?category=Cheveux',
    },
    {
      id: 3,
      title: 'Compléments Alimentaires',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      className: 'category-small category-supplements',
      href: '/complements-alimentaires',
    },
  ];

  return (
    <section className="categories-section py-3xl">
      <div className="container">
        <div className="section-header-premium mb-2xl">
          <h2 className="section-title-premium">Catégories Populaires</h2>
          <div className="categories-ornament" aria-hidden="true">
            <span className="categories-ornament-star">✻</span>
          </div>
        </div>

        <div className="categories-bento-grid">
          {categories.map((cat) => (
            <Link key={cat.id} href={cat.href} className={`bento-card ${cat.className}`}>
              <div
                className="bento-bg"
                style={{
                  backgroundImage: `url('${cat.image.startsWith('http') ? cat.image : publicAssetUrl(cat.image)}')`,
                }}
              />
              <div className="bento-gradient" aria-hidden="true" />

              <div className="bento-content">
                <h3 className="bento-title">{cat.title}</h3>
                <span className="bento-cta">
                  Découvrir <ArrowRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
