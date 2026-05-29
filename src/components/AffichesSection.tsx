import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './AffichesSection.css';

interface Affiche {
  image: string;
  href?: string;
  alt: string;
}

const AFFICHES: Affiche[] = [
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
    href: '/boutique',
    alt: 'Bannière promotionnelle beauté',
  },
  {
    image: 'https://images.unsplash.com/photo-1522335789203-aabd20c3698c?w=1200&auto=format&fit=crop&q=80',
    href: '/boutique',
    alt: 'Bannière collection cosmétiques',
  },
];

export function AffichesSection() {
  return (
    <section className="affiches-section">
      <div className="affiches-container">
        {AFFICHES.map((affiche, index) => (
          <div key={index} className="affiche-card">
            {affiche.href ? (
              <Link href={affiche.href} className="affiche-link">
                <Image
                  src={affiche.image}
                  alt={affiche.alt}
                  width={600}
                  height={340}
                  className="affiche-image"
                  priority={index === 0}
                />
              </Link>
            ) : (
              <Image
                src={affiche.image}
                alt={affiche.alt}
                width={600}
                height={340}
                className="affiche-image"
                priority={index === 0}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
