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
    image: '/affiches/affiche-1.webp',
    href: '/boutique',
    alt: 'Affiche promotionnelle 1',
  },
  {
    image: '/affiches/affiche-2.webp',
    href: '/boutique',
    alt: 'Affiche promotionnelle 2',
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
