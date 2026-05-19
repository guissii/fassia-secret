import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { publicAssetUrl } from '../lib/publicUrl';

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

  const slides = useMemo<HeroSlide[]>(() => {
    return [
      {
        id: 'promo-1',
        imageMobile: 'eee.webp',
        imageDesktop: 'eee.webp',
      },
      {
        id: 'promo-2',
        imageMobile: 'B.BENEFPRODUIT2.webp',
        imageDesktop: 'B.BENEFPRODUIT2.webp',
      },
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

  const goTo = (idx: number) => {
    const next = ((idx % slideCount) + slideCount) % slideCount;
    setActiveIndex(next);
  };

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

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
        <div className="hero-viewport">
          <div className="hero-track" style={{ transform: `translate3d(${-activeIndex * 100}%, 0, 0)` }}>
            {slides.map((s, i) => (
              <article
                key={s.id}
                className="hero-slide"
                style={
                  {
                    ['--hero-bg']: `url('${publicAssetUrl(isMobile ? s.imageMobile : s.imageDesktop)}')`,
                  } as unknown as CSSProperties
                }
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${slideCount}`}
                aria-hidden={i !== activeIndex}
              >
                <picture className="hero-media">
                  <source media="(min-width: 992px)" srcSet={publicAssetUrl(s.imageDesktop)} />
                  <img
                    className="hero-media-img"
                    src={publicAssetUrl(s.imageMobile)}
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                  />
                </picture>
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
