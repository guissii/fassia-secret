import { Leaf } from 'lucide-react';

export function Brands() {
  const brands = [
    { name: "DERMINA" },
    { name: "CENTAUREA" },
    { name: "SVR" },
    { name: "LA ROCHE-POSAY" },
    { name: "VICHY" },
    { name: "CERAVE" },
    { name: "EUCERIN" },
    { name: "URIAGE" }
  ];

  return (
    <section className="brands-section py-3xl">
      <div className="brands-header">
        <h2 className="brands-title">Nos Partenaires</h2>
        <div className="brands-ornament" aria-hidden="true">
          <span className="brands-ornament-line" />
          <Leaf size={20} className="brands-ornament-icon" strokeWidth={1.5} />
          <span className="brands-ornament-line" />
        </div>
        <p className="brands-subtitle">
          Nous collaborons avec les meilleures marques dermo‑cosmétiques pour vous offrir des produits sûrs, efficaces et de qualité.
        </p>
      </div>
      
      <div className="brands-slider">
        <div className="brands-slider-track">
          <div className="brands-grid">
            {brands.map((brand, index) => (
              <div key={`brand-1-${index}`} className="brand-logo-card">
                <span className="brand-name">{brand.name}</span>
              </div>
            ))}
          </div>
          <div className="brands-grid" aria-hidden="true">
            {brands.map((brand, index) => (
              <div key={`brand-2-${index}`} className="brand-logo-card">
                <span className="brand-name">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
