"use client";

import type { CSSProperties } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import './SupplementsSection.css';

type Pillar = {
  id: string;
  label: string;
  timing: string;
  title: string;
  description: string;
  image: string;
  filterQuery: string;
  accent: string;
};

const imageUrl = (prompt: string) => {
  return '/logo.png';
};

const PILLARS: Pillar[] = [
  {
    id: 'sleep',
    label: 'Sommeil',
    timing: 'Soir',
    title: 'Sommeil & Relaxation',
    description: 'Mélatonine, magnésium glycinate, plantes apaisantes.',
    image: imageUrl(
      'Photographie premium e-commerce compléments alimentaires, gélules blanches et flacon ambré, ambiance rose nude minimal luxe, lumière studio douce, haute définition'
    ),
    filterQuery: 'category=Compléments&q=melatonine',
    accent: '#a855f7',
  },
  {
    id: 'stress',
    label: 'Équilibre',
    timing: 'Matin',
    title: 'Stress & Humeur',
    description: 'Adaptogènes & focus doux: ashwagandha, rhodiola, L-théanine.',
    image: imageUrl(
      'Photographie premium e-commerce compléments, flacon verre et poudres fines, ambiance beige rosé, style laboratoire chic, haute définition'
    ),
    filterQuery: 'category=Compléments&q=ashwagandha',
    accent: '#FF4FA3',
  },
  {
    id: 'digest',
    label: 'Intestin',
    timing: 'Repas',
    title: 'Digestion & Probiotiques',
    description: 'Confort intestinal, enzymes & microbiote (probiotiques).',
    image: imageUrl(
      'Photographie premium e-commerce compléments, probiotiques et gélules, ambiance blanche clinique, accents doux vert menthe, haute définition'
    ),
    filterQuery: 'category=Compléments&q=probiotiques',
    accent: '#10b981',
  },
  {
    id: 'metabolic',
    label: 'Silhouette',
    timing: 'Avant repas',
    title: 'Poids & Métabolisme',
    description: 'Berbérine, chrome, ALA: routine métabolique.',
    image: imageUrl(
      'Photographie premium e-commerce compléments, flacon et gélules, ambiance clair, reflets dorés, style minimal luxe, haute définition'
    ),
    filterQuery: 'category=Compléments&q=berberine',
    accent: '#f59e0b',
  },
  {
    id: 'immunity',
    label: 'Immunité',
    timing: 'Matin',
    title: 'Immunité & Ruche',
    description: 'Propolis, vitamine C, zinc: protection quotidienne.',
    image: imageUrl(
      'Photographie premium e-commerce compléments, propolis et flacon, ambiance miel doré, fond beige clair, haute définition'
    ),
    filterQuery: 'category=Compléments&q=propolis',
    accent: '#f97316',
  },
  {
    id: 'beauty',
    label: 'Beauty',
    timing: 'Matin',
    title: 'Beauté In & Out',
    description: 'Collagène, biotine & acide hyaluronique: glow, cheveux, ongles.',
    image: imageUrl(
      'Photographie premium e-commerce compléments beauté, collagène et gélules, ambiance rose nude, style luxe minimal, haute définition'
    ),
    filterQuery: 'category=Compléments&q=collagene',
    accent: '#ec4899',
  },
];

export function SupplementsSection() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('.supp-card');
    const cardWidth = firstCard?.offsetWidth ?? 0;
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const delta = (cardWidth + gap) * 2 * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="supp-section" aria-label="Compléments Alimentaires">
      <div className="container">
        <div className="supp-header">
          <span className="supp-kicker">iHerb-style</span>
          <Link href="/complements-alimentaires" className="supp-title-link" aria-label="Voir la page Compléments Alimentaires">
            <h2 className="supp-title">
              Compléments <span>Alimentaires</span>
            </h2>
          </Link>
          <p className="supp-subtitle">
            Choisis par objectif: sommeil, stress, digestion, immunité… Un scroll, une routine.
          </p>
        </div>

        <div className="supp-carousel-wrap" aria-label="Sélections">
          <button type="button" className="supp-nav prev" onClick={() => scrollByCards(-1)} aria-label="Précédent">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="supp-nav next" onClick={() => scrollByCards(1)} aria-label="Suivant">
            <ChevronRight size={20} />
          </button>

          <div className="supp-carousel" ref={carouselRef}>
            {PILLARS.map((p) => (
              <Link
                key={p.id}
                href={`/complements-alimentaires#${encodeURIComponent(p.id)}`}
                className="supp-card"
                style={{ ['--supp-accent' as unknown as string]: p.accent } as CSSProperties}
                aria-label={`Voir plus: ${p.title}`}
              >
                <div className="supp-media" style={{ backgroundImage: `url('${p.image}')` }} aria-hidden="true" />
                <div className="supp-gradient" aria-hidden="true" />
                <div
                    className="supp-card-glow"
                    style={{ background: `radial-gradient(ellipse at 50% 100%, ${p.accent}30 0%, transparent 70%)` }}
                    aria-hidden="true"
                />
                <div className="supp-body">
                  <div className="supp-tags">
                    <span className="supp-chip">{p.label}</span>
                    <span className="supp-timing">{p.timing}</span>
                  </div>
                  <h3 className="supp-card-title">{p.title}</h3>
                  <p className="supp-card-desc">{p.description}</p>
                  <span className="supp-cta">
                    Voir plus <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href="/complements-alimentaires"
              className="supp-card supp-card-more"
              aria-label="Voir plus de compléments"
            >
              <div className="supp-more-inner">
                <span className="supp-more-label">Voir plus</span>
                <span className="supp-more-title">Tous les compléments</span>
                <ArrowRight size={18} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
