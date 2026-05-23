"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cubicBezier, motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useCart } from './components/CartContext';
import { publicAssetUrl } from './lib/publicUrl';
import { productHref } from './lib/productSlug';
import { ALL_PRODUCTS } from './data/products';
import { ProductCard } from './components/ProductCard';
import './PromotionsClientPage.css';

type PromoProduct = (typeof ALL_PRODUCTS)[number] & { oldPrice: number };

const discountPct = (price: number, oldPrice: number) => {
  const pct = Math.round((1 - price / oldPrice) * 100);
  return Number.isFinite(pct) && pct > 0 ? pct : 0;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const toTargetDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(23, 59, 0, 0);
  return d;
};

const getCountdown = (target: Date) => {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isEnded: diff <= 0 };
};

export default function PromotionsClientPage() {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [heroParallaxY, setHeroParallaxY] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ctaStateById, setCtaStateById] = useState<Record<number, 'idle' | 'loading' | 'added'>>({});
  const dealTarget = useMemo(() => toTargetDate(), []);
  const [countdown, setCountdown] = useState(() => getCountdown(dealTarget));
  const gridRef = useRef<HTMLElement | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const ctaTimeoutsRef = useRef<number[]>([]);

  const promos = useMemo<PromoProduct[]>(() => {
    return ALL_PRODUCTS.filter((p): p is PromoProduct => typeof p.oldPrice === 'number' && p.oldPrice > p.price);
  }, []);

  const filters = useMemo(
    () => [
      {
        key: 'all',
        label: 'Tout',
        predicate: () => true,
      },
      {
        key: 'kbeauty',
        label: 'K-Beauty',
        predicate: (p: PromoProduct) => p.category === 'K-Beauty',
      },
      {
        key: 'complements',
        label: 'Compléments alimentaires',
        predicate: (p: PromoProduct) => p.category === 'Compléments',
      },
      {
        key: 'maquillage',
        label: 'Maquillage',
        predicate: (p: PromoProduct) => p.category === 'Maquillage',
      },
      {
        key: 'parfum',
        label: 'Parfum',
        predicate: (p: PromoProduct) => p.category === 'Parfums',
      },
    ],
    []
  );

  const filteredPromos = useMemo(() => {
    const f = filters.find((x) => x.key === activeFilter) ?? filters[0];
    return promos.filter(f.predicate);
  }, [activeFilter, filters, promos]);

  const bestDeal = useMemo(() => {
    const list = promos
      .map((p) => ({ p, pct: discountPct(p.price, p.oldPrice) }))
      .sort((a, b) => b.pct - a.pct);
    return list[0]?.p ?? null;
  }, [promos]);

  const handleAddToCart = (p: PromoProduct, options?: { openCart?: boolean }) => {
    addToCart(p);
    if (options?.openCart) setIsCartOpen(true);
  };

  useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 520);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const t0 = window.setTimeout(() => setIsFilterLoading(true), 0);
    const t1 = window.setTimeout(() => setIsFilterLoading(false), 260);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [activeFilter, isLoading]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setHeroParallaxY(Math.min(60, y * 0.08));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(getCountdown(dealTarget)), 1000);
    return () => window.clearInterval(id);
  }, [dealTarget]);

  useEffect(() => {
    const ctaTimeouts: number[] = [];
    ctaTimeoutsRef.current = ctaTimeouts;

    return () => {
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      for (const t of ctaTimeouts) window.clearTimeout(t);
    };
  }, []);

  const scrollToOffers = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 1800);
  };

  const handleAddToCartFromGrid = (p: PromoProduct) => {
    setCtaStateById((prev) => ({ ...prev, [p.id]: 'loading' }));
    addToCart(p);
    showToast('Produit ajouté au panier');

    const t1 = window.setTimeout(() => setCtaStateById((prev) => ({ ...prev, [p.id]: 'added' })), 450);
    const t2 = window.setTimeout(() => setCtaStateById((prev) => ({ ...prev, [p.id]: 'idle' })), 1650);
    ctaTimeoutsRef.current.push(t1, t2);
  };

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: cubicBezier(0.21, 1, 0.21, 1) } },
  };

  return (
    <>
      <main>
        <div className="promo-luxe">
          <section className="promo-hero" aria-label="Hero promotions">
            <div className="promo-hero-bg" style={{ transform: `translateY(${heroParallaxY}px)` }} />
            <div className="container">
              <div className="promo-hero-inner">
                <div className="promo-hero-kicker">
                  Jusqu'à −40%
                </div>
                <h1 className="promo-hero-title">
                  L’Art du <em>Soin</em> à Prix Doux
                </h1>
                <p className="promo-hero-desc">
                  Une sélection exclusive de pépites beauté et bien-être. 
                  Renouvelez votre routine avec nos marques partenaires, à des conditions exceptionnelles.
                </p>

                <div className="promo-hero-cta-row">
                  <button type="button" className="promo-hero-cta" onClick={scrollToOffers} aria-label="Explorer toutes les promotions">
                    Explorer les offres
                  </button>
                </div>
              </div>

              {bestDeal ? (
                <div className="promo-deal-top">
                  <div className="promo-deal-top-media">
                    <img src={publicAssetUrl(bestDeal.image)} alt={bestDeal.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="promo-deal-top-content">
                    <div className="promo-deal-top-label">Offre du moment</div>
                    <h2 className="promo-deal-top-title">{bestDeal.name}</h2>
                    <p className="promo-deal-top-desc">
                      Notre meilleure pépite actuellement. Une remise inédite, disponible pour une durée très limitée.
                    </p>
                    
                    <div className="promo-countdown-minimal" aria-label="Compte à rebours">
                      <div className="promo-count-min">
                        <span className="promo-count-min-num">{pad2(countdown.days)}</span>
                        <span className="promo-count-min-lab">Jours</span>
                      </div>
                      <span className="promo-count-min-sep">:</span>
                      <div className="promo-count-min">
                        <span className="promo-count-min-num">{pad2(countdown.hours)}</span>
                        <span className="promo-count-min-lab">Heures</span>
                      </div>
                      <span className="promo-count-min-sep">:</span>
                      <div className="promo-count-min">
                        <span className="promo-count-min-num">{pad2(countdown.minutes)}</span>
                        <span className="promo-count-min-lab">Min</span>
                      </div>
                      <span className="promo-count-min-sep">:</span>
                      <div className="promo-count-min">
                        <span className="promo-count-min-num">{pad2(countdown.seconds)}</span>
                        <span className="promo-count-min-lab">Sec</span>
                      </div>
                    </div>

                    <div className="promo-deal-top-actions">
                      <button type="button" className="promo-deal-top-cta" onClick={() => handleAddToCart(bestDeal, { openCart: true })}>
                        Ajouter au panier — {bestDeal.price} DH
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <div className="promo-filters-sticky">
            <div className="container">
              <nav className="promo-filters" aria-label="Filtres promotions">
                {filters.map((f) => {
                  const isActive = f.key === activeFilter;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      className={`promo-pill ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveFilter(f.key)}
                    >
                      {isActive ? <motion.span layoutId="active-pill" className="promo-pill-active" /> : null}
                      <span className="promo-pill-label">{f.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <section className="promo-grid-section" aria-label="Produits en promotion" id="promos" ref={gridRef}>
            <div className="container">
              <motion.div
                className="promo-grid unified-product-cards"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {(isLoading || isFilterLoading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <motion.div
                        key={`s-${activeFilter}-${idx}`}
                        className="product-card promo-essential-skeleton"
                        variants={itemVariants}
                      >
                        <div className="product-image-area skeleton-block" />
                        <div className="product-content">
                          <div className="skeleton-line w-40" />
                          <div className="skeleton-line w-70" />
                          <div className="skeleton-line w-55" />
                        </div>
                      </motion.div>
                    ))
                  : filteredPromos.length > 0
                    ? filteredPromos.map((p) => {
                        const pct = discountPct(p.price, p.oldPrice);
                        return (
                          <motion.div
                            key={p.id}
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                          >
                            <ProductCard
                              product={{
                                ...p,
                                badge: `−${pct}%`,
                                badgeColor: 'rgba(196, 154, 122, 0.92)',
                              }}
                              label={p.brand}
                              onNavigate={() => router.push(productHref(p))}
                              onAddToCart={() => handleAddToCartFromGrid(p)}
                              ctaState={ctaStateById[p.id] ?? 'idle'}
                            />
                          </motion.div>
                        );
                      })
                    : (
                        <motion.div className="promo-empty" variants={itemVariants}>
                          Aucune promotion disponible pour cette catégorie pour le moment.
                        </motion.div>
                      ))}

                {!isLoading && !isFilterLoading ? (
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/boutique?promo=1"
                      className="product-card essentials-see-more promo-essential-more"
                      aria-label="Voir plus de promotions"
                    >
                      <div className="essential-see-more-inner">
                        <div className="essential-see-more-title">Voir plus</div>
                        <div className="essential-see-more-subtitle">Toutes nos offres →</div>
                      </div>
                    </Link>
                  </motion.div>
                ) : null}
              </motion.div>
            </div>
          </section>

          <section className="promo-why" aria-label="Nos engagements">
            <div className="container">
              <div className="promo-why-grid">
                <div className="promo-why-item">
                  <ShieldCheck size={22} className="promo-why-ic" />
                  <div className="promo-why-title">Authenticité</div>
                  <div className="promo-why-text">Sélection soignée et traçable.</div>
                </div>
                <div className="promo-why-item">
                  <Sparkles size={22} className="promo-why-ic" />
                  <div className="promo-why-title">Formulations premium</div>
                  <div className="promo-why-text">Actifs et routines haut de gamme.</div>
                </div>
                <div className="promo-why-item">
                  <Truck size={22} className="promo-why-ic" />
                  <div className="promo-why-title">Livraison soignée</div>
                  <div className="promo-why-text">Packaging protégé, expérience luxe.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="promo-editorial" aria-label="Footer éditorial">
            <div className="container">
              <p className="promo-editorial-quote">« La beauté n’est pas un luxe, c’est un soin. »</p>
              <Link href="/boutique?new=1" className="promo-editorial-link">
                Découvrir toutes nos nouveautés →
              </Link>
            </div>
          </section>
        </div>
      </main>


      {toastMessage ? (
        <div className="promo-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
