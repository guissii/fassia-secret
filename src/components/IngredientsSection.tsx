"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import Link from 'next/link';

type Ingredient = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
  accent: string;
  searchQuery: string;
};

export function IngredientsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ingredients/active')
      .then((r) => r.json())
      .then((data) => {
        setIngredients(data.ingredients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
            {loading ? (
              <div className="ing-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                <span style={{ color: '#999' }}>Chargement...</span>
              </div>
            ) : ingredients.length === 0 ? (
              <div className="ing-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                <span style={{ color: '#999' }}>Aucun ingrédient actif</span>
              </div>
            ) : (
              ingredients.map((item) => {
                const bgUrl = item.image && (item.image.startsWith('data:') || item.image.startsWith('http') || item.image.startsWith('blob:')) ? item.image : publicAssetUrl(item.image);
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
              })
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
