"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './MakeupParfumsSection.css';

type Tile = {
  title: string;
  href: string;
  image: string;
};

const TILES: Tile[] = [
  {
    title: 'Teint',
    href: '/maquillage-parfums?step=1',
    image: '/images/banners/teint.webp',
  },
  {
    title: 'Yeux',
    href: '/maquillage-parfums?step=2',
    image: '/images/banners/yeux.webp',
  },
  {
    title: 'Lèvres',
    href: '/maquillage-parfums?step=3',
    image: '/images/banners/levres.webp',
  },
  {
    title: 'Parfum Femme',
    href: '/boutique?category=Parfums&q=femme',
    image: '/images/banners/PARFUM FEMME.webp',
  },
  {
    title: 'Parfum Homme',
    href: '/boutique?category=Parfums&q=homme',
    image: '/images/banners/PARFUM HOMME.webp',
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
