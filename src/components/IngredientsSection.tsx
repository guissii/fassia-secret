"use client";

import { useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

type Ingredient = {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: 'droplet' | 'flask' | 'sparkles' | 'sun' | 'leaf';
  accent: string;
  searchQuery: string;
};

const INGREDIENTS: Ingredient[] = [
  {
    id: 1,
    tag: 'ÉCLAT & UNIFORMITÉ',
    title: 'Niacinamide',
    subtitle: 'Vitamine B3',
    description: 'Atténue les taches pigmentaires, resserre les pores et unifie le teint pour une peau nette et lumineuse.',
    image: '/ingredients/niacinamide.webp',
    icon: 'sparkles',
    accent: '#e10074',
    searchQuery: 'Niacinamide',
  },
  {
    id: 2,
    tag: 'HYDRATATION & FERMETÉ',
    title: 'Acide Hyaluronique',
    subtitle: 'Hydratant intense',
    description: 'Régénère la peau en profondeur, effet repulpant immédiat et barrière anti-déshydratation longue durée.',
    image: '/ingredients/acide-hyaluronique.webp',
    icon: 'droplet',
    accent: '#0ea5e9',
    searchQuery: 'Acide Hyaluronique',
  },
  {
    id: 3,
    tag: 'ANTI-IMPERFECTIONS',
    title: 'Acide Salicylique',
    subtitle: 'BHA purifiant',
    description: 'Purifie les pores en profondeur, réduit les points noirs et prévient les éruptions pour une peau claire.',
    image: '/ingredients/acide-salicylique.webp',
    icon: 'flask',
    accent: '#10b981',
    searchQuery: 'Acide Salicylique',
  },
  {
    id: 4,
    tag: 'BARRIÈRE CUTANÉE',
    title: 'Céramides',
    subtitle: 'Réparation lipidique',
    description: 'Renforce la barrière naturelle, réduit la sécheresse extrême et protège contre les agressions extérieures.',
    image: '/ingredients/ceramides.webp',
    icon: 'leaf',
    accent: '#84cc16',
    searchQuery: 'Céramides',
  },
  {
    id: 5,
    tag: 'PROTECTION QUOTIDIENNE',
    title: 'SPF 50+',
    subtitle: 'Écran solaire',
    description: 'Protection large spectre indispensable contre les UVA/UVB pour prévenir le vieillissement et les taches.',
    image: '/ingredients/spf-50.webp',
    icon: 'sun',
    accent: '#f59e0b',
    searchQuery: 'SPF',
  },
  {
    id: 6,
    tag: 'ANTI-ÂGE & RENOUVELLEMENT',
    title: 'Rétinol',
    subtitle: 'Vitamine A',
    description: 'Affine le grain de peau, lisse les ridules et stimule le renouvellement cellulaire pour un teint jeune.',
    image: '/ingredients/retinol.webp',
    icon: 'sparkles',
    accent: '#a855f7',
    searchQuery: 'Rétinol',
  },
  {
    id: 7,
    tag: 'ANTI-OXYDANT & ÉCLAT',
    title: 'Vitamine C',
    subtitle: "Booster d'éclat",
    description: 'Illumine le teint terne, combat les radicaux libres et unifie la peau pour un glow naturel visible.',
    image: '/ingredients/vitamine-c.webp',
    icon: 'sun',
    accent: '#f97316',
    searchQuery: 'Vitamine C',
  },
  {
    id: 8,
    tag: 'TEXTURE & GLOW',
    title: 'AHA / BHA',
    subtitle: 'Exfoliants chimiques',
    description: 'Exfolie en douceur les cellules mortes pour révéler une peau plus lisse, plus nette et visiblement éclatante.',
    image: '/ingredients/aha-bha.webp',
    icon: 'flask',
    accent: '#ec4899',
    searchQuery: 'AHA BHA',
  },
  {
    id: 9,
    tag: 'APAISANT & RÉPARATION',
    title: 'Panthénol',
    subtitle: 'Provitamine B5',
    description: 'Apaise les irritations, soutient la réparation cutanée et améliore le confort des peaux sensibles au quotidien.',
    image: '/ingredients/panthenol.jpg',
    icon: 'droplet',
    accent: '#06b6d4',
    searchQuery: 'Panthénol',
  },
];


export function IngredientsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

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

  const scrollByCards = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.ing-card');
    const cardWidth = firstCard?.offsetWidth ?? 0;
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const delta = (cardWidth + gap) * 2 * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="ing-section">
      <div className="container">

        {/* ── Section Header ── */}
        <div className="ing-header">
          <span className="ing-header-label">Science × Beauté</span>
          <h2 className="ing-header-title">Ingrédients Actifs</h2>
          <div className="ing-header-line" aria-hidden="true" />
        </div>

        {/* ── Carousel ── */}
        <div className="ing-carousel-wrap">
          <button
            type="button"
            className="ing-nav prev"
            onClick={() => scrollByCards(-1)}
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="ing-nav next"
            onClick={() => scrollByCards(1)}
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>

          <div className="ing-carousel" ref={carouselRef}>
            {INGREDIENTS.map((item) => {
              const bgUrl = item.image.startsWith('data:') || item.image.startsWith('http') || item.image.startsWith('blob:') ? item.image : publicAssetUrl(item.image);
              return (
                <article key={item.id} className="ing-card" aria-label={item.title}>
                  {/* Background */}
                  <div
                    className="ing-card-bg"
                    style={{ backgroundImage: `url('${bgUrl}')` }}
                  />
                  <div className="ing-card-overlay" aria-hidden="true" />

                  {/* Accent glow */}
                  <div
                    className="ing-card-glow"
                    style={{ background: `radial-gradient(ellipse at 50% 100%, ${item.accent}30 0%, transparent 70%)` }}
                    aria-hidden="true"
                  />


                  {/* Content */}
                  <div className="ing-card-body">
                    <h3 className="ing-card-title">{item.title}</h3>
                    <span className="ing-card-subtitle">{item.subtitle}</span>
                    <Link
                      href={`/boutique?q=${encodeURIComponent(item.searchQuery)}`}
                      className="ing-card-btn"
                      style={{ '--btn-accent': item.accent } as React.CSSProperties}
                    >
                      Découvrir <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
