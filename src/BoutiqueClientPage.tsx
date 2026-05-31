"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { productHref } from './lib/productSlug';

import { ProductCard } from './components/ProductCard';
import { useCart } from './components/CartContext';



type SortKey = 'reco' | 'price-asc' | 'price-desc';

export default function BoutiqueClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('shopSidebarCollapsed') === '1';
  });
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const query = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const selectedCategories = useMemo(() => {
    const raw = searchParams.get('category') ?? '';
    if (!raw.trim()) return [];
    return raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }, [searchParams]);
  const onlyPromos = useMemo(() => searchParams.get('promo') === '1', [searchParams]);
  const onlyNew = useMemo(() => searchParams.get('new') === '1', [searchParams]);
  const sort = useMemo(() => {
    const raw = searchParams.get('sort');
    if (raw === 'price-asc' || raw === 'price-desc' || raw === 'reco') return raw;
    return 'reco';
  }, [searchParams]);
  const page = useMemo(() => {
    const raw = searchParams.get('page') ?? '1';
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [searchParams]);

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      setIsSearchLoading(true);
      fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}&limit=500`)
        .then((res) => res.json())
        .then((data) => {
          if (data.products) setAllProducts(data.products);
        })
        .catch(console.error)
        .finally(() => setIsSearchLoading(false));
    } else {
      fetch('/api/products?limit=500')
        .then((res) => res.json())
        .then((data) => {
          if (data.products) setAllProducts(data.products);
        })
        .catch(console.error);
    }
  }, [query]);

  const updateSearchParams = (mutate: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams.toString());
    mutate(sp);
    const qs = sp.toString();
    router.replace(qs ? `/boutique?${qs}` : '/boutique', { scroll: false });
  };



  const categories = useMemo(() => {
    const predefined = [
      'Dermo-Corner', 'Promotions !', 'K-Beauty', 'Corps', 'Visage', 'Cheveux',
      'Hygiène Dentaire', 'Maquillage', 'Hygiène & Intimité', 'Hygiène',
      'Accessoires', 'Minceur', 'Sport', 'Maman & Bébé', 'Hommes', 'Santé',
      'Préoccupations', 'Compléments Alimentaires', 'Premium Hair Care'
    ];
    const set = new Set<string>(predefined);
    for (const p of allProducts) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const keywords = normalized.split(/\s+/).filter(Boolean);

    let list = allProducts.filter((p) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (onlyPromos && !(typeof p.oldPrice === 'number' && p.oldPrice > p.price)) return false;
      if (onlyNew && p.badge !== 'Nouveau') return false;
      // When query is present, text search is already handled by API
      if (keywords.length > 0) return true;
      return true;
    });

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, onlyNew, onlyPromos, selectedCategories, sort, allProducts]);

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, filteredProducts.length);
  const visibleProducts = filteredProducts.slice(pageStart, pageEnd);

  const openFilters = () => {
    if (typeof document !== 'undefined') {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsFilterOpen(true);
  };

  const closeFilters = () => setIsFilterOpen(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('shopSidebarCollapsed', isSidebarCollapsed ? '1' : '0');
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!isFilterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFilters();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      const toRestore = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (toRestore) requestAnimationFrame(() => toRestore.focus());
    };
  }, [isFilterOpen]);

  const FiltersContent = (
    <div className="shop-filters">
      <details className="shop-filter-accordion" open>
        <summary className="shop-filter-summary">Catégories</summary>
        <div className="shop-filter-panel">
          <div className="shop-filters-options">
            {categories.map((cat) => {
              const checked = selectedCategories.includes(cat);
              return (
                <label key={cat} className="shop-filter-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedCategories, cat]
                        : selectedCategories.filter((c) => c !== cat);
                      updateSearchParams((sp) => {
                        if (next.length > 0) sp.set('category', next.join(','));
                        else sp.delete('category');
                        sp.set('page', '1');
                      });
                    }}
                  />
                  <span>{cat}</span>
                </label>
              );
            })}
          </div>
        </div>
      </details>

      <details className="shop-filter-accordion" open>
        <summary className="shop-filter-summary">Options</summary>
        <div className="shop-filter-panel">
          <div className="shop-filters-options">
            <label className="shop-filter-option">
              <input
                type="checkbox"
                checked={onlyPromos}
                onChange={(e) => {
                  updateSearchParams((sp) => {
                    if (e.target.checked) sp.set('promo', '1');
                    else sp.delete('promo');
                    sp.set('page', '1');
                  });
                }}
              />
              <span>Promotions seulement</span>
            </label>

            <label className="shop-filter-option">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={(e) => {
                  updateSearchParams((sp) => {
                    if (e.target.checked) sp.set('new', '1');
                    else sp.delete('new');
                    sp.set('page', '1');
                  });
                }}
              />
              <span>Nouveautés</span>
            </label>
          </div>
        </div>
      </details>

      <button
        type="button"
        className="shop-filters-reset"
        onClick={() => {
          updateSearchParams((sp) => {
            sp.delete('q');
            sp.delete('category');
            sp.delete('promo');
            sp.delete('new');
            sp.delete('sort');
            sp.delete('page');
          });
        }}
      >
        Réinitialiser
      </button>
    </div>
  );

  return (
    <>
      <section className="shop-page shop-page-minimal py-3xl">
          <div className="container">
            <div className="shop-header">
              <div className="shop-title">
                <h1 className="section-title-premium">Tous les produits</h1>
                <div className="shop-count">{filteredProducts.length} produits</div>
              </div>

              <div className="shop-actions">


                <select
                  className="shop-sort"
                  value={sort}
                  onChange={(e) => {
                    const value = e.target.value as SortKey;
                    updateSearchParams((sp) => {
                      if (value === 'reco') sp.delete('sort');
                      else sp.set('sort', value);
                      sp.set('page', '1');
                    });
                  }}
                >
                  <option value="reco">Tri: recommandé</option>
                  <option value="price-asc">Prix: croissant</option>
                  <option value="price-desc">Prix: décroissant</option>
                </select>

                <button type="button" className="shop-filter-btn" onClick={openFilters} aria-label="Filtres">
                  <SlidersHorizontal size={18} />
                  <span>Filtres</span>
                </button>
              </div>
            </div>

            <div className={`shop-layout ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
              <aside className={`shop-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} aria-label="Filtres">
                <button
                  type="button"
                  className="shop-sidebar-toggle"
                  aria-label={isSidebarCollapsed ? 'Afficher les filtres' : 'Masquer les filtres'}
                  aria-expanded={!isSidebarCollapsed}
                  onClick={() => setIsSidebarCollapsed((v) => !v)}
                >
                  {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  <span className="shop-sidebar-toggle-label">Filtres</span>
                </button>
                {!isSidebarCollapsed ? FiltersContent : null}
              </aside>

              <div className="shop-results">
                <div className="shop-range" aria-label="Résultats affichés">
                  {filteredProducts.length === 0 ? (
                    <span>0 résultat</span>
                  ) : (
                    <span>
                      Affichage {pageStart + 1}–{pageEnd} sur {filteredProducts.length}
                    </span>
                  )}
                </div>

                <div className="shop-grid" aria-label="Liste des produits">
                  {visibleProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      label={p.brand}
                      onNavigate={() => router.push(productHref(p))}
                      onAddToCart={() => addToCart(p)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="shop-pagination" aria-label="Pagination">
                    <button
                      type="button"
                      className="shop-page-btn"
                      onClick={() =>
                        updateSearchParams((sp) => {
                          const next = Math.max(1, safePage - 1);
                          if (next <= 1) sp.delete('page');
                          else sp.set('page', String(next));
                        })
                      }
                      disabled={safePage <= 1}
                    >
                      Précédent
                    </button>
                    <div className="shop-page-indicator">
                      Page {safePage} / {totalPages}
                    </div>
                    <button
                      type="button"
                      className="shop-page-btn"
                      onClick={() =>
                        updateSearchParams((sp) => {
                          const next = Math.min(totalPages, safePage + 1);
                          if (next <= 1) sp.delete('page');
                          else sp.set('page', String(next));
                        })
                      }
                      disabled={safePage >= totalPages}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(query || selectedCategories.length > 0 || onlyPromos || onlyNew) && (
            <div className="container" style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '40px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '20px', color: '#111' }}>
                Vous cherchez d'autres pépites ?
              </h3>
              <button 
                type="button" 
                onClick={() => {
                  updateSearchParams((sp) => {
                    sp.delete('q');
                    sp.delete('category');
                    sp.delete('promo');
                    sp.delete('new');
                    sp.delete('sort');
                    sp.delete('page');
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 36px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: '4px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(225, 0, 116, 0.15)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                }}
              >
                Explorer toute la boutique
              </button>
            </div>
          )}
        </section>

      <div className={`shop-filter-backdrop ${isFilterOpen ? 'open' : ''}`} onClick={closeFilters} />
      <aside className={`shop-filter-drawer ${isFilterOpen ? 'open' : ''}`} aria-label="Filtres">
        <div className="shop-filter-drawer-header">
          <div className="shop-filter-drawer-title">Filtres</div>
          <button type="button" className="shop-filter-drawer-close" onClick={closeFilters} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="shop-filter-drawer-body">{FiltersContent}</div>
      </aside>
    </>
  );
}
