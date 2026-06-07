import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category } from './mockData';

interface CategoryFormModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoryFormModal({ category, isOpen, onClose, onSave }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [page, setPage] = useState('general');
  const [order, setOrder] = useState(0);
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setNameAr(category.nameAr || '');
        setSlug(category.slug);
        setDescription((category as any).description || '');
        setImage((category as any).image || '');
        setPage((category as any).page || 'general');
        setOrder((category as any).order ?? 0);
        setAutoSlug(false);
      } else {
        setName('');
        setNameAr('');
        setSlug('');
        setDescription('');
        setImage('');
        setPage('general');
        setOrder(0);
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
        description: description.trim() || null,
        image: image.trim() || null,
        page: page.trim() || 'general',
        order: Number(order) || 0,
        productCount: category?.productCount || 0,
      } as any);
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
              <label>Description</label>
              <textarea
                className="admin-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description de la catégorie"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                className="admin-input"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Page</label>
                <input
                  type="text"
                  className="admin-input"
                  value={page}
                  onChange={e => setPage(e.target.value)}
                  placeholder="general"
                />
                <span className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  ex: general, k-beauty, visage...
                </span>
              </div>
              <div className="form-group">
                <label>Ordre</label>
                <input
                  type="number"
                  className="admin-input"
                  value={order}
                  onChange={e => setOrder(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
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
