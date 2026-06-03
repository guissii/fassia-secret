"use client";

import type { CSSProperties } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './KoreanStepsSection.css';

type KoreanStep = {
  id: string;
  step: number;
  label: string;
  image: string;
  accent: string;
};

const KOREAN_STEPS: KoreanStep[] = [
  { id: 'step1', step: 1, label: 'Huile Démaquillante', image: '/images/banners/HUILE%20DEMAQILLANT.webp', accent: '#f59e0b' },
  { id: 'step2', step: 2, label: 'Nettoyant Moussant', image: '/images/banners/NETTOANT%20MOUSSANT.webp', accent: '#06b6d4' },
  { id: 'step3', step: 3, label: 'Exfoliant', image: '/images/banners/Exfoliant.webp', accent: '#84cc16' },
  { id: 'step4', step: 4, label: 'Lotion Tonique', image: '/images/banners/Lotion%20Tonique.webp', accent: '#0ea5e9' },
  { id: 'step5', step: 5, label: 'Essence', image: '/images/banners/essence.webp', accent: '#ec4899' },
  { id: 'step6', step: 6, label: 'Sérum & Ampoule', image: '/images/banners/serum%20et%20ampule.webp', accent: '#a855f7' },
  { id: 'step7', step: 7, label: 'Masque Tissu', image: '/images/banners/masque%20tissu.webp', accent: '#10b981' },
  { id: 'step8', step: 8, label: 'Contour des Yeux', image: '/images/banners/contour%20des%20yeux.webp', accent: '#f97316' },
  { id: 'step9', step: 9, label: 'Crème Hydratante', image: '/images/banners/Cr%C3%A8me%20Hydratante.webp', accent: '#e10074' },
  { id: 'step10', step: 10, label: 'Crème Solaire', image: '/images/banners/creme%20solaire.webp', accent: '#fbbf24' },
];

export function KoreanStepsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.korean-step-card');
    const cardWidth = firstCard?.offsetWidth ?? 0;
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const delta = (cardWidth + gap) * 2 * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="korean-steps-section" aria-label="Korean Beauty 10 Steps">
      <div className="container">
        <div className="korean-steps-header">
          <span className="korean-steps-kicker">Rituel Coréen</span>
          <h2 className="korean-steps-title">
            Korean <span>Beauty</span>
          </h2>
        </div>

        <div className="korean-steps-carousel-wrap">
          <button type="button" className="korean-steps-nav prev" onClick={() => scrollByCards(-1)} aria-label="Précédent">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="korean-steps-nav next" onClick={() => scrollByCards(1)} aria-label="Suivant">
            <ChevronRight size={20} />
          </button>

          <div className="korean-steps-carousel" ref={carouselRef}>
            {KOREAN_STEPS.map((step) => (
              <Link
                key={step.id}
                href={`/korean-beauty?step=${step.step}`}
                className="korean-step-card"
                style={{ ['--step-accent' as unknown as string]: step.accent } as CSSProperties}
                aria-label={step.label}
              >
                <div className="korean-step-media" style={{ backgroundImage: `url('${step.image}')` }} aria-hidden="true" />
                <div className="korean-step-gradient" aria-hidden="true" />
                <div className="korean-step-body">
                  <span className="korean-step-label">{step.label}</span>
                  <div className="korean-step-line" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
