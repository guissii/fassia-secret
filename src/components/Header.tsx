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

import {
  desktopMenuCategories,
  mobileDrawerCategories,
  mobileMenuItems,
  mobileQuickCategories,
  type DrawerItem
} from '../data/menuData';

interface HeaderProps {
  onCartOpen: () => void;
  cartCount?: number;
  cartBumpKey?: number;
}

export function Header({ onCartOpen, cartCount = 0, cartBumpKey }: HeaderProps) {
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
                <span>Livraison gratuite dès 400 MAD d'achat</span>
              </div>
              <div className="top-info-sep" />
              <div className="top-info-item">
                <ShieldCheck size={16} className="top-info-icon" />
                <span>Paiement à la livraison disponible</span>
              </div>

              <div className="top-info-sep" />
              <div className="top-info-item">
                <Truck size={16} className="top-info-icon" />
                <span>Livraison gratuite dès 400 MAD d'achat</span>
              </div>
              <div className="top-info-sep" />
              <div className="top-info-item">
                <ShieldCheck size={16} className="top-info-icon" />
                <span>Paiement à la livraison disponible</span>
              </div>
            </div>
          </div>

          <button className="top-lang" type="button" aria-label="Langue">
            <span>FR</span>
            <ChevronDown size={14} />
          </button>
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
          <Suspense fallback={<div className="search-placeholder">Chargement...</div>}>
            <SearchBar inputRef={mobileSearchInputRef} />
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
              // Map each desktop category title to a proper boutique filter
              const desktopCatHrefMap: Record<string, string> = {
                'CORPS': '/boutique?category=Corps',
                'VISAGE': '/boutique?category=Visage',
                'CHEVEUX': '/boutique?category=Cheveux',
                'HYGIÈNE DENTAIRE': '/boutique?category=Hygi%C3%A8ne+Dentaire',
                'MAQUILLAGE': '/maquillage-parfums',
                'HYGIÈNE & INTIMITÉ': '/boutique?category=Hygi%C3%A8ne',
                'SANTÉ': '/boutique?category=Sant%C3%A9',
                'HOMMES': '/boutique?category=Hommes',
                'COMPLEMENTS ALIMENTAIRES': '/complements-alimentaires',
                'PREOCCUPATIONS': '/boutique',
              };
              const parentHref = desktopCatHrefMap[category.title] || '/boutique';
              return (
              <li key={index} className="nav-item">
                <Link
                  href={parentHref}
                  className="nav-link flex items-center gap-xs"
                >
                  {category.title} <ChevronDown size={14} className="dropdown-icon" />
                </Link>
                <div className="dropdown-menu">
                  <ul>
                    {category.items.map((item, idx) => {
                      let itemHref = parentHref;
                      if (category.title === 'PREOCCUPATIONS') {
                        itemHref = `/boutique?q=${encodeURIComponent(item)}`;
                      } else if (category.title === 'SANTÉ' && item === 'Compléments alimentaires') {
                        itemHref = '/complements-alimentaires';
                      } else if (category.title === 'MAQUILLAGE') {
                        if (['Teint', 'Yeux', 'Lèvres'].includes(item)) {
                          itemHref = '/maquillage-parfums';
                        } else {
                          itemHref = `/boutique?category=Maquillage`;
                        }
                      }
                      return (
                      <li key={idx}>
                        <Link href={itemHref} className="dropdown-item">
                          {item}
                        </Link>
                      </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
              );
            })}
            <li>
              <Link
                href="/promotions"
                className="nav-link nav-link-promos flex items-center gap-xs"
              >
                <Tag size={14} className="promos-icon" /> PROMOS
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
