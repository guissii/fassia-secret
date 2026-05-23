import { Search } from 'lucide-react';
import type { RefObject } from 'react';

interface SearchBarProps {
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchBar({ className = '', inputRef }: SearchBarProps) {
  return (
    <div className={`search-bar flex ${className}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Rechercher un produit, une marque..."
        aria-label="Rechercher un produit, une marque"
      />
      <button className="btn-primary search-btn" aria-label="Rechercher" type="button">
        <Search size={20} />
      </button>
    </div>
  );
}
