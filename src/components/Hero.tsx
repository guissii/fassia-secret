"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { publicAssetUrl } from '../lib/publicUrl';
import { LOCAL_BANNERS } from '../lib/bannersConfig';
import Image from 'next/image';

type HeroSlide = {
  id: string;
  imageMobile: string;
  imageDesktop: string;
};

export function Hero() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    // Utiliser les bannières locales au lieu de l'API pour plus de rapidité et fiabilité
    const heroBanners = LOCAL_BANNERS.hero.map((b) => ({
      id: b.id,
      imageMobile: b.imageMobile,
      imageDesktop: b.imageDesktop,
    }));
    setSlides(heroBanners);
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
    if (slideCount < 2) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slideCount);
    }, 4500);

    return () => window.clearInterval(id);
  }, [slideCount]);

  const goTo = (idx: number) => {
    const next = ((idx % slideCount) + slideCount) % slideCount;
    setActiveIndex(next);
  };

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  if (slides.length === 0) return null;

  return (
    <section className="hero-section" aria-label="Bannière principale">
      <div
        className="hero-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Offres et nouveautés"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') goPrev();
          if (e.key === 'ArrowRight') goNext();
        }}
        onTouchStart={(e) => {
          if (slideCount < 2) return;
          touchStartX.current = e.touches[0]?.clientX ?? null;
          touchDeltaX.current = 0;
        }}
        onTouchMove={(e) => {
          if (slideCount < 2) return;
          if (touchStartX.current == null) return;
          const x = e.touches[0]?.clientX ?? touchStartX.current;
          touchDeltaX.current = x - touchStartX.current;
        }}
        onTouchEnd={() => {
          if (slideCount < 2) return;
          const delta = touchDeltaX.current;
          touchStartX.current = null;
          touchDeltaX.current = 0;

          if (Math.abs(delta) < 40) return;
          if (delta < 0) goTo(activeIndex + 1);
          else goTo(activeIndex - 1);
        }}
        onMouseDown={(e) => {
          if (slideCount < 2) return;
          touchStartX.current = e.clientX;
          touchDeltaX.current = 0;
        }}
        onMouseMove={(e) => {
          if (slideCount < 2) return;
          if (touchStartX.current == null) return;
          touchDeltaX.current = e.clientX - touchStartX.current;
        }}
        onMouseUp={() => {
          if (slideCount < 2) return;
          const delta = touchDeltaX.current;
          touchStartX.current = null;
          touchDeltaX.current = 0;

          if (Math.abs(delta) < 40) return;
          if (delta < 0) goTo(activeIndex + 1);
          else goTo(activeIndex - 1);
        }}
        onMouseLeave={() => {
          if (touchStartX.current !== null) {
            touchStartX.current = null;
            touchDeltaX.current = 0;
          }
        }}
      >
        <div className="hero-viewport">
          <div className="hero-track" style={{ transform: `translate3d(${-activeIndex * 100}%, 0, 0)` }}>
            {slides.map((s, i) => (
              <article
                key={s.id}
                className="hero-slide"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${slideCount}`}
                aria-hidden={i !== activeIndex}
              >
                <div className="hero-media">
                  <Image
                    src={publicAssetUrl(s.imageDesktop)}
                    alt=""
                    fill
                    className="hero-media-img"
                    priority={i === 0}
                    sizes="100vw"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {slideCount > 1 && (
          <>
            <div className="hero-dots" role="tablist" aria-label="Pagination">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`hero-dot ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Aller au slide ${i + 1}`}
                  aria-pressed={i === activeIndex}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
