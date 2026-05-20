import { ArrowRight } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

export function Categories() {
  const categories = [
    {
      id: 1,
      title: 'Soins du Visage',
      image: 'dd9f7066-738b-4260-b004-c51ed5442367.png',
      className: 'category-large',
      href: '/boutique?category=Visage',
    },
    {
      id: 2,
      title: 'Soins des Cheveux',
      image: '36a4c7fc-c2d8-492c-acee-a8f606be17b7.png',
      className: 'category-small',
      href: '/boutique?category=Cheveux',
    },
    {
      id: 3,
      title: 'Compléments Alimentaires',
      image: 'hero%20new.png',
      className: 'category-small category-supplements',
      href: '/boutique?category=Compl%C3%A9ments',
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
                  backgroundImage: `url('${publicAssetUrl(cat.image)}')`,
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
