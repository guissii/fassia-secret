"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Cart, type CartItem } from './components/Cart';
import { publicAssetUrl } from './lib/publicUrl';
import { ALL_PRODUCTS } from './data/products';

const DEMO_CART_ITEMS: CartItem[] = [
  {
    id: 1,
    name: 'Derma Hydrating Serum',
    price: 180.0,
    image: '19bd7403-d2ac-49a4-a584-be5895add421.png',
    category: 'Visage',
    quantity: 1,
  },
  {
    id: 2,
    name: 'Hydra Boost Gel Cream',
    price: 199.0,
    oldPrice: 249.0,
    image: 'd6f902fd-0b09-48d0-8055-d03094820431.png',
    category: 'Visage',
    quantity: 2,
  },
];

type SortKey = 'reco' | 'price-asc' | 'price-desc';

export default function BoutiqueClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(DEMO_CART_ITEMS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  const updateSearchParams = (mutate: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams.toString());
    mutate(sp);
    const qs = sp.toString();
    router.replace(qs ? `/boutique?${qs}` : '/boutique', { scroll: false });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function handleUpdateQuantity(id: number, quantity: number) {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  function handleRemoveItem(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of ALL_PRODUCTS) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let list = ALL_PRODUCTS.filter((p) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (onlyPromos && !(typeof p.oldPrice === 'number' && p.oldPrice > p.price)) return false;
      if (onlyNew && p.badge !== 'Nouveau') return false;
      if (!normalized) return true;
      return (
        p.name.toLowerCase().includes(normalized) ||
        p.brand.toLowerCase().includes(normalized) ||
        p.category.toLowerCase().includes(normalized)
      );
    });

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, onlyPromos, selectedCategories, sort]);

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, filteredProducts.length);
  const visibleProducts = filteredProducts.slice(pageStart, pageEnd);

  const formatPrice = (price: number) => price.toFixed(2) + ' MAD';

  const openFilters = () => {
    if (typeof document !== 'undefined') {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsFilterOpen(true);
  };

  const closeFilters = () => setIsFilterOpen(false);

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
      <div className="shop-filters-group">
        <div className="shop-filters-title">Catégories</div>
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

      <div className="shop-filters-group">
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
      </div>

      <div className="shop-filters-group">
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
    <div className="app-container">
      <Header onCartOpen={() => setIsCartOpen(true)} cartCount={totalCartCount} />
      <main>
        <section className="shop-page py-3xl">
          <div className="container">
            <div className="shop-header">
              <div className="shop-title">
                <h1 className="section-title-premium">Tous les produits</h1>
                <div className="shop-count">{filteredProducts.length} produits</div>
              </div>

              <div className="shop-actions">
                <input
                  className="shop-search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateSearchParams((sp) => {
                      if (value.trim()) sp.set('q', value);
                      else sp.delete('q');
                      sp.set('page', '1');
                    });
                  }}
                  placeholder="Rechercher (marque, produit, catégorie)"
                />

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

            <div className="shop-layout">
              <aside className="shop-sidebar" aria-label="Filtres">
                {FiltersContent}
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
                  <article key={p.id} className="product-card" aria-label={p.name}>
                    <div className="product-image-area">
                      <div className="product-image-frame">
                        <img
                          src={publicAssetUrl(p.image)}
                          alt={p.name}
                          className="product-image"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      {(typeof p.oldPrice === 'number' && p.oldPrice > p.price) || p.badge ? (
                        <span className="product-badge" style={{ backgroundColor: 'var(--color-primary)' }}>
                          {p.badge ?? 'Promo'}
                        </span>
                      ) : null}
                    </div>

                    <div className="product-content">
                      <span className="product-category-label">{p.brand}</span>
                      <h3 className="product-name">{p.name}</h3>
                      <p className="product-description">{p.description}</p>
                      <div className="product-footer-row">
                        <div className="product-price-row" aria-label="Prix">
                          <span className="price-current">{formatPrice(p.price)}</span>
                          {typeof p.oldPrice === 'number' && p.oldPrice > p.price && (
                            <span className="price-old">{formatPrice(p.oldPrice)}</span>
                          )}
                        </div>
                        <button className="product-cta-circle" type="button" aria-label={`Ajouter ${p.name} au panier`}>
                          +
                        </button>
                      </div>
                    </div>
                  </article>
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
        </section>
      </main>
      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

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
    </div>
  );
}
