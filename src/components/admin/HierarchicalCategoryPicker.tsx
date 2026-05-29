import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check, Search, Folder, FolderOpen, Tag } from 'lucide-react';
import { CATEGORY_COLLECTIONS_DATA, CategoryCollectionMapping } from './categoryCollectionsData';
import './HierarchicalCategoryPicker.css';

export interface CategorySelection {
  categorySlug: string;
  categoryName: string;
  collections: string[];
}

interface HierarchicalCategoryPickerProps {
  selected: CategorySelection[];
  onChange: (selections: CategorySelection[]) => void;
  placeholder?: string;
}

export function HierarchicalCategoryPicker({ 
  selected, 
  onChange, 
  placeholder = "Rechercher catégories et collections..." 
}: HierarchicalCategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Expand categories that have selections
  useEffect(() => {
    const slugsWithSelections = new Set(selected.map(s => s.categorySlug));
    setExpandedCategories(prev => {
      const next = new Set(prev);
      slugsWithSelections.forEach(slug => next.add(slug));
      return next;
    });
  }, [selected]);

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const isCategorySelected = (slug: string): boolean => {
    return selected.some(s => s.categorySlug === slug);
  };

  const getCategorySelection = (slug: string): CategorySelection | undefined => {
    return selected.find(s => s.categorySlug === slug);
  };

  const isCollectionSelected = (categorySlug: string, collection: string): boolean => {
    const catSel = getCategorySelection(categorySlug);
    return catSel ? catSel.collections.includes(collection) : false;
  };

  const handleCategoryToggle = (category: CategoryCollectionMapping) => {
    const existing = getCategorySelection(category.slug);
    if (existing) {
      // Remove category (and all its collections)
      onChange(selected.filter(s => s.categorySlug !== category.slug));
    } else {
      // Add category with no collections initially
      onChange([
        ...selected,
        {
          categorySlug: category.slug,
          categoryName: category.category,
          collections: []
        }
      ]);
      // Auto-expand when selecting
      setExpandedCategories(prev => new Set(prev).add(category.slug));
    }
  };

  const handleCollectionToggle = (category: CategoryCollectionMapping, collection: string) => {
    const existingIndex = selected.findIndex(s => s.categorySlug === category.slug);
    
    if (existingIndex === -1) {
      // Category not selected yet, add it with this collection
      onChange([
        ...selected,
        {
          categorySlug: category.slug,
          categoryName: category.category,
          collections: [collection]
        }
      ]);
    } else {
      // Category exists, toggle this collection
      const existing = selected[existingIndex];
      const hasCollection = existing.collections.includes(collection);
      
      const newCollections = hasCollection
        ? existing.collections.filter(c => c !== collection)
        : [...existing.collections, collection];
      
      const newSelected = [...selected];
      newSelected[existingIndex] = {
        ...existing,
        collections: newCollections
      };
      
      // If no collections left, keep the category selected but with empty collections
      // User might want to select just the category without specific collections
      onChange(newSelected);
    }
  };

  const removeSelection = (categorySlug: string, collection?: string) => {
    if (collection) {
      // Remove specific collection
      const existingIndex = selected.findIndex(s => s.categorySlug === categorySlug);
      if (existingIndex !== -1) {
        const existing = selected[existingIndex];
        const newCollections = existing.collections.filter(c => c !== collection);
        
        const newSelected = [...selected];
        newSelected[existingIndex] = {
          ...existing,
          collections: newCollections
        };
        onChange(newSelected);
      }
    } else {
      // Remove entire category
      onChange(selected.filter(s => s.categorySlug !== categorySlug));
    }
  };

  // Filter categories and collections based on search
  const filteredData = CATEGORY_COLLECTIONS_DATA.filter(cat => {
    const searchLower = search.toLowerCase();
    const categoryMatch = cat.category.toLowerCase().includes(searchLower) ||
                         cat.categoryAr.toLowerCase().includes(searchLower);
    const collectionMatch = cat.collections.some(c => c.toLowerCase().includes(searchLower));
    return categoryMatch || collectionMatch;
  });

  // Count total selections
  const totalSelections = selected.reduce((acc, s) => acc + 1 + s.collections.length, 0);

  return (
    <div className="hierarchical-picker" ref={wrapperRef}>
      {/* Selected items display */}
      {selected.length > 0 && (
        <div className="hierarchical-selected-chips">
          {selected.map(catSel => (
            <React.Fragment key={catSel.categorySlug}>
              {/* Category chip */}
              <span className="hierarchical-chip category-chip">
                <Folder size={12} />
                {catSel.categoryName}
                <button 
                  type="button" 
                  onClick={() => removeSelection(catSel.categorySlug)}
                  aria-label={`Retirer ${catSel.categoryName}`}
                >
                  <X size={12} />
                </button>
              </span>
              
              {/* Collection chips */}
              {catSel.collections.map(coll => (
                <span key={`${catSel.categorySlug}-${coll}`} className="hierarchical-chip collection-chip">
                  <Tag size={10} />
                  {coll}
                  <button 
                    type="button" 
                    onClick={() => removeSelection(catSel.categorySlug, coll)}
                    aria-label={`Retirer ${coll}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Trigger / search input */}
      <div 
        className={`hierarchical-trigger ${isOpen ? 'is-open' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <Search size={14} className="hierarchical-search-icon" />
        <input
          type="text"
          className="hierarchical-input"
          placeholder={selected.length === 0 ? placeholder : `${totalSelections} sélection(s)...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown size={16} className={`hierarchical-chevron ${isOpen ? 'rotated' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="hierarchical-dropdown">
          {filteredData.length === 0 ? (
            <div className="hierarchical-empty">Aucun résultat</div>
          ) : (
            <div className="hierarchical-list">
              {filteredData.map(category => {
                const isSelected = isCategorySelected(category.slug);
                const isExpanded = expandedCategories.has(category.slug);
                const catSelection = getCategorySelection(category.slug);
                const selectedCount = catSelection?.collections.length || 0;
                
                // Filter collections if searching
                const searchLower = search.toLowerCase();
                const showingCollections = search 
                  ? category.collections.filter(c => c.toLowerCase().includes(searchLower))
                  : category.collections;
                
                // Always show if category matches or has matching collections
                const categoryMatches = category.category.toLowerCase().includes(searchLower) ||
                                       category.categoryAr.toLowerCase().includes(searchLower);
                
                return (
                  <div 
                    key={category.slug} 
                    className={`hierarchical-category ${isSelected ? 'is-selected' : ''} ${isExpanded ? 'is-expanded' : ''}`}
                  >
                    {/* Category header */}
                    <div 
                      className="hierarchical-category-header"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <span className="hierarchical-check">
                        {isSelected && <Check size={14} />}
                      </span>
                      <span className="hierarchical-folder-icon">
                        {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                      </span>
                      <span className="hierarchical-category-name">
                        {category.category}
                        <span className="hierarchical-category-ar">{category.categoryAr}</span>
                      </span>
                      {selectedCount > 0 && (
                        <span className="hierarchical-collection-count">
                          {selectedCount} collection{selectedCount > 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        type="button"
                        className="hierarchical-expand-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category.slug);
                        }}
                      >
                        <ChevronDown size={16} className={isExpanded ? 'rotated' : ''} />
                      </button>
                    </div>
                    
                    {/* Collections list */}
                    {(isExpanded || (search && showingCollections.length > 0)) && (
                      <div className="hierarchical-collections">
                        {showingCollections.map(collection => {
                          const collSelected = isCollectionSelected(category.slug, collection);
                          return (
                            <button
                              key={`${category.slug}-${collection}`}
                              type="button"
                              className={`hierarchical-collection ${collSelected ? 'is-selected' : ''}`}
                              onClick={() => handleCollectionToggle(category, collection)}
                            >
                              <span className="hierarchical-check-small">
                                {collSelected && <Check size={12} />}
                              </span>
                              <Tag size={12} className="hierarchical-tag-icon" />
                              {collection}
                            </button>
                          );
                        })}
                        
                        {showingCollections.length === 0 && search && (
                          <div className="hierarchical-no-collections">
                            Aucune collection ne correspond à la recherche
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="hierarchical-footer">
            <span className="hierarchical-summary">
              {selected.length} catégorie{selected.length > 1 ? 'ies' : 'ie'}, {' '}
              {selected.reduce((acc, s) => acc + s.collections.length, 0)} collection(s)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
