"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Cart, type CartItem } from './components/Cart';
import { publicAssetUrl } from './lib/publicUrl';
import { ALL_PRODUCTS } from './data/products';
import './components/EssentialsSection.css';
import './PromotionsClientPage.css';

type PromoProduct = (typeof ALL_PRODUCTS)[number] & { oldPrice: number };

const formatPrice = (price: number) => price.toFixed(2) + ' MAD';

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartBumpKey, setCartBumpKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [heroParallaxY, setHeroParallaxY] = useState(0);
  const [dealTarget, setDealTarget] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(() => ({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false }));

  const promos = useMemo<PromoProduct[]>(() => {
    return ALL_PRODUCTS.filter((p): p is PromoProduct => typeof p.oldPrice === 'number' && p.oldPrice > p.price);
  }, []);

  const filters = useMemo(
    () => [
      {
        key: 'all',
        label: 'Tout',
        predicate: (_: PromoProduct) => true,
      },
      {
        key: 'skincare',
        label: 'Skincare',
        predicate: (p: PromoProduct) => p.category === 'Visage' || p.category === 'K-Beauty',
      },
      {
        key: 'solaire',
        label: 'Solaire',
        predicate: (p: PromoProduct) => /spf|solaire|sun/i.test(p.name),
      },
      {
        key: 'corps',
        label: 'Corps',
        predicate: (p: PromoProduct) => p.category === 'Corps',
      },
      {
        key: 'visage',
        label: 'Visage',
        predicate: (p: PromoProduct) => p.category === 'Visage',
      },
      {
        key: 'coffrets',
        label: 'Coffrets',
        predicate: (p: PromoProduct) => /coffret|routine/i.test(p.name),
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

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (p: PromoProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === p.id);
      if (existing) {
        return prev.map((it) => (it.id === p.id ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice,
          image: p.image,
          category: p.category,
          quantity: 1,
        },
      ];
    });
    setCartBumpKey((k) => k + 1);
    setIsCartOpen(true);
  };

  useEffect(() => {
    const t = window.setTimeout(() => setIsLoading(false), 520);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const target = toTargetDate();
    setDealTarget(target);
    setCountdown(getCountdown(target));
  }, []);

  useEffect(() => {
    if (isLoading) return;
    setIsFilterLoading(true);
    const t = window.setTimeout(() => setIsFilterLoading(false), 260);
    return () => window.clearTimeout(t);
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
    if (!dealTarget) return;
    const id = window.setInterval(() => setCountdown(getCountdown(dealTarget)), 1000);
    return () => window.clearInterval(id);
  }, [dealTarget]);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 1, 0.21, 1] } },
  };

  return (
    <div className="app-container">
      <Header onCartOpen={() => setIsCartOpen(true)} cartCount={totalCartCount} cartBumpKey={cartBumpKey} />
      <main>
        <div className="promo-luxe">
          <section className="promo-hero" aria-label="Hero promotions">
            <div className="promo-hero-bg" style={{ transform: `translateY(${heroParallaxY}px)` }} />
            <div className="promo-noise" />
            <div className="promo-petal promo-petal-a" aria-hidden="true" />
            <div className="promo-petal promo-petal-b" aria-hidden="true" />

            <div className="container">
              <div className="promo-hero-inner">
                <h1 className="promo-hero-title">Soins d’Exception</h1>

                <div className="promo-hero-cta-row">
                  <div className="promo-badge-shimmer" aria-label="Jusqu'à -40%">
                    Jusqu’à −40%
                  </div>
                  <Link href="/boutique?promo=1" className="promo-hero-cta" aria-label="Explorer toutes les promotions">
                    Explorer les offres
                  </Link>
                </div>
              </div>
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

          <section className="promo-grid-section" aria-label="Produits en promotion">
            <div className="container">
              <motion.div
                className="promo-grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {(isLoading || isFilterLoading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <motion.div
                        key={`s-${activeFilter}-${idx}`}
                        className="essential-card promo-essential-skeleton"
                        variants={itemVariants}
                      >
                        <div className="essential-image-area skeleton-block" />
                        <div className="essential-content">
                          <div className="skeleton-line w-40" />
                          <div className="skeleton-line w-70" />
                          <div className="skeleton-line w-55" />
                        </div>
                      </motion.div>
                    ))
                  : filteredPromos.map((p) => {
                      const pct = discountPct(p.price, p.oldPrice);
                      return (
                        <motion.article
                          key={p.id}
                          className="essential-card promo-essential-card"
                          variants={itemVariants}
                          whileHover={{ y: -4 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        >
                          <div className="essential-image-area">
                            <div className="essential-badge-left promo-discount-badge">−{pct}%</div>
                            <span className="promo-discount-shine" aria-hidden="true" />
                            <img src={publicAssetUrl(p.image)} alt={p.name} className="essential-image" loading="lazy" decoding="async" />
                          </div>

                          <div className="essential-content">
                            <span className="essential-brand">{p.brand}</span>
                            <h3 className="essential-title">{p.name}</h3>
                            <p className="essential-desc">{p.description}</p>
                            <div className="essential-footer">
                              <div className="essential-price-group">
                                <span className="essential-price">{formatPrice(p.price)}</span>
                                <span className="essential-price-old">{formatPrice(p.oldPrice)}</span>
                              </div>
                              <button type="button" className="essential-cta" onClick={() => addToCart(p)} aria-label="Ajouter au panier">
                                <ShoppingBag size={18} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      );
                    }))}

                {!isLoading && !isFilterLoading ? (
                  <motion.div variants={itemVariants}>
                    <Link href="/boutique?promo=1" className="essential-card essential-see-more promo-essential-more" aria-label="Voir plus de promotions">
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

          {bestDeal ? (
            <section className="promo-deal" aria-label="Offre du moment">
              <div className="container">
                <div className="promo-deal-inner">
                  <div className="promo-deal-media">
                    <img src={publicAssetUrl(bestDeal.image)} alt={bestDeal.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="promo-deal-content">
                    <div className="promo-deal-label">Offre du moment</div>
                    <h2 className="promo-deal-title">{bestDeal.name}</h2>
                    <p className="promo-deal-desc">
                      Une sélection limitée, à prix signature. Profite de l’offre avant la fin du compteur.
                    </p>
                    <div className="promo-countdown" aria-label="Compte à rebours">
                      <div className="promo-count">
                        <span className="promo-count-num">{pad2(countdown.days)}</span>
                        <span className="promo-count-lab">JJ</span>
                      </div>
                      <span className="promo-count-sep">:</span>
                      <div className="promo-count">
                        <span className="promo-count-num">{pad2(countdown.hours)}</span>
                        <span className="promo-count-lab">HH</span>
                      </div>
                      <span className="promo-count-sep">:</span>
                      <div className="promo-count">
                        <span className="promo-count-num">{pad2(countdown.minutes)}</span>
                        <span className="promo-count-lab">MM</span>
                      </div>
                      <span className="promo-count-sep">:</span>
                      <div className="promo-count">
                        <span className="promo-count-num">{pad2(countdown.seconds)}</span>
                        <span className="promo-count-lab">SS</span>
                      </div>
                    </div>
                    <div className="promo-deal-actions">
                      <button type="button" className="promo-deal-cta" onClick={() => addToCart(bestDeal)}>
                        Ajouter au panier
                      </button>
                      <Link href="/boutique?promo=1" className="promo-deal-ghost">
                        Voir toutes les promos →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="promo-why" aria-label="Pourquoi nos offres">
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

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => setCartItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity } : it)))}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((it) => it.id !== id))}
      />
    </div>
  );
}
