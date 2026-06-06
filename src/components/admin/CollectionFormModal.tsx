import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Collection } from './mockData';

interface CollectionFormModalProps {
  collection: Collection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (collection: Collection) => void;
  allCollections?: Collection[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CollectionFormModal({ collection, isOpen, onClose, onSave, allCollections = [] }: CollectionFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [page, setPage] = useState('general');
  const [order, setOrder] = useState(0);
  const [parentId, setParentId] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (collection) {
        setName(collection.name);
        setSlug(collection.slug);
        setPage(collection.page || 'general');
        setOrder(collection.order || 0);
        setParentId((collection as any).parentId || null);
        setAutoSlug(false);
      } else {
        setName('');
        setSlug('');
        setPage('general');
        setOrder(0);
        setParentId(null);
        setAutoSlug(true);
      }
    }
  }, [isOpen, collection]);

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
        id: collection?.id || `coll_${Date.now()}`,
        name: name.trim(),
        slug: slug || generateSlug(name),
        description: collection?.description || '',
        image: collection?.image || '',
        page: page || 'general',
        order: order || 0,
        parentId,
      } as Collection);
      setLoading(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const isEditing = !!collection;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Éditer la collection' : 'Nouvelle collection'}</h3>
          <button className="admin-mobile-close" onClick={onClose} style={{ display: 'block' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-col" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                className="admin-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ex: Corps & bain"
                required
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
                  placeholder="corps-bain"
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
            </div>

            <div className="form-group">
              <label>Page associée</label>
              <input
                type="text"
                className="admin-input"
                value={page}
                onChange={e => setPage(e.target.value)}
                placeholder="general"
              />
              <span className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                ex: corps, visage, cheveux, maquillage...
              </span>
            </div>

            <div className="form-group">
              <label>Ordre d'affichage</label>
              <input
                type="number"
                className="admin-input"
                value={order}
                onChange={e => setOrder(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <div className="form-group">
              <label>Collection parente</label>
              <select
                className="admin-select"
                value={parentId || ''}
                onChange={e => setParentId(e.target.value || null)}
                style={{ width: '100%' }}
              >
                <option value="">— Racine (aucune) —</option>
                {allCollections
                  .filter(c => c.id !== collection?.id)
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
