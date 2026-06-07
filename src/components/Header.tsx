import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  X
} from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import { MobileDrawer } from './MobileDrawer';
import { SearchBar } from './SearchBar';
import { useSiteConfig } from './SiteConfigContext';

import {
  mobileMenuItems,
  mobileQuickCategories,
  type DrawerItem
} from '../data/menuData';
import { useMenuCollections } from '../hooks/useMenuCollections';

interface HeaderProps {
  onCartOpen: () => void;
  cartCount?: number;
  cartBumpKey?: number;
}

export function Header({ onCartOpen, cartCount = 0, cartBumpKey }: HeaderProps) {
  const { freeDeliveryThreshold } = useSiteConfig();
  const { mobileDrawerCategories, desktopMenuCategories } = useMenuCollections();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMenuFocusRef = useRef<HTMLElement | null>(null);
  const restoreSearchFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!cartBumpKey) return;
    const t0 = window.setTimeout(() => setCartBump(true), 0);
    const t1 = window.setTimeout(() => setCartBump(false), 420);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [cartBumpKey]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileCategory(null);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
  };

  const toggleMobileMenu = () => {
    if (typeof document !== 'undefined' && !isMobileMenuOpen) {
      restoreMenuFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsMobileMenuOpen((v) => {
      const next = !v;
      if (next) setOpenMobileCategory(null);
      return next;
    });
    setIsMobileSearchOpen(false);
  };

  const openDrawerWithCategory = (category: string | null) => {
    if (typeof document !== 'undefined') {
      restoreMenuFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsMobileMenuOpen(true);
    setOpenMobileCategory(category);
    setIsMobileSearchOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen && !isMobileSearchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isMobileSearchOpen) closeMobileSearch();
      else closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    mobileSearchInputRef.current?.focus();
  }, [isMobileSearchOpen]);

  const openMobileSearch = () => {
    if (typeof document !== 'undefined') {
      restoreSearchFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsMobileMenuOpen(false);
    setOpenMobileCategory(null);
    setIsMobileSearchOpen(true);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      requestAnimationFrame(() => mobileMenuCloseButtonRef.current?.focus());
      return;
    }

    if (isMobileSearchOpen) return;

    const toRestore = restoreMenuFocusRef.current;
    restoreMenuFocusRef.current = null;
    if (toRestore) requestAnimationFrame(() => toRestore.focus());
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (isMobileSearchOpen) return;
    if (isMobileMenuOpen) return;

    const toRestore = restoreSearchFocusRef.current;
    restoreSearchFocusRef.current = null;
    if (toRestore) requestAnimationFrame(() => toRestore.focus());
  }, [isMobileSearchOpen, isMobileMenuOpen]);



  return (
    <header className="header">
      <div className="top-info-bar">
        <div className="container top-info-inner">
          <div className="top-info-items">
            <div className="top-info-track">
              <div className="top-info-item">
                <Truck size={16} className="top-info-icon" />
                <span>Livraison gratuite dès {freeDeliveryThreshold} MAD d&apos;achat</span>
              </div>
              <div className="top-info-sep" />
              <div className="top-info-item">
                <ShieldCheck size={16} className="top-info-icon" />
                <span>Paiement à la livraison disponible</span>
              </div>

              <div className="top-info-sep" />
              <div className="top-info-item">
                <Truck size={16} className="top-info-icon" />
                <span>Livraison gratuite dès {freeDeliveryThreshold} MAD d&apos;achat</span>
              </div>
              <div className="top-info-sep" />
              <div className="top-info-item">
                <ShieldCheck size={16} className="top-info-icon" />
                <span>Paiement à la livraison disponible</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden={!isMobileMenuOpen}
      />

      <div
        className={`mobile-search-overlay ${isMobileSearchOpen ? 'open' : ''}`}
        onClick={closeMobileSearch}
        aria-hidden={!isMobileSearchOpen}
      />

      <div
        className={`mobile-search-panel ${isMobileSearchOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
      >
        <div className="mobile-search-inner" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-search-header">
            <span className="mobile-search-title">Rechercher un produit</span>
            <button
              className="mobile-search-close"
              type="button"
              onClick={closeMobileSearch}
              aria-label="Fermer la recherche"
            >
              <X size={24} />
            </button>
          </div>
          <Suspense fallback={<div className="search-placeholder">Chargement...</div>}>
            <SearchBar inputRef={mobileSearchInputRef} onNavigate={closeMobileSearch} />
          </Suspense>
        </div>
      </div>

      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onCartOpen={onCartOpen}
        cartCount={cartCount}
        openCategory={openMobileCategory}
        setOpenCategory={setOpenMobileCategory}
        closeButtonRef={mobileMenuCloseButtonRef}
        drawerCategories={mobileDrawerCategories}
      />

      {/* Main Header */}
      <div className="main-header">
        <div className="container header-main-grid">
          
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Ouvrir le menu"
            type="button"
          >
            <Menu size={28} />
          </button>

          <Link className="logo" href="/" aria-label="Fassia Secret">
            <img className="site-logo" src={publicAssetUrl('logo.png')} alt="Fassia Secret" />
          </Link>
          
          <div className="header-search-slot">
            <Suspense fallback={<div className="header-search hidden-mobile placeholder">Chargement...</div>}>
              <SearchBar className="header-search hidden-mobile" />
            </Suspense>

            <button className="mobile-search-btn" type="button" onClick={openMobileSearch} aria-label="Ouvrir la recherche">
              <Search size={22} />
            </button>
          </div>

          <div className="actions flex items-center gap-lg">
            <button className="action-btn flex-col items-center hidden-mobile" aria-label="Favoris" type="button">
              <Heart size={24} />
              <span className="action-label text-xs">Favoris</span>
            </button>
            <button
              className="action-btn flex-col items-center cart-btn mobile-cart-btn"
              onClick={onCartOpen}
              aria-label="Panier"
              type="button"
            >
              <div className={`cart-icon-wrapper ${cartBump ? 'bump' : ''}`}>
                <ShoppingCart size={24} />
                <span className="cart-badge">{cartCount}</span>
              </div>
              <span className="action-label text-xs hidden-mobile">Panier</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-categories-bar">
        <div className="container">
          <div className="mobile-categories-grid" role="navigation" aria-label="Catégories">
            {mobileQuickCategories.map(({ label, Icon, openKey, href }) => (
              href ? (
                <Link
                  key={label}
                  href={href}
                  className="mobile-category"
                  aria-label={label.replace(/\s*\n\s*/g, ' ')}
                >
                  <Icon size={22} className="mobile-category-icon" />
                  <span className="mobile-category-label">{label}</span>
                </Link>
              ) : (
                <button
                  key={label}
                  type="button"
                  className="mobile-category"
                  onClick={() => {
                    if (openKey) openDrawerWithCategory(openKey);
                  }}
                  aria-label={label.replace(/\s*\n\s*/g, ' ')}
                >
                  <Icon size={22} className="mobile-category-icon" />
                  <span className="mobile-category-label">{label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-bar">
        <div className="container">
          <ul className="flex items-center gap-xs main-nav-list">
            {desktopMenuCategories.map((category, index) => {
              return (
              <li key={index} className="nav-item">
                <span className="nav-link flex items-center gap-xs cursor-default">
                  {category.title} <ChevronDown size={14} className="dropdown-icon" />
                </span>
                <div className="dropdown-menu">
                  <ul>
                    {category.items.map((item, idx) => (
                      <li key={idx}>
                        <Link href={`/boutique?collectionSlug=${encodeURIComponent(item.slug)}`} className="dropdown-item">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              );
            })}
            {/* PROMOS masqué temporairement */}
            {/* <li>
              <Link
                href="/promotions"
                className="nav-link nav-link-promos flex items-center gap-xs"
              >
                <Tag size={14} className="promos-icon" /> PROMOS
              </Link>
            </li> */}
          </ul>
        </div>
      </nav>
    </header>
  );
}
