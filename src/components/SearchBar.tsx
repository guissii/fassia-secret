import { Search, X, Loader2 } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { RefObject } from 'react';
import { productHref } from '../lib/productSlug';

interface SearchResult {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
}

interface SearchBarProps {
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function SearchBar({ className = '', inputRef }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ownInputRef = useRef<HTMLInputElement>(null);
  const effectiveInputRef = inputRef || ownInputRef;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, 150);

  const MIN_CHARS = 2;

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q.trim())}&limit=8`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSuggestions(data.products || []);
      setIsOpen((data.products || []).length > 0);
      setHighlightedIndex(-1);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        effectiveInputRef.current &&
        !effectiveInputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [effectiveInputRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/boutique');
    }
  };

  const handleSelect = (product: SearchResult) => {
    setIsOpen(false);
    setQuery(product.name);
    router.push(productHref(product));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (highlightedIndex + 1) % suggestions.length;
      setHighlightedIndex(next);
      setQuery(suggestions[next].name);
      scrollSuggestionIntoView(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (highlightedIndex - 1 + suggestions.length) % suggestions.length;
      setHighlightedIndex(prev);
      setQuery(suggestions[prev].name);
      scrollSuggestionIntoView(prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const scrollSuggestionIntoView = (index: number) => {
    const el = document.querySelector(`[data-suggestion-index="${index}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const highlightMatch = (text: string, match: string) => {
    if (!match) return text;
    const regex = new RegExp(`(${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <strong key={i} className="search-highlight">{part}</strong> : <span key={i}>{part}</span>
    );
  };

  return (
    <div className={`search-bar-wrapper ${className}`} ref={dropdownRef}>
      <form className="search-bar flex" onSubmit={handleSubmit}>
        <input
          ref={effectiveInputRef as RefObject<HTMLInputElement | null>}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 || (query.trim().length >= MIN_CHARS && isLoading)) {
              setIsOpen(true);
            }
          }}
          placeholder="Rechercher un produit, une marque..."
          aria-label="Rechercher un produit, une marque"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={isOpen}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
              effectiveInputRef.current?.focus();
            }}
            aria-label="Effacer la recherche"
          >
            <X size={16} />
          </button>
        )}
        {isLoading && <Loader2 size={18} className="search-spinner" />}
        <button className="btn-primary search-btn" aria-label="Rechercher" type="submit">
          <Search size={20} />
        </button>
      </form>

      {isOpen && (
        <div
          id="search-suggestions"
          className="search-dropdown"
          role="listbox"
        >
          {isLoading ? (
            <div className="search-dropdown-empty">
              <Loader2 size={20} className="search-spinner-inline" />
              <span>Recherche en cours...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="search-dropdown-empty">
              {query.trim().length >= MIN_CHARS ? (
                <span>Aucun produit trouvé pour &quot;{query.trim()}&quot;</span>
              ) : (
                <span>Saisissez au moins {MIN_CHARS} caractères</span>
              )}
            </div>
          ) : (
            <>
              {suggestions.map((product, index) => (
                <Link
                  key={product.id}
                  href={productHref(product)}
                  data-suggestion-index={index}
                  className={`search-suggestion ${index === highlightedIndex ? 'highlighted' : ''}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <img
                    src={product.image || '/images/placeholder.png'}
                    alt=""
                    className="search-suggestion-img"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                  />
                  <div className="search-suggestion-text">
                    <div className="search-suggestion-name">
                      {highlightMatch(product.name, debouncedQuery)}
                    </div>
                    <div className="search-suggestion-brand">{product.brand}</div>
                  </div>
                  <div className="search-suggestion-price">{product.price.toFixed(2)} MAD</div>
                </Link>
              ))}
              <div className="search-dropdown-footer">
                <Link
                  href={`/boutique?q=${encodeURIComponent(query.trim())}`}
                  className="search-see-all"
                  onClick={() => setIsOpen(false)}
                >
                  Voir tous les résultats pour &quot;{query.trim()}&quot;
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
