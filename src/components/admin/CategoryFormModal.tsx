import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category } from './mockData';

interface CategoryFormModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  allCategories?: Category[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoryFormModal({ category, isOpen, onClose, onSave, allCategories = [] }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setNameAr(category.nameAr);
        setSlug(category.slug);
        setParentId((category as any).parentId || null);
        setAutoSlug(false);
      } else {
        setName('');
        setNameAr('');
        setSlug('');
        setParentId(null);
        setAutoSlug(true);
      }
    }
  }, [isOpen, category]);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(generateSlug(name));
    }
  }, [name, autoSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setTimeout(() => {
      onSave({
        id: category?.id || `cat_${Date.now()}`,
        name: name.trim(),
        nameAr: nameAr.trim(),
        slug: slug || generateSlug(name),
        productCount: category?.productCount || 0,
        parentId,
      } as Category);
      setLoading(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const isEditing = !!category;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Éditer la catégorie' : 'Nouvelle catégorie'}</h3>
          <button className="admin-mobile-close" onClick={onClose} style={{ display: 'block' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-col" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label>Nom (Français) *</label>
              <input
                type="text"
                className="admin-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex: Soins du visage"
                required
              />
            </div>

            <div className="form-group">
              <label>Nom (Arabe)</label>
              <input
                type="text"
                className="admin-input"
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="العناية بالبشرة"
                dir="rtl"
              />
            </div>

            <div className="form-group">
              <label>Slug URL</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="admin-input"
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setAutoSlug(false); }}
                  placeholder="soins-du-visage"
                  style={{ flex: 1 }}
                />
                {!autoSlug && (
                  <button
                    type="button"
                    className="admin-btn-outline"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                    onClick={() => { setAutoSlug(true); setSlug(generateSlug(name)); }}
                  >
                    Auto
                  </button>
                )}
              </div>
              <span className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                URL : /boutique?category={slug || '...'}
              </span>
            </div>

            <div className="form-group">
              <label>Catégorie parente</label>
              <select
                className="admin-select"
                value={parentId || ''}
                onChange={e => setParentId(e.target.value || null)}
                style={{ width: '100%' }}
              >
                <option value="">— Racine (aucune) —</option>
                {allCategories
                  .filter(c => c.id !== category?.id)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-outline" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
