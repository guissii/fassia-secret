"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './MakeupParfumsSection.css';

type Tile = {
  title: string;
  href: string;
  image: string;
};

const imageUrl = (prompt: string) => {
  return '/logo.png';
};

const TILES: Tile[] = [
  {
    title: 'Teint',
    href: '/maquillage-parfums',
    image: imageUrl(
      'Photographie premium e-commerce beauté, fond beige doux, produits de maquillage pour le teint (fond de teint, poudre, pinceaux), style Dior/Sephora, lumière studio douce, composition minimaliste, haute définition'
    ),
  },
  {
    title: 'Yeux',
    href: '/maquillage-parfums',
    image: imageUrl(
      'Photographie premium e-commerce beauté, palette de fards à paupières, eyeliner et mascara sur fond clair beige rosé, style luxe minimaliste, lumière studio douce, haute définition'
    ),
  },
  {
    title: 'Lèvres',
    href: '/maquillage-parfums',
    image: imageUrl(
      'Photographie premium e-commerce beauté, rouges à lèvres et gloss, textures glossy, fond beige rosé élégant, style fashion luxury, lumière studio douce, haute définition'
    ),
  },
  {
    title: 'Parfums',
    href: '/boutique?category=Parfums',
    image: imageUrl(
      'Photographie premium e-commerce parfum, flacon de parfum en verre, reflets élégants, fond beige crème, ambiance luxe minimaliste, lumière studio douce, haute définition'
    ),
  },
];

export function MakeupParfumsSection() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrapRect = el.getBoundingClientRect();
        const centerX = wrapRect.left + wrapRect.width / 2;
        const items = Array.from(el.querySelectorAll<HTMLElement>('.makeup-parfums-tile'));
        let bestIndex = 0;
        let bestDist = Number.POSITIVE_INFINITY;

        items.forEach((item, idx) => {
          const r = item.getBoundingClientRect();
          const itemCenter = r.left + r.width / 2;
          const dist = Math.abs(itemCenter - centerX);
          if (dist < bestDist) {
            bestDist = dist;
            bestIndex = idx;
          }
        });

        setActiveIndex(bestIndex);
      });
    };

    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section className="makeup-parfums-section" aria-label="Maquillage & Parfums">
      <div className="container">
        <div className="section-header makeup-parfums-header">
          <h2 className="section-title makeup-parfums-title">
            Maquillage <span className="makeup-parfums-amp">&</span> Parfums
          </h2>
        </div>
        <div className="makeup-parfums-panel">
          <div className="makeup-parfums-carousel" role="list" ref={carouselRef}>
            {TILES.map((tile, idx) => (
              <Link
                key={tile.title}
                href={tile.href}
                className={`makeup-parfums-tile${idx === activeIndex ? ' is-active' : ''}`}
                role="listitem"
              >
                <div
                  className="makeup-parfums-media"
                  aria-hidden="true"
                  style={{ backgroundImage: `url('${tile.image}')` }}
                />
                <div className="makeup-parfums-chip">{tile.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
