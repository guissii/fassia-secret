import { ArrowRight, FlaskConical, Heart, Leaf } from 'lucide-react';

export function Hero() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

  return (
    <section className="hero-section">
      <div
        className="hero-background"
        style={{ backgroundImage: `url("${basePath}/hero%20new.png")` }}
      >
        <div className="hero-gradient-overlay"></div>
        <div className="container hero-content">
          <div className="hero-text-clean">
            <div className="hero-badge">
              <Leaf size={16} className="hero-badge-icon" />
              <span className="hero-badge-text">NOUVELLE COLLECTION</span>
            </div>
            <h1 className="hero-title mt-md mb-lg">
              <span className="hero-title-main">Prenez soin</span>
              <span className="hero-title-main">de votre peau</span>
              <span className="hero-title-script">naturellement</span>
            </h1>
            <p className="text-lg text-muted mb-lg hero-subtext">
              Decouvrez nos soins premium et complements alimentaires pour une routine beaute saine et eclatante.
            </p>
            <div className="flex gap-md hero-buttons">
              <button className="btn btn-primary hero-cta">
                DÉCOUVRIR LA GAMME <ArrowRight size={18} />
              </button>
            </div>

            <div className="hero-mini-features" aria-label="Points forts">
              <div className="hero-mini-feature">
                <Leaf size={18} className="hero-mini-icon" />
                <span>Ingrédients naturels</span>
              </div>
              <div className="hero-mini-feature">
                <FlaskConical size={18} className="hero-mini-icon" />
                <span>Formules efficaces</span>
              </div>
              <div className="hero-mini-feature">
                <Heart size={18} className="hero-mini-icon" />
                <span>Cruelty free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
