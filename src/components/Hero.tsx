import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, FlaskConical, Heart, Leaf } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';

export function Hero() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const slides = useMemo(() => {
    return [
      { image: 'hero new.png' },
      { image: 'image 2 2.png' },
      { image: 'ChatGPT Image May 5, 2026, 03_31_21 PM.png' },
    ];
  }, []);

  const slideCount = slides.length;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const onChange = () => setIsMobile(media.matches);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  useEffect(() => {
    if (!isMobile || slideCount < 2) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slideCount);
    }, 4500);

    return () => window.clearInterval(id);
  }, [isMobile, slideCount]);

  const renderedIndex = isMobile ? activeIndex : 0;

  const goTo = (idx: number) => {
    const next = ((idx % slideCount) + slideCount) % slideCount;
    setActiveIndex(next);
  };

  return (
    <section className="hero-section">
      <div
        className="hero-background"
        onTouchStart={(e) => {
          if (!isMobile || slideCount < 2) return;
          touchStartX.current = e.touches[0]?.clientX ?? null;
          touchDeltaX.current = 0;
        }}
        onTouchMove={(e) => {
          if (!isMobile || slideCount < 2) return;
          if (touchStartX.current == null) return;
          const x = e.touches[0]?.clientX ?? touchStartX.current;
          touchDeltaX.current = x - touchStartX.current;
        }}
        onTouchEnd={() => {
          if (!isMobile || slideCount < 2) return;
          const delta = touchDeltaX.current;
          touchStartX.current = null;
          touchDeltaX.current = 0;

          if (Math.abs(delta) < 40) return;
          if (delta < 0) goTo(activeIndex + 1);
          else goTo(activeIndex - 1);
        }}
      >
        <div className="hero-slides" aria-hidden="true">
          {slides.map((s, i) => (
            <div
              key={s.image}
              className={`hero-slide ${i === renderedIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url("${publicAssetUrl(s.image)}")` }}
            />
          ))}
        </div>
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

            {isMobile && slideCount > 1 && (
              <div className="hero-dots" role="tablist" aria-label="Carousel">
                {slides.map((s, i) => (
                  <button
                    key={s.image}
                    type="button"
                    className={`hero-dot ${i === activeIndex ? 'active' : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    aria-pressed={i === activeIndex}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
