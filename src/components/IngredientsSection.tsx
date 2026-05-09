import { useEffect, useRef } from 'react';
import { ArrowRight, Droplet, FlaskConical, Sparkles, Sun, Leaf } from 'lucide-react';

type Ingredient = {
  id: number;
  tag: string;
  title: string;
  description: string;
  image: string;
  icon: 'droplet' | 'flask' | 'sparkles' | 'sun' | 'leaf';
};

const ICONS = {
  droplet: Droplet,
  flask: FlaskConical,
  sparkles: Sparkles,
  sun: Sun,
  leaf: Leaf,
} as const;

const INGREDIENTS: Ingredient[] = [
  {
    id: 1,
    tag: 'ÉCLAT & UNIFORMITÉ',
    title: 'Niacinamide',
    description: 'Atténue les taches pigmentaires et unifie le teint.',
    image: 'image 2 2.png',
    icon: 'sparkles',
  },
  {
    id: 2,
    tag: 'HYDRATATION & FERMETÉ',
    title: 'Acide Hyaluronique',
    description: 'Régénère la peau, effet repulpant et lisse.',
    image: 'image1 2.png',
    icon: 'droplet',
  },
  {
    id: 3,
    tag: 'ANTI-ÂGE & RENOUVELLEMENT',
    title: 'Rétinol',
    description: 'Accélère le renouvellement cellulaire et diminue l’apparence des rides.',
    image: 'image prod 1 centella.png',
    icon: 'flask',
  },
  {
    id: 4,
    tag: 'ANTI-OXYDANT & PROTECTION',
    title: 'Vitamine C',
    description: 'Reconnu en cosmétique pour ses bienfaits, unifie la peau.',
    image: 'hero new.png',
    icon: 'sun',
  },
];

export function IngredientsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    el.classList.add('reveal-ready');

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      requestAnimationFrame(() => {
        el.classList.add('is-visible');
      });
      return;
    }

    const safetyTimer = window.setTimeout(() => {
      el.classList.add('is-visible');
    }, 1200);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => {
      window.clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="ingredients-section">
      <div className="container">
        <div className="categories-header ingredients-header">
          <h2 className="categories-title">Ingrédients Actifs</h2>
          <div className="categories-ornament">
            <span className="ornament-line"></span>
            <Leaf size={20} className="ornament-icon" strokeWidth={1.5} />
            <span className="ornament-line"></span>
          </div>
        </div>

        <div className="ingredients-grid">
          {INGREDIENTS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.id} className="ingredients-card">
                <div
                  className="ingredients-card-bg"
                  style={{ backgroundImage: `url('${basePath}/${item.image}')` }}
                ></div>
                <div className="ingredients-card-overlay"></div>

                <div className="ingredients-card-icon">
                  <Icon size={16} />
                </div>

                <div className="ingredients-card-body">
                  <div className="ingredients-card-tag">{item.tag}</div>
                  <h3 className="ingredients-card-title">{item.title}</h3>
                  <p className="ingredients-card-text">{item.description}</p>
                  <button type="button" className="ingredients-card-btn">
                    DÉCOUVRIR <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
