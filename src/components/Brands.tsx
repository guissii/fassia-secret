import { useState } from 'react';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

type Brand = { name: string; logo?: string };

function BrandItem({ brand }: { brand: Brand }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>(brand.logo ? 'loading' : 'error');

  return (
    <Link href={`/boutique?q=${encodeURIComponent(brand.name)}`} className="brand-logo-card" aria-label={brand.name}>
      {brand.logo && (
        <img
          src={publicAssetUrl(brand.logo)}
          alt={brand.name}
          className="brand-logo-img"
          style={{ display: state === 'loaded' ? 'block' : 'none' }}
          loading="lazy"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}
      {(state === 'error' || state === 'loading') && <span className="brand-name">{brand.name}</span>}
    </Link>
  );
}

export function Brands() {
  const brands: Brand[] = [
    { name: 'LA ROCHE-POSAY', logo: 'brands/la-roche-posay.svg' },
    { name: 'DERCOS', logo: 'brands/dercos.svg' },
    { name: 'VICHY', logo: 'brands/vichy.svg' },
    { name: 'CeraVe', logo: 'brands/cerave.svg' },
    { name: 'ERBORIAN', logo: 'brands/erborian.svg' },
    { name: 'MAYBELLINE', logo: 'brands/maybelline.svg' },
    { name: 'KÉRASTASE', logo: 'brands/kerastase.svg' },
    { name: "L'ORÉAL PARIS", logo: 'brands/loreal-paris.svg' },
    { name: 'MIXA', logo: 'brands/mixa.svg' },
    { name: "L'ORÉAL PROFESSIONNEL", logo: 'brands/loreal-pro.svg' },
    { name: 'GARNIER', logo: 'brands/garnier.svg' },
    { name: 'EUCERIN', logo: 'brands/eucerin.svg' },
  ];

  return (
    <section className="brands-section py-3xl">
      <div className="container">
        <div className="section-header-premium">
          <h2 className="section-title-premium">Les Boutiques Officielles</h2>
          <div className="section-ornament-premium" aria-hidden="true" />
        </div>

        <div className="brands-logos" aria-label="Logos des marques partenaires">
          {brands.map((brand) => (
            <BrandItem key={brand.name} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
