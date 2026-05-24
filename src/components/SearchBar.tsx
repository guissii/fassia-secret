import { Search } from 'lucide-react';
import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { RefObject } from 'react';

interface SearchBarProps {
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchBar({ className = '', inputRef }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initialQuery = searchParams.get('q') || '';

  const handleSearch = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        sp.set('q', value.trim());
      } else {
        sp.delete('q');
      }
      
      router.push(`/boutique?${sp.toString()}`);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // We get the current value from the input ref if available, 
    // otherwise fallback to a basic form submit logic
    const currentVal = inputRef?.current?.value || (e.currentTarget.querySelector('input') as HTMLInputElement).value;
    
    const sp = new URLSearchParams(searchParams.toString());
    if (currentVal.trim()) {
      sp.set('q', currentVal.trim());
    } else {
      sp.delete('q');
    }
    router.push(`/boutique?${sp.toString()}`);
  };

  return (
    <form className={`search-bar flex ${className}`} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        defaultValue={initialQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Rechercher un produit, une marque..."
        aria-label="Rechercher un produit, une marque"
      />
      <button className="btn-primary search-btn" aria-label="Rechercher" type="submit">
        <Search size={20} />
      </button>
    </form>
  );
}
